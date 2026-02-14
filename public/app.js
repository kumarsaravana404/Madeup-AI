const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const messagesDiv = document.getElementById('messages');

// Hardcoded for demo/local testing.
const API_KEY = 'production-secret'; 

async function sendMessage() {
    const text = userInput.value.trim();
    if (!text) return;

    // 1. Add User Message
    userInput.value = '';
    appendMessage({ sender: 'Operator', text: text, isUser: true });
    
    // 2. Add AI Placeholder
    const aiContainer = appendMessage({ sender: 'Ronisha', text: 'Analyzing...', isUser: false, isLoading: true });

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
        
        // Remove "loading" class/text if we start getting data
        aiContainer.innerHTML = ''; 
        aiContainer.classList.remove('animate-pulse');

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
                            // Format JSON code blocks nicely if detected
                            aiContainer.innerHTML = formatAIResponse(fullText); 
                            scrollToBottom();
                        }
                    } catch (e) { }
                }
            }
        }
    } catch (error) {
        aiContainer.innerHTML = `<span class="flex items-center gap-2"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> Error: ${error.message}</span>`;
        aiContainer.classList.add('bg-red-900/20', 'text-red-200', 'border-red-900/50');
        aiContainer.classList.remove('bg-slate-800/50', 'text-slate-300');
    }
}

function appendMessage({ sender, text, isUser, isLoading }) {
    // Wrapper for alignment
    const wrapper = document.createElement('div');
    wrapper.className = `flex flex-col space-y-1 animate-fade-in group ${isUser ? 'items-end' : 'items-start'}`;
    
    // Metadata (Sender Name)
    const meta = document.createElement('div');
    meta.className = `flex items-center gap-2 text-xs mb-1 mx-1 ${isUser ? 'text-blue-400 flex-row-reverse' : 'text-slate-500'}`;
    meta.innerHTML = `
        <span class="font-bold tracking-wide uppercase">${sender}</span>
        <span class="text-slate-600 text-[10px] font-mono">${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
    `;
    wrapper.appendChild(meta);

    // Message Bubble
    const bubble = document.createElement('div');
    
    // Tailwind Classes based on sender
    if (isUser) {
        bubble.className = 'bg-blue-600 text-white p-4 rounded-2xl rounded-tr-sm max-w-[85%] leading-relaxed shadow-lg shadow-blue-900/20 font-sans';
    } else {
        bubble.className = 'bg-slate-800/50 text-slate-300 p-4 rounded-2xl rounded-tl-sm max-w-[85%] leading-relaxed border border-slate-700/50 shadow-sm backdrop-blur-sm font-mono text-sm';
    }

    if (isLoading) {
        bubble.classList.add('animate-pulse');
        bubble.innerHTML = '<span class="flex gap-1 items-center"><span class="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span><span class="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-75"></span><span class="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-150"></span></span>';
    } else {
        bubble.textContent = text;
    }

    wrapper.appendChild(bubble);
    messagesDiv.appendChild(wrapper);
    scrollToBottom();
    return bubble; // Return bubble so we can stream into it
}

function formatAIResponse(text) {
    // Simple formatter to preserve whitespace for JSON code blocks
    // If it looks like JSON, wrap in <pre>
    if (text.includes('{') || text.includes('[')) {
        // Just return it wrapped in pre-wrap to preserve indentation
        return `<pre class="whitespace-pre-wrap font-mono text-xs md:text-sm text-emerald-400">${text}</pre>`;
    }
    return text.replace(/\n/g, '<br>');
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

// Initial focus
userInput.focus();
