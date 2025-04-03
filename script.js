document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const apiForm = document.getElementById('api-form');
    const apiKeyInput = document.getElementById('api-key');
    const saveApiKeyBtn = document.getElementById('save-api-key');
    const apiProviderSelect = document.getElementById('api-provider');
    const customEndpointContainer = document.getElementById('custom-endpoint-container');
    const customEndpointInput = document.getElementById('custom-endpoint');
    const modelSelect = document.getElementById('model-select');
    const temperatureSlider = document.getElementById('temperature');
    const temperatureValue = document.getElementById('temperature-value');
    const maxTokensInput = document.getElementById('max-tokens');
    const messagesContainer = document.getElementById('messages');
    const userInput = document.getElementById('user-input');
    const messageForm = document.getElementById('message-form');
    const sendButton = document.getElementById('send-button');
    const settingsToggle = document.getElementById('settings-toggle');
    const advancedToggle = document.getElementById('advanced-toggle');
    const advancedOptions = document.getElementById('advanced-options');
    const connectionStatus = document.getElementById('connection-status');
    const modelInfo = document.getElementById('model-info');

    // Application state
    const state = {
        apiKey: localStorage.getItem('apiKey') || '',
        apiProvider: localStorage.getItem('apiProvider') || 'openai',
        customEndpoint: localStorage.getItem('customEndpoint') || '',
        selectedModel: localStorage.getItem('selectedModel') || 'gpt-3.5-turbo',
        temperature: parseFloat(localStorage.getItem('temperature')) || 0.7,
        maxTokens: parseInt(localStorage.getItem('maxTokens')) || 1000,
        messages: [],
        isConnected: false,
        isSending: false,
        settingsVisible: true,
        advancedOptionsVisible: false,
        modelsMap: {
            openai: [
                { id: 'gpt-4', name: 'GPT-4' },
                { id: 'gpt-4-turbo', name: 'GPT-4 Turbo' },
                { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo' }
            ],
            anthropic: [
                { id: 'claude-3-opus', name: 'Claude 3 Opus' },
                { id: 'claude-3-sonnet', name: 'Claude 3 Sonnet' },
                { id: 'claude-3-haiku', name: 'Claude 3 Haiku' },
                { id: 'claude-2', name: 'Claude 2' }
            ],
            google: [
                { id: 'gemini-pro', name: 'Gemini Pro' },
                { id: 'gemini-ultra', name: 'Gemini Ultra' }
            ],
            mistral: [
                { id: 'mistral-large', name: 'Mistral Large' },
                { id: 'mistral-medium', name: 'Mistral Medium' },
                { id: 'mistral-small', name: 'Mistral Small' }
            ],
            custom: [
                { id: 'custom-model', name: 'Custom Model' }
            ]
        }
    };

    // Initialize the application
    function init() {
        loadSavedSettings();
        setupEventListeners();
        updateUIState();
        checkConnection();
        autoResizeTextarea();
    }

    // Load saved settings from localStorage
    function loadSavedSettings() {
        if (state.apiKey) {
            apiKeyInput.value = '********'; // Don't show the actual API key
            sendButton.disabled = false;
            state.isConnected = true;
        }

        apiProviderSelect.value = state.apiProvider;
        updateModelOptions();
        
        modelSelect.value = state.selectedModel;
        temperatureSlider.value = state.temperature;
        temperatureValue.textContent = state.temperature;
        maxTokensInput.value = state.maxTokens;

        if (state.apiProvider === 'custom') {
            customEndpointContainer.classList.remove('hidden');
            customEndpointInput.value = state.customEndpoint;
        }
    }

    // Set up all event listeners
    function setupEventListeners() {
        // API Key saving
        saveApiKeyBtn.addEventListener('click', saveApiKey);
        
        // Provider change
        apiProviderSelect.addEventListener('change', (e) => {
            state.apiProvider = e.target.value;
            localStorage.setItem('apiProvider', state.apiProvider);
            
            // Show/hide custom endpoint field
            if (state.apiProvider === 'custom') {
                customEndpointContainer.classList.remove('hidden');
            } else {
                customEndpointContainer.classList.add('hidden');
            }
            
            updateModelOptions();
            checkConnection();
        });
        
        // Custom endpoint change
        customEndpointInput.addEventListener('change', (e) => {
            state.customEndpoint = e.target.value;
            localStorage.setItem('customEndpoint', state.customEndpoint);
        });
        
        // Model selection
        modelSelect.addEventListener('change', (e) => {
            state.selectedModel = e.target.value;
            localStorage.setItem('selectedModel', state.selectedModel);
            updateModelInfo();
        });
        
        // Temperature slider
        temperatureSlider.addEventListener('input', (e) => {
            state.temperature = parseFloat(e.target.value);
            temperatureValue.textContent = state.temperature;
            localStorage.setItem('temperature', state.temperature);
        });
        
        // Max tokens input
        maxTokensInput.addEventListener('change', (e) => {
            state.maxTokens = parseInt(e.target.value);
            localStorage.setItem('maxTokens', state.maxTokens);
        });
        
        // Send message
        messageForm.addEventListener('submit', sendMessage);
        
        // Settings toggle
        settingsToggle.addEventListener('click', () => {
            state.settingsVisible = !state.settingsVisible;
            updateUIState();
        });
        
        // Advanced options toggle
        advancedToggle.addEventListener('click', () => {
            state.advancedOptionsVisible = !state.advancedOptionsVisible;
            
            if (state.advancedOptionsVisible) {
                advancedOptions.classList.remove('hidden');
                advancedToggle.classList.add('active');
            } else {
                advancedOptions.classList.add('hidden');
                advancedToggle.classList.remove('active');
            }
        });

        // Auto-resize textarea
        userInput.addEventListener('input', autoResizeTextarea);
    }

    // Resize the textarea as the user types
    function autoResizeTextarea() {
        userInput.style.height = 'auto';
        userInput.style.height = (userInput.scrollHeight) + 'px';
    }

    // Update model dropdown options based on selected provider
    function updateModelOptions() {
        modelSelect.innerHTML = '';
        
        const models = state.modelsMap[state.apiProvider] || [];
        models.forEach(model => {
            const option = document.createElement('option');
            option.value = model.id;
            option.textContent = model.name;
            modelSelect.appendChild(option);
        });
        
        // Select first model by default if current selection not available
        if (!models.some(m => m.id === state.selectedModel)) {
            state.selectedModel = models[0]?.id || '';
            localStorage.setItem('selectedModel', state.selectedModel);
        }
        
        updateModelInfo();
    }

    // Update the model info in the status bar
    function updateModelInfo() {
        if (state.selectedModel) {
            const models = state.modelsMap[state.apiProvider] || [];
            const selectedModel = models.find(m => m.id === state.selectedModel) || { name: state.selectedModel };
            modelInfo.textContent = `${selectedModel.name} (${state.apiProvider})`;
        } else {
            modelInfo.textContent = 'No model selected';
        }
    }

    // Save API key to localStorage
    function saveApiKey() {
        const key = apiKeyInput.value;
        if (key && key !== '********') {
            state.apiKey = key;
            localStorage.setItem('apiKey', key);
            apiKeyInput.value = '********';
            
            addSystemMessage('API key saved. You can now send messages.');
            checkConnection();
        } else if (!key) {
            // User is removing the API key
            state.apiKey = '';
            localStorage.removeItem('apiKey');
            
            addSystemMessage('API key removed.');
            checkConnection();
        }
    }

    // Check connection status
    function checkConnection() {
        if (state.apiKey) {
            state.isConnected = true;
            sendButton.disabled = false;
            connectionStatus.innerHTML = '<i class="fas fa-circle connected"></i> Connected';
        } else {
            state.isConnected = false;
            sendButton.disabled = true;
            connectionStatus.innerHTML = '<i class="fas fa-circle disconnected"></i> Disconnected';
        }
    }

    // Update UI based on state
    function updateUIState() {
        if (!state.settingsVisible) {
            apiForm.style.display = 'none';
        } else {
            apiForm.style.display = 'block';
        }
    }

    // Add a message to the chat
    function addMessage(text, type = 'user') {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        
        // Add markdown parsing for assistant messages
        if (type === 'assistant') {
            contentDiv.innerHTML = parseMarkdown(text);
        } else {
            const p = document.createElement('p');
            p.textContent = text;
            contentDiv.appendChild(p);
        }
        
        messageDiv.appendChild(contentDiv);
        
        // Add timestamp
        const timeDiv = document.createElement('div');
        timeDiv.className = 'message-time';
        timeDiv.textContent = new Date().toLocaleTimeString();
        messageDiv.appendChild(timeDiv);
        
        messagesContainer.appendChild(messageDiv);
        
        // Store the message in state
        state.messages.push({ role: type, content: text });
        
        // Scroll to bottom
        scrollToBottom();
        
        return messageDiv;
    }

    // Add a system message (in the center)
    function addSystemMessage(text) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message system';
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        
        const p = document.createElement('p');
        p.textContent = text;
        contentDiv.appendChild(p);
        
        messageDiv.appendChild(contentDiv);
        messagesContainer.appendChild(messageDiv);
        
        scrollToBottom();
    }

    // Add a typing indicator
    function addTypingIndicator() {
        const indicatorDiv = document.createElement('div');
        indicatorDiv.className = 'message assistant';
        indicatorDiv.id = 'typing-indicator';
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content typing-indicator';
        
        for (let i = 0; i < 3; i++) {
            const span = document.createElement('span');
            contentDiv.appendChild(span);
        }
        
        indicatorDiv.appendChild(contentDiv);
        messagesContainer.appendChild(indicatorDiv);
        
        scrollToBottom();
    }

    // Remove the typing indicator
    function removeTypingIndicator() {
        const indicator = document.getElementById('typing-indicator');
        if (indicator) {
            indicator.remove();
        }
    }

    // Scroll to the bottom of the chat
    function scrollToBottom() {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    // Parse markdown in AI responses
    function parseMarkdown(text) {
        // Code blocks
        text = text.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
        
        // Inline code
        text = text.replace(/`([^`]+)`/g, '<code>$1</code>');
        
        // Bold
        text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        
        // Italic
        text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
        
        // Links
        text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');
        
        // Lists
        text = text.replace(/^\s*-\s+(.*)/gm, '<li>$1</li>');
        text = text.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
        
        // Headings
        text = text.replace(/^### (.*$)/gm, '<h3>$1</h3>');
        text = text.replace(/^## (.*$)/gm, '<h2>$1</h2>');
        text = text.replace(/^# (.*$)/gm, '<h1>$1</h1>');
        
        // Paragraphs (replace line breaks)
        text = text.replace(/\n\s*\n/g, '</p><p>');
        text = text.replace(/\n/g, '<br>');
        
        // Wrap in paragraph if not already wrapped
        if (!text.startsWith('<')) {
            text = '<p>' + text + '</p>';
        }
        
        return text;
    }

    // Send message to API
    async function sendMessage(e) {
        e.preventDefault();
        
        const userMessage = userInput.value.trim();
        if (!userMessage || state.isSending || !state.apiKey) return;
        
        // Add user message to chat
        addMessage(userMessage, 'user');
        
        // Clear input
        userInput.value = '';
        autoResizeTextarea();
        
        // Show typing indicator
        addTypingIndicator();
        
        // Disable send button while sending
        state.isSending = true;
        sendButton.disabled = true;
        
        try {
            const response = await fetchChatResponse(userMessage);
            removeTypingIndicator();
            
            // Add AI response to chat
            if (response) {
                addMessage(response, 'assistant');
            } else {
                addSystemMessage('Error: No response from the API.');
            }
        } catch (error) {
            removeTypingIndicator();
            addSystemMessage(`Error: ${error.message}`);
            console.error('API Error:', error);
        } finally {
            // Re-enable send button
            state.isSending = false;
            sendButton.disabled = false;
        }
    }

    // Fetch response from the API
    async function fetchChatResponse(userMessage) {
        let endpoint, headers, body;
        
        // Format conversation history for the API request
        const history = formatConversationHistory();
        
        switch (state.apiProvider) {
            case 'openai':
                endpoint = 'https://api.openai.com/v1/chat/completions';
                headers = {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${state.apiKey}`
                };
                body = {
                    model: state.selectedModel,
                    messages: [...history, { role: 'user', content: userMessage }],
                    temperature: state.temperature,
                    max_tokens: state.maxTokens
                };
                break;
                
            case 'anthropic':
                endpoint = 'https://api.anthropic.com/v1/messages';
                headers = {
                    'Content-Type': 'application/json',
                    'x-api-key': state.apiKey,
                    'anthropic-version': '2023-06-01'
                };
                body = {
                    model: state.selectedModel,
                    messages: [...history, { role: 'user', content: userMessage }],
                    temperature: state.temperature,
                    max_tokens: state.maxTokens
                };
                break;
                
            case 'google':
                endpoint = 'https://generativelanguage.googleapis.com/v1beta/models/' + 
                          state.selectedModel + ':generateContent?key=' + state.apiKey;
                headers = {
                    'Content-Type': 'application/json'
                };
                
                // Format messages for Google's API
                const googleMessages = history.map(msg => ({
                    role: msg.role === 'assistant' ? 'model' : 'user',
                    parts: [{ text: msg.content }]
                }));
                
                googleMessages.push({
                    role: 'user',
                    parts: [{ text: userMessage }]
                });
                
                body = {
                    contents: googleMessages,
                    generationConfig: {
                        temperature: state.temperature,
                        maxOutputTokens: state.maxTokens
                    }
                };
                break;
                
            case 'mistral':
                endpoint = 'https://api.mistral.ai/v1/chat/completions';
                headers = {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${state.apiKey}`
                };
                body = {
                    model: state.selectedModel,
                    messages: [...history, { role: 'user', content: userMessage }],
                    temperature: state.temperature,
                    max_tokens: state.maxTokens
                };
                break;
                
            case 'custom':
                endpoint = state.customEndpoint;
                headers = {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${state.apiKey}`
                };
                body = {
                    model: state.selectedModel,
                    messages: [...history, { role: 'user', content: userMessage }],
                    temperature: state.temperature,
                    max_tokens: state.maxTokens
                };
                break;
                
            default:
                throw new Error('Unknown API provider');
        }
        
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(body)
        });
        
        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(`API returned ${response.status}: ${error.error?.message || response.statusText}`);
        }
        
        const data = await response.json();
        
        // Extract the response based on the API provider
        let aiResponse;
        switch (state.apiProvider) {
            case 'openai':
            case 'mistral':
                aiResponse = data.choices[0].message.content;
                break;
                
            case 'anthropic':
                aiResponse = data.content[0].text;
                break;
                
            case 'google':
                aiResponse = data.candidates[0].content.parts[0].text;
                break;
                
            case 'custom':
                // Try to support multiple response formats
                aiResponse = data.choices?.[0]?.message?.content || 
                           data.content?.[0]?.text ||
                           data.response ||
                           data.output ||
                           data.result ||
                           JSON.stringify(data);
                break;
        }
        
        return aiResponse;
    }

    // Format conversation history based on API provider
    function formatConversationHistory() {
        // For simplicity, we'll only include a limited history
        const MAX_HISTORY = 10;
        const recentMessages = state.messages.slice(-MAX_HISTORY);
        
        // Convert to the format expected by the API
        return recentMessages.map(msg => ({
            role: msg.role === 'user' ? 'user' : 'assistant',
            content: msg.content
        }));
    }

    // Initialize the application
    init();
});