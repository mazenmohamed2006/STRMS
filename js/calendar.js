document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    if (!strmsAPI.isAuthenticated()) {
        window.location.href = 'index.html';
        return;
    }

    // Initialize calendar
    currentDate = new Date();
    setupEventListeners();
    initializeDateButtons();
    renderCalendar();
    loadEvents();
});


function setupEventListeners() {
    // Logout button
    document.getElementById('logoutBtn').addEventListener('click', function() {
        strmsAPI.logout();
        window.location.href = 'index.html';
    });

    // Navigation buttons
    document.getElementById('prevBtn').addEventListener('click', navigatePrevious);
    document.getElementById('nextBtn').addEventListener('click', navigateNext);
    document.getElementById('todayBtn').addEventListener('click', goToToday);

    // Date button event listeners
    document.getElementById('yearBtn').addEventListener('click', toggleYearDropdown);
    document.getElementById('monthBtn').addEventListener('click', toggleMonthDropdown);
    document.getElementById('dayBtn').addEventListener('click', toggleDayDropdown);

    // Close dropdowns when clicking outside
    document.addEventListener('click', function(event) {
        if (!event.target.closest('.date-buttons') && !event.target.closest('.dropdown-menu')) {
            closeAllDropdowns();
        }
    });

    // Add event button
    document.getElementById('addEventBtn').addEventListener('click', openEventModal);

    // Event form submission
    document.getElementById('eventForm').addEventListener('submit', saveEvent);

    // Close modal
    document.querySelector('.close-modal').addEventListener('click', closeEventModal);

    // Close modal when clicking outside
    document.getElementById('eventModal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeEventModal();
        }
    });

    // AI Chat button
    document.getElementById('aiChatBtn').addEventListener('click', function() {
        document.getElementById('aiChatModal').classList.add('show');
    });

    // Close AI modal
    document.querySelector('#aiChatModal .close-modal').addEventListener('click', function() {
        document.getElementById('aiChatModal').classList.remove('show');
    });

    // Close AI modal when clicking outside
    document.getElementById('aiChatModal').addEventListener('click', function(e) {
        if (e.target === this) {
            this.classList.remove('show');
        }
    });
}

function initializeDateButtons() {
    updateDateButtons();
    populateYearDropdown();
    populateDayDropdown();
}

function updateDateButtons() {
    document.getElementById('currentYear').textContent = currentDate.getFullYear();
    document.getElementById('currentMonthText').textContent = getMonthName(currentDate.getMonth());
    document.getElementById('currentDay').textContent = 'Day';
}

function getMonthName(monthIndex) {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return months[monthIndex];
}

function toggleYearDropdown() {
    const dropdown = document.getElementById('yearDropdown');
    if (activeDropdown === 'year') {
        closeAllDropdowns();
    } else {
        closeAllDropdowns();
        dropdown.classList.add('show');
        activeDropdown = 'year';
        setActiveButton('yearBtn');
        populateYearDropdown();
    }
}

function toggleMonthDropdown() {
    const dropdown = document.getElementById('monthDropdown');
    if (activeDropdown === 'month') {
        closeAllDropdowns();
    } else {
        closeAllDropdowns();
        dropdown.classList.add('show');
        activeDropdown = 'month';
        setActiveButton('monthBtn');
    }
}

function toggleDayDropdown() {
    const dropdown = document.getElementById('dayDropdown');
    if (activeDropdown === 'day') {
        closeAllDropdowns();
    } else {
        closeAllDropdowns();
        dropdown.classList.add('show');
        activeDropdown = 'day';
        setActiveButton('dayBtn');
        populateDayDropdown();
    }
}

function closeAllDropdowns() {
    document.querySelectorAll('.dropdown-menu').forEach(dropdown => {
        dropdown.classList.remove('show');
    });
    document.querySelectorAll('.date-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    activeDropdown = null;
}

function setActiveButton(buttonId) {
    document.querySelectorAll('.date-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.getElementById(buttonId).classList.add('active');
}

function populateYearDropdown() {
    const yearGrid = document.querySelector('.year-grid');
    const currentYear = currentDate.getFullYear();
    yearGrid.innerHTML = '';

    for (let year = currentYear - 6; year <= currentYear + 5; year++) {
        const yearItem = document.createElement('div');
        yearItem.className = `year-item ${year === currentYear ? 'current' : ''}`;
        yearItem.textContent = year;
        yearItem.addEventListener('click', () => {
            currentDate.setFullYear(year);
            updateDateButtons();
            renderCalendar();
            loadEvents();
            closeAllDropdowns();
        });
        yearGrid.appendChild(yearItem);
    }
}

function populateDayDropdown() {
    const dayGrid = document.querySelector('.day-grid');
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
    
    dayGrid.innerHTML = '';

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
        const emptyDay = document.createElement('div');
        emptyDay.className = 'day-item other-month';
        emptyDay.textContent = '';
        dayGrid.appendChild(emptyDay);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
        const dayItem = document.createElement('div');
        dayItem.className = 'day-item';
        dayItem.textContent = day;
        dayItem.addEventListener('click', () => {
            currentDate.setDate(day);
            updateDateButtons();
            renderCalendar();
            loadEvents();
            closeAllDropdowns();
        });
        dayGrid.appendChild(dayItem);
    }
}

function navigatePrevious() {
    if (activeDropdown === 'year') {
        // Navigate years in dropdown
        const currentYear = currentDate.getFullYear();
        currentDate.setFullYear(currentYear - 1);
        populateYearDropdown();
    } else if (activeDropdown === 'month') {
        // Already handled by month selection
    } else {
        // Default: navigate months
        currentDate.setMonth(currentDate.getMonth() - 1);
        updateDateButtons();
        renderCalendar();
        loadEvents();
    }
}

function navigateNext() {
    if (activeDropdown === 'year') {
        // Navigate years in dropdown
        const currentYear = currentDate.getFullYear();
        currentDate.setFullYear(currentYear + 1);
        populateYearDropdown();
    } else if (activeDropdown === 'month') {
        // Already handled by month selection
    } else {
        // Default: navigate months
        currentDate.setMonth(currentDate.getMonth() + 1);
        updateDateButtons();
        renderCalendar();
        loadEvents();
    }
}

function goToToday() {
    currentDate = new Date();
    updateDateButtons();
    renderCalendar();
    loadEvents();
    closeAllDropdowns();
}

// Initialize month dropdown items
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.month-item').forEach(item => {
        item.addEventListener('click', function() {
            const month = parseInt(this.getAttribute('data-month'));
            currentDate.setMonth(month);
            updateDateButtons();
            renderCalendar();
            loadEvents();
            closeAllDropdowns();
        });
    });
});

// Rest of the existing calendar functions remain the same...
function renderCalendar() {
    const calendarGrid = document.getElementById('calendarGrid');
    
    // Get first day of month and number of days
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    
    // Day names
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    let calendarHTML = '<div class="calendar-grid-header">';
    
    // Add day headers
    dayNames.forEach(day => {
        calendarHTML += `<div class="calendar-day-name">${day}</div>`;
    });
    
    calendarHTML += '</div><div class="calendar-grid-body">';
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDay; i++) {
        const prevMonthDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0 - i);
        calendarHTML += createDayElement(prevMonthDay.getDate(), true);
    }
    
    // Add days of the current month
    const today = new Date();
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        const isToday = date.toDateString() === today.toDateString();
        calendarHTML += createDayElement(day, false, isToday, date);
    }
    
    // Add empty cells for days after the last day of the month
    const totalCells = 42;
    const remainingCells = totalCells - (startingDay + daysInMonth);
    for (let i = 1; i <= remainingCells; i++) {
        calendarHTML += createDayElement(i, true);
    }
    
    calendarHTML += '</div>';
    calendarGrid.innerHTML = calendarHTML;
    
    // Load events for the current month view
    loadEventsForCalendar();
}

function createDayElement(day, isOtherMonth, isToday = false, date = null) {
    const dateStr = date ? date.toISOString().split('T')[0] : '';
    
    return `
        <div class="calendar-day ${isOtherMonth ? 'other-month' : ''} ${isToday ? 'today' : ''}" 
            data-date="${dateStr}" 
            onclick="${!isOtherMonth ? `openEventModal('${dateStr}')` : ''}">
            <div class="day-number">${day}</div>
            <div class="day-events" id="events-${dateStr}">
                <!-- Events will be populated here -->
            </div>
        </div>
    `;
}

// ... (rest of the existing functions: loadEventsForCalendar, loadEvents, displayEventsList, etc.)
// Keep all the existing event management functions from the previous version








document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    if (!strmsAPI.isAuthenticated()) {
        window.location.href = 'index.html';
        return;
    }

    // Initialize calendar
    currentDate = new Date();
    setupEventListeners();
    initializeDateButtons();
    renderCalendar();
    loadEvents();
});

let currentDate = new Date();
let activeDropdown = null;

function setupEventListeners() {
    // Logout button
    document.getElementById('logoutBtn').addEventListener('click', function() {
        strmsAPI.logout();
        window.location.href = 'index.html';
    });

    // Navigation buttons
    document.getElementById('prevBtn').addEventListener('click', navigatePrevious);
    document.getElementById('nextBtn').addEventListener('click', navigateNext);
    document.getElementById('todayBtn').addEventListener('click', goToToday);

    // Date button event listeners
    document.getElementById('yearBtn').addEventListener('click', toggleYearDropdown);
    document.getElementById('monthBtn').addEventListener('click', toggleMonthDropdown);
    document.getElementById('dayBtn').addEventListener('click', toggleDayDropdown);

    // Close dropdowns when clicking outside
    document.addEventListener('click', function(event) {
        if (!event.target.closest('.date-buttons') && !event.target.closest('.dropdown-menu')) {
            closeAllDropdowns();
        }
    });

    // Add year navigation in dropdown
    document.querySelector('.prev-year').addEventListener('click', () => navigateYearInDropdown(-1));
    document.querySelector('.next-year').addEventListener('click', () => navigateYearInDropdown(1));

    // Add event button
    document.getElementById('addEventBtn').addEventListener('click', openEventModal);

    // Event form submission
    document.getElementById('eventForm').addEventListener('submit', saveEvent);

    // Close modal
    document.querySelector('.close-modal').addEventListener('click', closeEventModal);

    // Close modal when clicking outside
    document.getElementById('eventModal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeEventModal();
        }
    });

    // AI Chat button
    document.getElementById('aiChatBtn').addEventListener('click', function() {
        document.getElementById('aiChatModal').classList.add('show');
    });

    // Close AI modal
    document.querySelector('#aiChatModal .close-modal').addEventListener('click', function() {
        document.getElementById('aiChatModal').classList.remove('show');
    });

    // Close AI modal when clicking outside
    document.getElementById('aiChatModal').addEventListener('click', function(e) {
        if (e.target === this) {
            this.classList.remove('show');
        }
    });
}

function initializeDateButtons() {
    updateDateButtons();
    populateYearDropdown();
    populateDayDropdown();
    setupMonthDropdown();
}

function updateDateButtons() {
    document.getElementById('currentYear').textContent = currentDate.getFullYear();
    document.getElementById('currentMonthText').textContent = getMonthName(currentDate.getMonth());
    document.getElementById('currentDay').textContent = 'Day';
}

function getMonthName(monthIndex) {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return months[monthIndex];
}

function toggleYearDropdown() {
    const dropdown = document.getElementById('yearDropdown');
    if (activeDropdown === 'year') {
        closeAllDropdowns();
    } else {
        closeAllDropdowns();
        dropdown.classList.add('show');
        activeDropdown = 'year';
        setActiveButton('yearBtn');
        populateYearDropdown();
    }
}

function toggleMonthDropdown() {
    const dropdown = document.getElementById('monthDropdown');
    if (activeDropdown === 'month') {
        closeAllDropdowns();
    } else {
        closeAllDropdowns();
        dropdown.classList.add('show');
        activeDropdown = 'month';
        setActiveButton('monthBtn');
    }
}

function toggleDayDropdown() {
    const dropdown = document.getElementById('dayDropdown');
    if (activeDropdown === 'day') {
        closeAllDropdowns();
    } else {
        closeAllDropdowns();
        dropdown.classList.add('show');
        activeDropdown = 'day';
        setActiveButton('dayBtn');
        populateDayDropdown();
    }
}

function closeAllDropdowns() {
    document.querySelectorAll('.dropdown-menu').forEach(dropdown => {
        dropdown.classList.remove('show');
    });
    document.querySelectorAll('.date-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    activeDropdown = null;
}

function setActiveButton(buttonId) {
    document.querySelectorAll('.date-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.getElementById(buttonId).classList.add('active');
}

function populateYearDropdown() {
    const yearGrid = document.querySelector('.year-grid');
    const currentYear = currentDate.getFullYear();
    yearGrid.innerHTML = '';

    for (let year = currentYear - 6; year <= currentYear + 5; year++) {
        const yearItem = document.createElement('div');
        yearItem.className = `year-item ${year === currentYear ? 'current' : ''}`;
        yearItem.textContent = year;
        yearItem.addEventListener('click', () => {
            currentDate.setFullYear(year);
            updateDateButtons();
            renderCalendar();
            loadEvents();
            closeAllDropdowns();
        });
        yearGrid.appendChild(yearItem);
    }
}

function setupMonthDropdown() {
    document.querySelectorAll('.month-item').forEach(item => {
        item.addEventListener('click', function() {
            const month = parseInt(this.getAttribute('data-month'));
            currentDate.setMonth(month);
            updateDateButtons();
            renderCalendar();
            loadEvents();
            closeAllDropdowns();
        });
        
        // Highlight current month
        if (parseInt(this.getAttribute('data-month')) === currentDate.getMonth()) {
            this.classList.add('current');
        }
    });
}

function populateDayDropdown() {
    const dayGrid = document.querySelector('.day-grid');
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
    
    dayGrid.innerHTML = '';

    // Add day headers
    const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    dayHeaders.forEach(day => {
        const dayHeader = document.createElement('div');
        dayHeader.className = 'day-item';
        dayHeader.textContent = day;
        dayHeader.style.fontWeight = 'bold';
        dayHeader.style.color = '#4a5568';
        dayGrid.appendChild(dayHeader);
    });

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
        const emptyDay = document.createElement('div');
        emptyDay.className = 'day-item other-month';
        emptyDay.textContent = '';
        dayGrid.appendChild(emptyDay);
    }

    // Add days of the month
    const today = new Date();
    for (let day = 1; day <= daysInMonth; day++) {
        const dayItem = document.createElement('div');
        const isToday = currentDate.getFullYear() === today.getFullYear() && 
                        currentDate.getMonth() === today.getMonth() && 
                        day === today.getDate();
        
        dayItem.className = `day-item ${isToday ? 'current' : ''}`;
        dayItem.textContent = day;
        dayItem.addEventListener('click', () => {
            currentDate.setDate(day);
            updateDateButtons();
            renderCalendar();
            loadEvents();
            closeAllDropdowns();
        });
        dayGrid.appendChild(dayItem);
    }
}

function navigateYearInDropdown(direction) {
    const currentYear = currentDate.getFullYear();
    currentDate.setFullYear(currentYear + (direction * 12));
    populateYearDropdown();
}

function navigatePrevious() {
    if (activeDropdown === 'year') {
        navigateYearInDropdown(-1);
    } else {
        // Default: navigate months
        currentDate.setMonth(currentDate.getMonth() - 1);
        updateDateButtons();
        renderCalendar();
        loadEvents();
        populateDayDropdown();
    }
}

function navigateNext() {
    if (activeDropdown === 'year') {
        navigateYearInDropdown(1);
    } else {
        // Default: navigate months
        currentDate.setMonth(currentDate.getMonth() + 1);
        updateDateButtons();
        renderCalendar();
        loadEvents();
        populateDayDropdown();
    }
}

function goToToday() {
    currentDate = new Date();
    updateDateButtons();
    renderCalendar();
    loadEvents();
    populateDayDropdown();
    closeAllDropdowns();
}

function renderCalendar() {
    const calendarGrid = document.getElementById('calendarGrid');
    
    // Get first day of month and number of days
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    
    // Day names
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    let calendarHTML = '<div class="calendar-grid-header">';
    
    // Add day headers
    dayNames.forEach(day => {
        calendarHTML += `<div class="calendar-day-name">${day}</div>`;
    });
    
    calendarHTML += '</div><div class="calendar-grid-body">';
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDay; i++) {
        const prevMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);
        const prevMonthDay = prevMonth.getDate() - i;
        calendarHTML += createDayElement(prevMonthDay, true);
    }
    
    // Add days of the current month
    const today = new Date();
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        const isToday = date.toDateString() === today.toDateString();
        calendarHTML += createDayElement(day, false, isToday, date);
    }
    
    // Add empty cells for days after the last day of the month
    const totalCells = 42;
    const remainingCells = totalCells - (startingDay + daysInMonth);
    for (let i = 1; i <= remainingCells; i++) {
        calendarHTML += createDayElement(i, true);
    }
    
    calendarHTML += '</div>';
    calendarGrid.innerHTML = calendarHTML;
    
    // Load events for the current month view
    loadEventsForCalendar();
}

function createDayElement(day, isOtherMonth, isToday = false, date = null) {
    const dateStr = date ? date.toISOString().split('T')[0] : '';
    
    return `
        <div class="calendar-day ${isOtherMonth ? 'other-month' : ''} ${isToday ? 'today' : ''}" 
             data-date="${dateStr}" 
             onclick="${!isOtherMonth ? `openEventModal('${dateStr}')` : ''}">
            <div class="day-number">${day}</div>
            <div class="day-events" id="events-${dateStr}">
                <!-- Events will be populated here -->
            </div>
        </div>
    `;
}

async function loadEventsForCalendar() {
    try {
        const result = await strmsAPI.getEvents(currentDate);
        const events = result.events || [];
        
        // Group events by date
        const eventsByDate = {};
        events.forEach(event => {
            if (!eventsByDate[event.date]) {
                eventsByDate[event.date] = [];
            }
            eventsByDate[event.date].push(event);
        });
        
        // Display events on calendar
        Object.keys(eventsByDate).forEach(date => {
            const dayEventsContainer = document.getElementById(`events-${date}`);
            if (dayEventsContainer) {
                const eventsForDay = eventsByDate[date];
                let eventsHTML = '';
                
                // Show up to 2 events, then "more" indicator
                eventsForDay.slice(0, 2).forEach(event => {
                    eventsHTML += `
                        <div class="day-event" onclick="event.stopPropagation(); viewEvent(${event.id})">
                            ${event.title}
                        </div>
                    `;
                });
                
                if (eventsForDay.length > 2) {
                    eventsHTML += `<div class="more-events" onclick="event.stopPropagation(); showDateEvents('${date}')">
                        +${eventsForDay.length - 2} more
                    </div>`;
                }
                
                dayEventsContainer.innerHTML = eventsHTML;
            }
        });
    } catch (error) {
        console.error('Error loading events for calendar:', error);
    }
}

async function loadEvents() {
    try {
        const result = await strmsAPI.getEvents();
        const events = result.events || [];
        displayEventsList(events);
    } catch (error) {
        console.error('Error loading events:', error);
        showNotification('Error loading events', 'error');
    }
}

function displayEventsList(events) {
    const eventsList = document.getElementById('eventsList');
    const eventsCount = document.getElementById('eventsCount');
    
    // Filter events for current month
    const currentMonthEvents = events.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate.getMonth() === currentDate.getMonth() && 
               eventDate.getFullYear() === currentDate.getFullYear();
    });
    
    // Sort events by date
    currentMonthEvents.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    if (currentMonthEvents.length === 0) {
        eventsList.innerHTML = `
            <div class="empty-events">
                <i class="fas fa-calendar-plus"></i>
                <p>No events scheduled this month</p>
                <p>Add your first event to get started!</p>
            </div>
        `;
        eventsCount.textContent = '0 events';
        return;
    }
    
    eventsCount.textContent = `${currentMonthEvents.length} event${currentMonthEvents.length !== 1 ? 's' : ''}`;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    eventsList.innerHTML = currentMonthEvents.map(event => {
        const eventDate = new Date(event.date);
        eventDate.setHours(0, 0, 0, 0);
        
        const isPast = eventDate < today;
        const isToday = eventDate.getTime() === today.getTime();
        const isUpcoming = eventDate > today;
        
        return `
            <div class="event-item ${isUpcoming ? 'upcoming' : isPast ? 'past' : ''}">
                <div class="event-title">${event.title}</div>
                <div class="event-meta">
                    <div class="event-date">
                        <i class="far fa-calendar"></i>
                        ${formatEventDate(event.date)}
                    </div>
                    ${event.startTime ? `
                        <div class="event-time">
                            <i class="far fa-clock"></i>
                            ${event.startTime}${event.endTime ? ` - ${event.endTime}` : ''}
                        </div>
                    ` : ''}
                </div>
                ${event.description ? `<div class="event-description">${event.description}</div>` : ''}
                <div class="event-actions">
                    <button class="event-action-btn" onclick="editEvent(${event.id})" title="Edit">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="event-action-btn" onclick="deleteEvent(${event.id})" title="Delete">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function openEventModal(prefillDate = null) {
    const modal = document.getElementById('eventModal');
    const form = document.getElementById('eventForm');
    const title = document.getElementById('eventModalTitle');
    
    title.textContent = 'Add New Event';
    form.reset();
    document.getElementById('eventId').value = '';
    
    if (prefillDate) {
        document.getElementById('eventDate').value = prefillDate;
    } else {
        // Default to selected date or today
        const selectedDate = new Date(currentDate);
        document.getElementById('eventDate').value = selectedDate.toISOString().split('T')[0];
    }
    
    modal.classList.add('show');
}







function closeEventModal() {
    document.getElementById('eventModal').classList.remove('show');
}






async function saveEvent(e) {
    e.preventDefault();
    
    const eventData = {
        id: document.getElementById('eventId').value || null,
        title: document.getElementById('eventTitle').value,
        description: document.getElementById('eventDescription').value,
        date: document.getElementById('eventDate').value,
        startTime: document.getElementById('eventStartTime').value,
        endTime: document.getElementById('eventEndTime').value
    };









    // Validate required fields
    if (!eventData.title.trim()) {
        showNotification('Event title is required', 'error');
        return;
    }






    if (!eventData.date) {
        showNotification('Event date is required', 'error');
        return;
    }




    try {
        await strmsAPI.saveEvent(eventData);
        showNotification('Event saved successfully!', 'success');
        closeEventModal();
        renderCalendar();
        loadEvents();
    } catch (error) {
        console.error('Error saving event:', error);
        showNotification('Error saving event', 'error');
    }
}





async function viewEvent(eventId) {
    try {
        const result = await strmsAPI.getEvents();
        const event = result.events.find(e => e.id === eventId);
        
        if (event) {
            // Show event details in a view modal or alert
            const eventDate = new Date(event.date);
            const dateStr = eventDate.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            });
            
            let eventInfo = `Event: ${event.title}\nDate: ${dateStr}`;
            if (event.startTime) {
                eventInfo += `\nTime: ${event.startTime}${event.endTime ? ` - ${event.endTime}` : ''}`;
            }
            if (event.description) {
                eventInfo += `\nDescription: ${event.description}`;
            }
            
            alert(eventInfo);
        }
    } catch (error) {
        console.error('Error viewing event:', error);
        showNotification('Error viewing event', 'error');
    }
}






async function editEvent(eventId) {
    try {
        const result = await strmsAPI.getEvents();
        const event = result.events.find(e => e.id === eventId);
        
        if (event) {
            const modal = document.getElementById('eventModal');
            const form = document.getElementById('eventForm');
            const title = document.getElementById('eventModalTitle');
            
            title.textContent = 'Edit Event';
            document.getElementById('eventId').value = event.id;
            document.getElementById('eventTitle').value = event.title;
            document.getElementById('eventDescription').value = event.description || '';
            document.getElementById('eventDate').value = event.date;
            document.getElementById('eventStartTime').value = event.startTime || '';
            document.getElementById('eventEndTime').value = event.endTime || '';
            
            modal.classList.add('show');
        }
    } catch (error) {
        console.error('Error loading event for edit:', error);
        showNotification('Error loading event', 'error');
    }
}




async function deleteEvent(eventId) {
    if (!confirm('Are you sure you want to delete this event?')) {
        return;
    }




    try {
        await strmsAPI.deleteEvent(eventId);
        showNotification('Event deleted successfully!', 'success');
        renderCalendar();
        loadEvents();
    } catch (error) {
        console.error('Error deleting event:', error);
        showNotification('Error deleting event', 'error');
    }
}





function showDateEvents(date) {
    // Show all events for the selected date
    const eventsForDate = document.querySelectorAll(`[id^="events-${date}"] .day-event`);
    if (eventsForDate.length === 0) {
        alert(`No events scheduled for ${formatEventDate(date)}`);
        return;
    }
    
    let eventsList = `Events for ${formatEventDate(date)}:\n\n`;
    eventsForDate.forEach(event => {
        eventsList += `• ${event.textContent}\n`;
    });
    
    alert(eventsList);
}




// Utility functions
function formatEventDate(dateString) {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
        return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
        return 'Tomorrow';
    } else {
        return date.toLocaleDateString('en-US', { 
            weekday: 'short',
            month: 'short', 
            day: 'numeric',
            year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
        });
    }
}

// Keyboard navigation support
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeAllDropdowns();
        closeEventModal();
        document.getElementById('aiChatModal').classList.remove('show');
    }
    

    if (e.key === 'ArrowLeft' && !e.ctrlKey) {
        navigatePrevious();
    }
    
    if (e.key === 'ArrowRight' && !e.ctrlKey) {
        navigateNext();
    }
    
    if (e.key === 't' && e.ctrlKey) {
        e.preventDefault();
        goToToday();
    }
});


// Initialize the calendar when page loads
window.addEventListener('load', function() {
    // Highlight current month in dropdown
    document.querySelectorAll('.month-item').forEach(item => {
        if (parseInt(item.getAttribute('data-month')) === currentDate.getMonth()) {
            item.classList.add('current');
        }
    });
});