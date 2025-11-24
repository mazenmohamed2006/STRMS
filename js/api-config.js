// Mock API Configuration for STRMS
class MockAPI {
    constructor() {
        this.users = this.loadFromStorage('strms_users') || this.createDemoUsers();
        this.tasks = this.loadFromStorage('strms_tasks') || {};
        this.events = this.loadFromStorage('strms_events') || {};
        this.chatHistory = this.loadFromStorage('strms_chat_history') || {};
        this.currentUser = this.loadFromStorage('strms_current_user');
    }

    createDemoUsers() {
        const demoUsers = {};
        for (let i = 1; i <= 10; i++) {
            const email = `demo${i}@strms.com`;
            demoUsers[email] = {
                id: i,
                firstName: `Demo${i}`,
                lastName: 'User',
                email: email,
                password: 'demo123',
                createdAt: new Date().toISOString()
            };
        }
        this.saveToStorage('strms_users', demoUsers);
        return demoUsers;
    }

    // Authentication Methods
    async login(email, password) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const user = this.users[email];
                if (user && user.password === password) {
                    this.currentUser = user;
                    this.saveToStorage('strms_current_user', user);
                    resolve({ success: true, user });
                } else {
                    reject({ success: false, message: 'Invalid email or password' });
                }
            }, 1000);
        });
    }

    async register(userData) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (this.users[userData.email]) {
                    reject({ success: false, message: 'Email already registered' });
                    return;
                }

                const newUser = {
                    id: Date.now(),
                    ...userData,
                    createdAt: new Date().toISOString()
                };

                this.users[userData.email] = newUser;
                this.saveToStorage('strms_users', this.users);
                this.currentUser = newUser;
                this.saveToStorage('strms_current_user', newUser);

                resolve({ success: true, user: newUser });
            }, 1000);
        });
    }

    logout() {
        this.currentUser = null;
        localStorage.removeItem('strms_current_user');
    }

    // Task Methods
    async getTasks() {
        return new Promise((resolve) => {
            setTimeout(() => {
                const userId = this.currentUser?.id;
                const userTasks = this.tasks[userId] || [];
                resolve({ success: true, tasks: userTasks });
            }, 500);
        });
    }

    async saveTask(taskData) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const userId = this.currentUser.id;
                if (!this.tasks[userId]) {
                    this.tasks[userId] = [];
                }

                if (taskData.id) {
                    // Update existing task
                    const index = this.tasks[userId].findIndex(t => t.id === taskData.id);
                    if (index !== -1) {
                        this.tasks[userId][index] = { ...taskData };
                    }
                } else {
                    // Create new task
                    const newTask = {
                        id: Date.now(),
                        ...taskData,
                        createdAt: new Date().toISOString()
                    };
                    this.tasks[userId].push(newTask);
                }

                this.saveToStorage('strms_tasks', this.tasks);
                resolve({ success: true, tasks: this.tasks[userId] });
            }, 500);
        });
    }

    async deleteTask(taskId) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const userId = this.currentUser.id;
                if (this.tasks[userId]) {
                    this.tasks[userId] = this.tasks[userId].filter(t => t.id !== taskId);
                    this.saveToStorage('strms_tasks', this.tasks);
                }
                resolve({ success: true, tasks: this.tasks[userId] || [] });
            }, 500);
        });
    }

    // Event Methods
    async getEvents(month = null) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const userId = this.currentUser?.id;
                let userEvents = this.events[userId] || [];

                if (month) {
                    userEvents = userEvents.filter(event => {
                        const eventDate = new Date(event.date);
                        return eventDate.getMonth() === month.getMonth() && 
                               eventDate.getFullYear() === month.getFullYear();
                    });
                }

                resolve({ success: true, events: userEvents });
            }, 500);
        });
    }

    async saveEvent(eventData) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const userId = this.currentUser.id;
                if (!this.events[userId]) {
                    this.events[userId] = [];
                }

                if (eventData.id) {
                    // Update existing event
                    const index = this.events[userId].findIndex(e => e.id === eventData.id);
                    if (index !== -1) {
                        this.events[userId][index] = { ...eventData };
                    }
                } else {
                    // Create new event
                    const newEvent = {
                        id: Date.now(),
                        ...eventData,
                        createdAt: new Date().toISOString()
                    };
                    this.events[userId].push(newEvent);
                }

                this.saveToStorage('strms_events', this.events);
                resolve({ success: true, events: this.events[userId] });
            }, 500);
        });
    }

    async deleteEvent(eventId) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const userId = this.currentUser.id;
                if (this.events[userId]) {
                    this.events[userId] = this.events[userId].filter(e => e.id !== eventId);
                    this.saveToStorage('strms_events', this.events);
                }
                resolve({ success: true, events: this.events[userId] || [] });
            }, 500);
        });
    }

    // AI Chat Methods
    async sendChatMessage(message) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const userId = this.currentUser.id;
                if (!this.chatHistory[userId]) {
                    this.chatHistory[userId] = [];
                }

                // Add user message
                this.chatHistory[userId].push({
                    type: 'user',
                    message: message,
                    timestamp: new Date().toISOString()
                });

                // Generate AI response
                const aiResponse = this.generateAIResponse(message);
                
                // Add AI response
                this.chatHistory[userId].push({
                    type: 'ai',
                    message: aiResponse,
                    timestamp: new Date().toISOString()
                });

                this.saveToStorage('strms_chat_history', this.chatHistory);
                
                resolve({ 
                    success: true, 
                    response: aiResponse,
                    history: this.chatHistory[userId]
                });
            }, 2000);
        });
    }

    async getChatHistory() {
        return new Promise((resolve) => {
            setTimeout(() => {
                const userId = this.currentUser.id;
                const history = this.chatHistory[userId] || [];
                resolve({ success: true, history });
            }, 300);
        });
    }

    generateAIResponse(message) {
        const lowerMessage = message.toLowerCase();
        const responses = {
            study: "Try the Pomodoro technique: 25 minutes focused study, 5-minute break. Repeat 4 times, then take a longer break.",
            time: "Plan your day in time blocks. Allocate specific hours for studying, breaks, and personal activities.",
            task: "Prioritize tasks using the Eisenhower Matrix: urgent/important, important/not urgent, urgent/not important, neither.",
            stress: "Take regular breaks, practice deep breathing, and ensure you're getting enough sleep and exercise.",
            exam: "Create a study schedule starting 2-3 weeks before exams. Review material regularly rather than cramming.",
            motivation: "Set small, achievable goals and reward yourself when you complete them. Track your progress visually.",
            default: "I recommend breaking your work into manageable chunks and taking regular breaks. Would you like specific tips for time management, study techniques, or stress reduction?"
        };

        if (lowerMessage.includes('study') || lowerMessage.includes('learn')) {
            return responses.study;
        } else if (lowerMessage.includes('time') || lowerMessage.includes('schedule')) {
            return responses.time;
        } else if (lowerMessage.includes('task') || lowerMessage.includes('todo')) {
            return responses.task;
        } else if (lowerMessage.includes('stress') || lowerMessage.includes('anxious')) {
            return responses.stress;
        } else if (lowerMessage.includes('exam') || lowerMessage.includes('test')) {
            return responses.exam;
        } else if (lowerMessage.includes('motivation') || lowerMessage.includes('procrastination')) {
            return responses.motivation;
        } else {
            return responses.default;
        }
    }

    // Utility Methods
    loadFromStorage(key) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch {
            return null;
        }
    }

    saveToStorage(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch {
            return false;
        }
    }

    getCurrentUser() {
        return this.currentUser;
    }

    isAuthenticated() {
        return !!this.currentUser;
    }
}

// Initialize global API instance
window.strmsAPI = new MockAPI();

// Utility function for showing notifications
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => notification.classList.add('show'), 100);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}