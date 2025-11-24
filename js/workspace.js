document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    if (!strmsAPI.isAuthenticated()) {
        window.location.href = 'index.html';
        return;
    }

    // Initialize workspace
    loadTasks();
    setupEventListeners();
    setupSearchAndFilters();
});

function setupEventListeners() {
    // Logout button
    document.getElementById('logoutBtn').addEventListener('click', function() {
        strmsAPI.logout();
        window.location.href = 'index.html';
    });

    // Add task button
    document.getElementById('addTaskBtn').addEventListener('click', openTaskModal);

    // Task form submission
    document.getElementById('taskForm').addEventListener('submit', saveTask);

    // Progress slider
    document.getElementById('taskProgress').addEventListener('input', function() {
        document.getElementById('progressValue').textContent = this.value + '%';
    });

    // Close modal
    document.querySelector('.close-modal').addEventListener('click', closeTaskModal);

    // Close modal when clicking outside
    document.getElementById('taskModal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeTaskModal();
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

function setupSearchAndFilters() {
    const searchInput = document.getElementById('taskSearch');
    const priorityFilter = document.getElementById('priorityFilter');
    const progressFilter = document.getElementById('progressFilter');

    // Debounce search
    let searchTimeout;
    searchInput.addEventListener('input', function() {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            loadTasks();
        }, 300);
    });

    // Filter changes
    priorityFilter.addEventListener('change', loadTasks);
    progressFilter.addEventListener('change', loadTasks);
}

async function loadTasks() {
    try {
        const result = await strmsAPI.getTasks();
        const tasks = result.tasks || [];
        
        displayTasks(tasks);
        updateEmptyState(tasks.length === 0);
    } catch (error) {
        console.error('Error loading tasks:', error);
        showNotification('Error loading tasks', 'error');
    }
}

function displayTasks(tasks) {
    const tasksGrid = document.getElementById('tasksGrid');
    const searchTerm = document.getElementById('taskSearch').value.toLowerCase();
    const priorityFilter = document.getElementById('priorityFilter').value;
    const progressFilter = document.getElementById('progressFilter').value;

    // Filter tasks
    let filteredTasks = tasks.filter(task => {
        // Search filter
        if (searchTerm && !task.title.toLowerCase().includes(searchTerm) && 
            !task.description.toLowerCase().includes(searchTerm)) {
            return false;
        }

        // Priority filter
        if (priorityFilter && task.priority !== priorityFilter) {
            return false;
        }

        // Progress filter
        if (progressFilter === 'incomplete' && task.progress === 100) {
            return false;
        }
        if (progressFilter === 'complete' && task.progress < 100) {
            return false;
        }

        return true;
    });

    // Sort tasks: incomplete first, then by due date, then by priority
    filteredTasks.sort((a, b) => {
        // Completed tasks last
        if (a.progress === 100 && b.progress < 100) return 1;
        if (a.progress < 100 && b.progress === 100) return -1;

        // Then by due date (soonest first)
        if (a.dueDate && b.dueDate) {
            const dateA = new Date(a.dueDate);
            const dateB = new Date(b.dueDate);
            if (dateA < dateB) return -1;
            if (dateA > dateB) return 1;
        } else if (a.dueDate) return -1;
        else if (b.dueDate) return 1;

        // Then by priority (high first)
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
    });

    if (filteredTasks.length === 0) {
        tasksGrid.innerHTML = '';
        return;
    }

    tasksGrid.innerHTML = filteredTasks.map(task => `
        <div class="task-card ${task.progress === 100 ? 'completed' : ''}">
            <div class="task-header">
                <div class="task-title">${task.title}</div>
                <div class="task-actions">
                    <button class="task-action-btn" onclick="editTask(${task.id})" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="task-action-btn" onclick="deleteTask(${task.id})" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            
            ${task.description ? `<div class="task-description">${task.description}</div>` : ''}
            
            <div class="task-meta">
                <span class="task-priority priority-${task.priority}">
                    ${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
                </span>
                ${task.dueDate ? `
                    <span class="task-due-date ${getDueDateClass(task.dueDate, task.progress)}">
                        <i class="far fa-clock"></i>
                        ${formatDueDate(task.dueDate)}
                    </span>
                ` : ''}
            </div>
            
            <div class="task-progress">
                <div class="progress-info">
                    <span>Progress</span>
                    <span>${task.progress}%</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${task.progress}%"></div>
                </div>
            </div>
        </div>
    `).join('');
}

function updateEmptyState(isEmpty) {
    const emptyState = document.getElementById('emptyState');
    const tasksGrid = document.getElementById('tasksGrid');
    
    if (isEmpty) {
        emptyState.style.display = 'block';
        tasksGrid.style.display = 'none';
    } else {
        emptyState.style.display = 'none';
        tasksGrid.style.display = 'grid';
    }
}

function openTaskModal(task = null) {
    const modal = document.getElementById('taskModal');
    const form = document.getElementById('taskForm');
    const title = document.getElementById('taskModalTitle');
    
    if (task) {
        // Edit mode
        title.textContent = 'Edit Task';
        document.getElementById('taskId').value = task.id;
        document.getElementById('taskTitle').value = task.title;
        document.getElementById('taskDescription').value = task.description || '';
        document.getElementById('taskPriority').value = task.priority;
        document.getElementById('taskDueDate').value = task.dueDate || '';
        document.getElementById('taskProgress').value = task.progress;
        document.getElementById('progressValue').textContent = task.progress + '%';
    } else {
        // Add mode
        title.textContent = 'Add New Task';
        form.reset();
        document.getElementById('taskId').value = '';
        document.getElementById('progressValue').textContent = '0%';
    }
    
    modal.classList.add('show');
}

function closeTaskModal() {
    document.getElementById('taskModal').classList.remove('show');
}

async function saveTask(e) {
    e.preventDefault();
    
    const taskData = {
        id: document.getElementById('taskId').value || null,
        title: document.getElementById('taskTitle').value,
        description: document.getElementById('taskDescription').value,
        priority: document.getElementById('taskPriority').value,
        dueDate: document.getElementById('taskDueDate').value,
        progress: parseInt(document.getElementById('taskProgress').value)
    };

    try {
        await strmsAPI.saveTask(taskData);
        showNotification('Task saved successfully!', 'success');
        closeTaskModal();
        loadTasks();
    } catch (error) {
        console.error('Error saving task:', error);
        showNotification('Error saving task', 'error');
    }
}

async function editTask(taskId) {
    try {
        const result = await strmsAPI.getTasks();
        const task = result.tasks.find(t => t.id === taskId);
        
        if (task) {
            openTaskModal(task);
        }
    } catch (error) {
        console.error('Error loading task for edit:', error);
        showNotification('Error loading task', 'error');
    }
}

async function deleteTask(taskId) {
    if (!confirm('Are you sure you want to delete this task?')) {
        return;
    }

    try {
        await strmsAPI.deleteTask(taskId);
        showNotification('Task deleted successfully!', 'success');
        loadTasks();
    } catch (error) {
        console.error('Error deleting task:', error);
        showNotification('Error deleting task', 'error');
    }
}

// Utility functions
function formatDueDate(dateString) {
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
            month: 'short', 
            day: 'numeric',
            year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
        });
    }
}

function getDueDateClass(dueDate, progress) {
    if (progress === 100) return '';
    
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'overdue';
    if (diffDays <= 3) return 'due-soon';
    return '';
}