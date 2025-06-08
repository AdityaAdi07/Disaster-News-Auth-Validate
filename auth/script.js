function validateAdmin(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const submitBtn = event.target.querySelector('button[type="submit"]');

    // Add loading state
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;

    // Simulate network delay
    setTimeout(() => {
        if (username === 'aditya123' && password === '1234') {
            window.location.href = 'http://127.0.0.1:5000';
        } else {
            alert('Invalid username or password');
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
        }
    }, 1000);
}

function showLoginForm(type) {
    // Hide all forms first with fade out
    document.querySelectorAll('.login-form').forEach(form => {
        form.style.opacity = '0';
        setTimeout(() => {
            form.style.display = 'none';
        }, 300);
    });

    // Show the selected form with fade in
    setTimeout(() => {
        if (type === 'email') {
            const form = document.getElementById('emailForm');
            form.style.display = 'block';
            setTimeout(() => form.style.opacity = '1', 50);
        } else if (type === 'github') {
            const form = document.getElementById('githubForm');
            form.style.display = 'block';
            setTimeout(() => form.style.opacity = '1', 50);
        } else if (type === 'manual') {
            const form = document.getElementById('manualForm');
            form.style.display = 'block';
            setTimeout(() => form.style.opacity = '1', 50);
        }
    }, 300);
}

// Add form submission handlers for user login forms
document.getElementById('emailForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const submitBtn = event.target.querySelector('button[type="submit"]');
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;

    // Simulate network delay
    setTimeout(() => {
        alert('Email login functionality to be implemented');
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
    }, 1000);
});

document.getElementById('manualForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const submitBtn = event.target.querySelector('button[type="submit"]');
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;

    // Simulate network delay
    setTimeout(() => {
        alert('Manual login functionality to be implemented');
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
    }, 1000);
});

// Add input focus effects
document.querySelectorAll('input').forEach(input => {
    input.addEventListener('focus', function() {
        this.parentElement.classList.add('focused');
    });

    input.addEventListener('blur', function() {
        this.parentElement.classList.remove('focused');
    });
}); 