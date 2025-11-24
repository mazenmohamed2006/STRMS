document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    if (!strmsAPI.isAuthenticated()) {
        window.location.href = 'index.html';
        return;
    }

    const currentUser = strmsAPI.getCurrentUser();
    document.getElementById('welcomeMessage').textContent = `Welcome back, ${currentUser.firstName}!`;

    // Initialize dashboard
    loadDashboardData();
    setupEventListeners();
});

function setupEventListeners() {
    // Logout button
    document.getElementById('logoutBtn').addEventListener('click', function() {
        strmsAPI.logout();
        window.location.href = 'index.html';
    });

    // AI Chat button
    document.getElementById('aiChatBtn').addEventListener('click', function() {
        document.getElementById('aiChatModal').classList.add('show');
    });

    // Close modal
    document.querySelector('.close-modal').addEventListener('click', function() {
        document.getElementById('aiChatModal').classList.remove('show');
    });

    // Close modal when clicking outside
    document.getElementById('aiChatModal').addEventListener('click', function(e) {
        if (e.target === this) {
            this.classList.remove('show');
        }
    });
}

async function loadDashboardData() {
    try {
        // Load tasks and events
        const [tasksResult, eventsResult] = await Promise.all([
            strmsAPI.getTasks(),
            strmsAPI.getEvents()
        ]);

        const tasks = tasksResult.tasks || [];
        const events = eventsResult.events || [];

        updateStats(tasks, events);
        updateTimeline(tasks, events);
        updateCalendarPreview(events);
        updateRecentActivity(tasks, events);
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        showNotification('Error loading dashboard data', 'error');
    }
}

function updateStats(tasks, events) {
    const today = new Date().toDateString();
    
    // Pending tasks (not completed)
    const pendingTasks = tasks.filter(task => task.progress < 100).length;
    
    // Tasks completed today
    const completedToday = tasks.filter(task => {
        const completedDate = task.completedAt ? new Date(task.completedAt).toDateString() : null;
        return task.progress === 100 && completedDate === today;
    }).length;
    
    // Upcoming events (next 7 days)
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    const upcomingEvents = events.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate >= new Date() && eventDate <= nextWeek;
    }).length;

    document.getElementById('pendingTasks').textContent = pendingTasks;
    document.getElementById('completedTasks').textContent = completedToday;
    document.getElementById('upcomingEvents').textContent = upcomingEvents;
}

function updateTimeline(tasks, events) {
    const timeline = document.getElementById('upcomingTimeline');
    const allItems = [];

    // Add tasks to timeline
    tasks.forEach(task => {
        if (task.progress < 100) { // Only show incomplete tasks
            allItems.push({
                type: 'task',
                id: task.id,
                title: task.title,
                date: task.dueDate,
                priority: task.priority,
                completed: false
            });
        }
    });

    // Add events to timeline
    events.forEach(event => {
        const eventDate = new Date(event.date);
        if (eventDate >= new Date()) { // Only show future events
            allItems.push({
                type: 'event',
                id: event.id,
                title: event.title,
                date: event.date,
                startTime: event.startTime,
                endTime: event.endTime
            });
        }
    });

    // Sort by date
    allItems.sort((a, b) => new Date(a.date) - new Date(b.date));

    // Display only next 5 items
    const nextItems = allItems.slice(0, 5);

    if (nextItems.length === 0) {
        timeline.innerHTML = '<div class="empty-state">No upcoming items. Add some tasks or events to see them here!</div>';
        return;
    }

    timeline.innerHTML = nextItems.map(item => `
        <div class="timeline-item ${item.type === 'event' ? 'upcoming' : ''}">
            <div class="timeline-icon">
                <i class="fas ${item.type === 'task' ? 'fa-tasks' : 'fa-calendar'}"></i>
            </div>
            <div class="timeline-content">
                <div class="timeline-title">${item.title}</div>
                <div class="timeline-meta">
                    <span class="timeline-date">
                        <i class="far fa-clock"></i>
                        ${formatDate(item.date)}${item.startTime ? ` • ${item.startTime}` : ''}
                    </span>
                    ${item.priority ? `
                        <span class="timeline-priority priority-${item.priority}">
                            ${item.priority.charAt(0).toUpperCase() + item.priority.slice(1)}
                        </span>
                    ` : ''}
                </div>
            </div>
        </div>
    `).join('');
}

function updateCalendarPreview(events) {
    const calendarEl = document.getElementById('calendarPreview');
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    // Get first day of month and number of days
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    // Generate calendar header
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    let calendarHTML = `
        <div class="calendar-header">
            <button class="calendar-nav" onclick="navigateCalendar(-1)"><i class="fas fa-chevron-left"></i></button>
            <h4>${monthNames[currentMonth]} ${currentYear}</h4>
            <button class="calendar-nav" onclick="navigateCalendar(1)"><i class="fas fa-chevron-right"></i></button>
        </div>
        <div class="calendar-grid">
    `;

    // Day headers
    dayNames.forEach(day => {
        calendarHTML += `<div class="calendar-day-header">${day}</div>`;
    });

    // Empty cells for days before first day of month
    for (let i = 0; i < firstDay; i++) {
        calendarHTML += `<div class="calendar-day empty"></div>`;
    }

    // Days of month
    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const hasEvent = events.some(event => event.date === dateStr);
        const isToday = today.getDate() === day && today.getMonth() === currentMonth && today.getFullYear() === currentYear;
        
        calendarHTML += `
            <div class="calendar-day ${isToday ? 'today' : ''} ${hasEvent ? 'has-event' : ''}">
                ${day}
            </div>
        `;
    }

    calendarHTML += '</div>';

    // Add today's events
    const todayEvents = events.filter(event => event.date === formatDateForCalendar(today));
    if (todayEvents.length > 0) {
        calendarHTML += `
            <div class="calendar-events">
                <h5>Today's Events</h5>
                ${todayEvents.slice(0, 3).map(event => `
                    <div class="calendar-event">
                        <div class="event-dot"></div>
                        <span>${event.title}</span>
                        <small>${event.startTime}</small>
                    </div>
                `).join('')}
            </div>
        `;
    }

    calendarEl.innerHTML = calendarHTML;
}

function updateRecentActivity(tasks, events) {
    const activityEl = document.getElementById('recentActivity');
    const allActivities = [];

    // Add task activities
    tasks.forEach(task => {
        allActivities.push({
            type: 'task',
            title: task.progress === 100 ? `Completed: ${task.title}` : `Created: ${task.title}`,
            time: task.updatedAt || task.createdAt,
            icon: task.progress === 100 ? 'fa-check-circle' : 'fa-plus-circle'
        });
    });

    // Add event activities
    events.forEach(event => {
        allActivities.push({
            type: 'event',
            title: `Event: ${event.title}`,
            time: event.createdAt,
            icon: 'fa-calendar-plus'
        });
    });

    // Sort by time (newest first) and take latest 5
    allActivities.sort((a, b) => new Date(b.time) - new Date(a.time));
    const recentActivities = allActivities.slice(0, 5);

    if (recentActivities.length === 0) {
        activityEl.innerHTML = '<div class="empty-state">No recent activity yet. Start adding tasks and events!</div>';
        return;
    }

    activityEl.innerHTML = recentActivities.map(activity => `
        <div class="activity-item">
            <div class="activity-icon">
                <i class="fas ${activity.icon}"></i>
            </div>
            <div class="activity-content">
                <div class="activity-title">${activity.title}</div>
                <div class="activity-time">${formatRelativeTime(activity.time)}</div>
            </div>
        </div>
    `).join('');
}

// Utility functions
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
    });
}

function formatDateForCalendar(date) {
    return date.toISOString().split('T')[0];
}

function formatRelativeTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return formatDate(dateString);
}

// Calendar navigation (simplified for preview)
function navigateCalendar(direction) {
    // In a real implementation, this would change the month view
    showNotification('Use the full calendar for navigation', 'info');
}