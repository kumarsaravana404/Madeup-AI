// Configuration
const API_BASE_URL = 'http://localhost:3000/api';
let currentModel = 'ronisha';
let isProcessing = false;

// DOM Elements
const chatForm = document.getElementById('chatForm');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const messagesContainer = document.getElementById('messagesContainer');
const newChatBtn = document.getElementById('newChatBtn');
const clearHistoryBtn = document.getElementById('clearHistoryBtn');
const connectionStatus = document.getElementById('connectionStatus');
const connectionText = document.getElementById('connectionText');
const currentModelSpan = document.getElementById('currentModel');

// Check Ollama connection on load
async function checkConnection() {
    try {
        const response = await fetch(`${API_BASE_URL}/health`);
        const data = await response.json();
        
        if (data.status === 'connected') {
            connectionStatus.className = 'w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]';
            connectionText.textContent = 'Connected';
        } else {
            connectionStatus.className = 'w-2 h-2 rounded-full bg-red-500';
            connectionText.textContent = 'Disconnected';
        }
    } catch (error) {
        connectionStatus.className = 'w-2 h-2 rounded-full bg-red-500';
        connectionText.textContent = 'Connection Error';
        console.error('Connection check failed:', error);
    }
}

// Create message element
function createMessageElement(content, isUser = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'flex gap-6 group';
    
    const avatarDiv = document.createElement('div');
    avatarDiv.className = isUser 
        ? 'flex-shrink-0 w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-800 flex items-center justify-center'
        : 'flex-shrink-0 w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/20';
    
    const icon = document.createElement('span');
    icon.className = 'material-icons-outlined text-sm';
    icon.textContent = isUser ? 'person' : 'smart_toy';
    avatarDiv.appendChild(icon);
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'flex-1 space-y-2';
    
    const labelDiv = document.createElement('div');
    labelDiv.className = isUser 
        ? 'font-bold text-xs uppercase tracking-widest text-slate-400'
        : 'font-bold text-xs uppercase tracking-widest text-primary';
    labelDiv.textContent = isUser ? 'You' : 'Ollama Assistant';
    
    const textDiv = document.createElement('div');
    textDiv.className = 'text-slate-800 dark:text-slate-200 leading-relaxed';
    textDiv.textContent = content;
    
    contentDiv.appendChild(labelDiv);
    contentDiv.appendChild(textDiv);
    
    messageDiv.appendChild(avatarDiv);
    messageDiv.appendChild(contentDiv);
    
    return { messageDiv, textDiv };
}

// Create typing indicator
function createTypingIndicator() {
    const { messageDiv, textDiv } = createMessageElement('', false);
    
    textDiv.innerHTML = `
        <div class="typing-indicator">
            <span></span>
            <span></span>
            <span></span>
        </div>
    `;
    
    return messageDiv;
}

// Format code blocks in response
function formatResponse(text) {
    // Simple code block detection and formatting
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    return text.replace(codeBlockRegex, (match, language, code) => {
        return `
            <div class="bg-slate-900 rounded-xl overflow-hidden border border-slate-800 my-3">
                <div class="flex items-center justify-between px-4 py-2 bg-slate-800/50 border-b border-slate-800">
                    <span class="text-xs font-mono text-slate-400">${language || 'code'}</span>
                    <button onclick="copyCode(this)" class="text-xs flex items-center gap-1 text-slate-400 hover:text-white transition-colors">
                        <span class="material-icons-outlined text-sm">content_copy</span>
                        Copy
                    </button>
                </div>
                <pre class="p-4 text-xs font-mono text-blue-300 leading-relaxed overflow-x-auto">${escapeHtml(code.trim())}</pre>
            </div>
        `;
    });
}

// Escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Copy code to clipboard
window.copyCode = function(button) {
    const pre = button.closest('.bg-slate-900').querySelector('pre');
    const text = pre.textContent;
    
    navigator.clipboard.writeText(text).then(() => {
        const originalText = button.innerHTML;
        button.innerHTML = '<span class="material-icons-outlined text-sm">check</span> Copied!';
        setTimeout(() => {
            button.innerHTML = originalText;
        }, 2000);
    });
};

// Send message to API with streaming
async function sendMessage(message) {
    if (isProcessing || !message.trim()) return;
    
    isProcessing = true;
    sendBtn.disabled = true;
    messageInput.disabled = true;
    
    // Remove welcome message if present
    const welcomeMessage = messagesContainer.querySelector('.text-center');
    if (welcomeMessage) {
        welcomeMessage.remove();
    }
    
    // Add user message
    const { messageDiv: userMessageDiv } = createMessageElement(message, true);
    messagesContainer.appendChild(userMessageDiv);
    
    // Add typing indicator
    const typingIndicator = createTypingIndicator();
    messagesContainer.appendChild(typingIndicator);
    
    // Scroll to bottom
    messagesContainer.parentElement.scrollTop = messagesContainer.parentElement.scrollHeight;
    
    try {
        const response = await fetch(`${API_BASE_URL}/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: message,
                model: currentModel
            })
        });
        
        // Remove typing indicator
        typingIndicator.remove();
        
        // Create AI message
        const { messageDiv: aiMessageDiv, textDiv } = createMessageElement('', false);
        messagesContainer.appendChild(aiMessageDiv);
        
        let fullResponse = '';
        
        // Read streaming response
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            const chunk = decoder.decode(value);
            const lines = chunk.split('\n').filter(line => line.trim().startsWith('data:'));
            
            for (const line of lines) {
                try {
                    const data = JSON.parse(line.substring(5).trim());
                    
                    if (data.token) {
                        fullResponse += data.token;
                        textDiv.innerHTML = formatResponse(fullResponse);
                    }
                    
                    if (data.done) {
                        break;
                    }
                    
                    // Auto scroll
                    messagesContainer.parentElement.scrollTop = messagesContainer.parentElement.scrollHeight;
                } catch (e) {
                    console.error('Error parsing SSE data:', e);
                }
            }
        }
        
    } catch (error) {
        console.error('Error sending message:', error);
        
        // Remove typing indicator
        typingIndicator.remove();
        
        // Show error message
        const { messageDiv: errorMessageDiv } = createMessageElement(
            '❌ Error: Could not connect to Ollama. Make sure the server is running.',
            false
        );
        messagesContainer.appendChild(errorMessageDiv);
    } finally {
        isProcessing = false;
        sendBtn.disabled = false;
        messageInput.disabled = false;
        messageInput.value = '';
        messageInput.focus();
    }
}

// Event Listeners
chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const message = messageInput.value.trim();
    if (message) {
        sendMessage(message);
    }
});

newChatBtn.addEventListener('click', () => {
    messagesContainer.innerHTML = `
        <div class="text-center py-20">
            <div class="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center">
                <span class="material-icons-outlined text-primary text-3xl">chat</span>
            </div>
            <h1 class="text-2xl font-bold mb-2">Welcome to Ollama Chat</h1>
            <p class="text-slate-500">Start a conversation with your AI assistant</p>
        </div>
    `;
    messageInput.value = '';
    messageInput.focus();
});

clearHistoryBtn.addEventListener('click', async () => {
    if (confirm('Are you sure you want to clear the chat history?')) {
        try {
            await fetch(`${API_BASE_URL}/history`, {
                method: 'DELETE'
            });
            newChatBtn.click(); // Trigger new chat
        } catch (error) {
            console.error('Error clearing history:', error);
        }
    }
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Cmd/Ctrl + N for new chat
    if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
        e.preventDefault();
        newChatBtn.click();
    }
    
    // Focus input on any key (except special keys)
    if (!e.metaKey && !e.ctrlKey && !e.altKey && e.key.length === 1) {
        if (document.activeElement !== messageInput) {
            messageInput.focus();
        }
    }
});

// Initialize
checkConnection();
setInterval(checkConnection, 30000); // Check connection every 30 seconds

// Focus input on load
messageInput.focus();

console.log('🚀 Ollama Chat UI loaded successfully!');
console.log('💡 Press Cmd/Ctrl + N for a new chat');
