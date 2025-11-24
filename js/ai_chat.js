document.addEventListener('DOMContentLoaded', function() {
    const chatInput = document.getElementById('chatInput');
    const sendButton = document.getElementById('sendMessage');
    const chatMessages = document.getElementById('chatMessages');

    // Load chat history
    loadChatHistory();

    // Send message on button click
    sendButton.addEventListener('click', sendMessage);

    // Send message on Enter key
    chatInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
});

async function loadChatHistory() {
    try {
        const result = await strmsAPI.getChatHistory();
        const history = result.history || [];
        
        // Clear default message if we have history
        if (history.length > 0) {
            document.getElementById('chatMessages').innerHTML = '';
        }
        
        // Add all messages from history
        history.forEach(message => {
            addMessageToChat(message.message, message.type);
        });
        
        scrollToBottom();
    } catch (error) {
        console.error('Error loading chat history:', error);
    }
}

async function sendMessage() {
    const chatInput = document.getElementById('chatInput');
    const message = chatInput.value.trim();

    if (!message) return;

    // Add user message to chat
    addMessageToChat(message, 'user');
    chatInput.value = '';
    
    // Show typing indicator
    const typingIndicator = addTypingIndicator();
    
    try {
        const result = await strmsAPI.sendChatMessage(message);
        
        // Remove typing indicator
        typingIndicator.remove();
        
        // Add AI response
        addMessageToChat(result.response, 'ai');
        
    } catch (error) {
        // Remove typing indicator
        typingIndicator.remove();
        
        // Show error message
        addMessageToChat('Sorry, I encountered an error. Please try again.', 'ai error');
        console.error('Error sending message:', error);
    }
}

function addMessageToChat(message, type) {
    const chatMessages = document.getElementById('chatMessages');
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `${type}-message`;
    
    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    messageContent.textContent = message;
    
    messageDiv.appendChild(messageContent);
    chatMessages.appendChild(messageDiv);
    
    scrollToBottom();
}

function addTypingIndicator() {
    const chatMessages = document.getElementById('chatMessages');
    
    const typingDiv = document.createElement('div');
    typingDiv.className = 'ai-message typing';
    
    const typingContent = document.createElement('div');
    typingContent.className = 'message-content';
    typingContent.innerHTML = '<div class="typing-dots"><span></span><span></span><span></span></div>';
    
    typingDiv.appendChild(typingContent);
    chatMessages.appendChild(typingDiv);
    
    scrollToBottom();
    
    return typingDiv;
}

function scrollToBottom() {
    const chatMessages = document.getElementById('chatMessages');
    chatMessages.scrollTop = chatMessages.scrollHeight;
}