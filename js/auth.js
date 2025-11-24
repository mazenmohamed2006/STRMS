document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const tabBtns = document.querySelectorAll('.tab-btn');
    const fillDemoBtn = document.getElementById('fillDemo');

    // Check if user is already logged in
    if (strmsAPI.isAuthenticated()) {
        window.location.href = 'dashboard.html';
        return;
    }

    // Tab switching
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const tab = this.getAttribute('data-tab');
            
            // Update active tab button
            tabBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Show corresponding form
            document.querySelectorAll('.auth-form').forEach(form => {
                form.classList.remove('active');
            });
            document.getElementById(`${tab}Form`).classList.add('active');
        });
    });

    // Fill demo credentials
    fillDemoBtn.addEventListener('click', function() {
        const randomDemo = Math.floor(Math.random() * 10) + 1;
        document.getElementById('loginEmail').value = `demo${randomDemo}@strms.com`;
        document.getElementById('loginPassword').value = 'demo123';
    });

    // Login form submission
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        const submitBtn = this.querySelector('button[type="submit"]');
        submitBtn.textContent = 'Logging in...';
        submitBtn.disabled = true;

        try {
            const result = await strmsAPI.login(email, password);
            showNotification('Login successful!', 'success');
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1000);
        } catch (error) {
            showNotification(error.message, 'error');
        } finally {
            submitBtn.textContent = 'Login';
            submitBtn.disabled = false;
        }
    });

    // Register form submission
    registerForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const userData = {
            firstName: document.getElementById('firstName').value,
            lastName: document.getElementById('lastName').value,
            email: document.getElementById('registerEmail').value,
            password: document.getElementById('registerPassword').value
        };

        const submitBtn = this.querySelector('button[type="submit"]');
        submitBtn.textContent = 'Creating Account...';
        submitBtn.disabled = true;

        try {
            const result = await strmsAPI.register(userData);
            showNotification('Registration successful!', 'success');
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1000);
        } catch (error) {
            showNotification(error.message, 'error');
        } finally {
            submitBtn.textContent = 'Register';
            submitBtn.disabled = false;
        }
    });
});