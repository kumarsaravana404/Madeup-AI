const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const messagesDiv = document.getElementById('messages');

// Hardcoded for demo/local testing. In real prod, use cookies or separate auth flow.
const API_KEY = 'production-secret'; 

async function sendMessage() {
    const text = userInput.value.trim();
    if (!text) return;

    // 1. Add User Message
    userInput.value = '';
    appendMessage('User', text, 'user-msg');
    
    // 2. Add AI Placeholder
    const aiContainer = document.createElement('div');
    aiContainer.className = 'message ai-msg';
    aiContainer.textContent = 'Thinking...';
    messagesDiv.appendChild(aiContainer);
    scrollToBottom();

    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'x-api-key': API_KEY
            },
            body: JSON.stringify({ message: text })
        });

        if (!response.ok) {
            throw new Error(`Server Error: ${response.status}`);
        }

        // 3. Handle Stream
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullText = '';
        aiContainer.textContent = ''; // Clear loading text

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');
            
            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    const dataStr = line.replace('data: ', '').trim();
                    if (dataStr === '[DONE]') break;
                    
                    try {
                        const data = JSON.parse(dataStr);
                        if (data.error) throw new Error(data.error);
                        if (data.token) {
                            fullText += data.token;
                            aiContainer.textContent = fullText;
                            scrollToBottom();
                        }
                    } catch (e) {
                         // Ignore incomplete JSON chunks or parse errors
                    }
                }
            }
        }
    } catch (error) {
        aiContainer.textContent = `Error: ${error.message}`;
        aiContainer.classList.add('error-msg');
        aiContainer.style.background = '#ef4444';
    }
}

function appendMessage(sender, text, className) {
    const div = document.createElement('div');
    div.className = `message ${className}`;
    div.textContent = text;
    messagesDiv.appendChild(div);
    scrollToBottom();
    return div;
}

function scrollToBottom() {
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// Event Listeners
sendBtn.addEventListener('click', sendMessage);

userInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});
