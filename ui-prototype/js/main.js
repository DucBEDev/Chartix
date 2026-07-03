document.addEventListener('DOMContentLoaded', () => {
    // Handle chat input
    const chatInput = document.getElementById('chat-input');
    const btnSend = document.getElementById('btn-send');
    const chatContainer = document.getElementById('chat-container');

    const appendMessage = (text, isUser = true) => {
        const msgDiv = document.createElement('div');
        msgDiv.className = `msg ${isUser ? 'user' : 'ai'}`;
        
        const bubble = document.createElement('div');
        bubble.className = 'msg-bubble';
        bubble.textContent = text;
        
        msgDiv.appendChild(bubble);
        chatContainer.appendChild(msgDiv);
        
        // Scroll to bottom
        chatContainer.scrollTop = chatContainer.scrollHeight;
    };

    const handleSend = () => {
        const text = chatInput.value.trim();
        if (!text) return;
        
        // Add user message
        appendMessage(text, true);
        chatInput.value = '';
        
        // Simulate AI thinking state
        setTimeout(() => {
            appendMessage("Tôi đang tổng hợp dữ liệu on-chain và phân tích kỹ thuật. Vui lòng đợi trong giây lát...", false);
        }, 600);
    };

    btnSend.addEventListener('click', handleSend);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSend();
    });
});
