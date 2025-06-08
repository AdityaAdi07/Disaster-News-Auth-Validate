// Theme Toggle Functionality
document.addEventListener('DOMContentLoaded', function() {
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = themeToggle.querySelector('i');
    
    // Add span element if it doesn't exist
    if (!themeToggle.querySelector('span')) {
        const span = document.createElement('span');
        span.className = 'ms-2';
        themeToggle.appendChild(span);
    }
    const themeText = themeToggle.querySelector('span');
    
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeUI(savedTheme);
    
    // Theme toggle click handler
    themeToggle.addEventListener('click', function() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        // Add transition class to body
        document.body.classList.add('theme-transitioning');
        
        // Update theme
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        
        // Update UI
        updateThemeUI(newTheme);
        
        // Remove transition class after animation
        setTimeout(() => {
            document.body.classList.remove('theme-transitioning');
        }, 300);
    });
    
    // Update theme UI elements
    function updateThemeUI(theme) {
        if (theme === 'dark') {
            themeIcon.className = 'fas fa-sun';
            themeText.textContent = 'Light Mode';
            themeToggle.classList.remove('btn-outline-light');
            themeToggle.classList.add('btn-outline-primary');
        } else {
            themeIcon.className = 'fas fa-moon';
            themeText.textContent = 'Dark Mode';
            themeToggle.classList.remove('btn-outline-primary');
            themeToggle.classList.add('btn-outline-light');
        }
    }

    // Add transition styles
    const style = document.createElement('style');
    style.textContent = `
        .theme-transitioning * {
            transition: background-color 0.3s ease,
                        color 0.3s ease,
                        border-color 0.3s ease,
                        box-shadow 0.3s ease !important;
        }
        
        .btn-outline-primary {
            color: var(--primary-color);
            border-color: var(--primary-color);
        }
        
        .btn-outline-primary:hover {
            background-color: var(--primary-color);
            color: white;
        }
        
        [data-theme="dark"] .btn-outline-primary {
            color: var(--text-primary-dark);
            border-color: var(--primary-color);
        }
        
        [data-theme="dark"] .btn-outline-primary:hover {
            background-color: var(--primary-color);
            color: white;
        }
    `;
    document.head.appendChild(style);
}); 