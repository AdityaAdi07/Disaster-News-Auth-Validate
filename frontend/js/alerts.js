document.addEventListener('DOMContentLoaded', function() {
    // Initialize alerts functionality
    initializeAlerts();
    
    // Initialize search functionality
    initializeSearch();
    
    // Initialize filter functionality
    initializeFilter();
});

function initializeAlerts() {
    // Add click handlers for alert actions
    document.querySelectorAll('.alert-actions .btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            const action = this.textContent.trim();
            const alertCard = this.closest('.alert-card');
            const alertTitle = alertCard.querySelector('h3').textContent;
            
            switch(action) {
                case 'Contact Response Team':
                    handleContactTeam(alertTitle);
                    break;
                case 'Share':
                    handleShare(alertTitle);
                    break;
                default:
                    if (this.querySelector('.fa-ellipsis-v')) {
                        handleMoreOptions(alertCard);
                    }
            }
        });
    });

    // Add hover effects for alert cards
    document.querySelectorAll('.alert-card').forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
}

function initializeSearch() {
    const searchInput = document.querySelector('.search-bar input');
    const alertsList = document.querySelector('.alerts-list');
    const alertCards = document.querySelectorAll('.alert-card');
    
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        
        alertCards.forEach(card => {
            const title = card.querySelector('h3').textContent.toLowerCase();
            const description = card.querySelector('p').textContent.toLowerCase();
            const location = card.querySelector('.detail-item span').textContent.toLowerCase();
            
            if (title.includes(searchTerm) || 
                description.includes(searchTerm) || 
                location.includes(searchTerm)) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    });
}

function initializeFilter() {
    const filterBtn = document.querySelector('.alerts-actions .btn-outline-secondary');
    
    filterBtn.addEventListener('click', function() {
        // Create and show filter modal
        const filterModal = createFilterModal();
        document.body.appendChild(filterModal);
        
        // Show modal with animation
        setTimeout(() => {
            filterModal.classList.add('show');
        }, 10);
    });
}

function createFilterModal() {
    const modal = document.createElement('div');
    modal.className = 'filter-modal';
    modal.innerHTML = `
        <div class="filter-modal-content">
            <div class="filter-modal-header">
                <h3>Filter Alerts</h3>
                <button class="close-btn">&times;</button>
            </div>
            <div class="filter-modal-body">
                <div class="filter-section">
                    <h4>Priority</h4>
                    <div class="filter-options">
                        <label>
                            <input type="checkbox" name="priority" value="high" checked>
                            High Priority
                        </label>
                        <label>
                            <input type="checkbox" name="priority" value="medium" checked>
                            Medium Priority
                        </label>
                        <label>
                            <input type="checkbox" name="priority" value="low" checked>
                            Low Priority
                        </label>
                    </div>
                </div>
                <div class="filter-section">
                    <h4>Time Range</h4>
                    <div class="filter-options">
                        <label>
                            <input type="radio" name="timeRange" value="24h" checked>
                            Last 24 Hours
                        </label>
                        <label>
                            <input type="radio" name="timeRange" value="7d">
                            Last 7 Days
                        </label>
                        <label>
                            <input type="radio" name="timeRange" value="30d">
                            Last 30 Days
                        </label>
                        <label>
                            <input type="radio" name="timeRange" value="all">
                            All Time
                        </label>
                    </div>
                </div>
            </div>
            <div class="filter-modal-footer">
                <button class="btn btn-secondary" id="resetFilter">Reset</button>
                <button class="btn btn-primary" id="applyFilter">Apply Filters</button>
            </div>
        </div>
    `;
    
    // Add event listeners
    modal.querySelector('.close-btn').addEventListener('click', () => {
        modal.classList.remove('show');
        setTimeout(() => modal.remove(), 300);
    });
    
    modal.querySelector('#resetFilter').addEventListener('click', () => {
        modal.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = true);
        modal.querySelector('input[value="24h"]').checked = true;
    });
    
    modal.querySelector('#applyFilter').addEventListener('click', () => {
        applyFilters(modal);
        modal.classList.remove('show');
        setTimeout(() => modal.remove(), 300);
    });
    
    return modal;
}

function applyFilters(modal) {
    const selectedPriorities = Array.from(modal.querySelectorAll('input[name="priority"]:checked'))
        .map(cb => cb.value);
    const selectedTimeRange = modal.querySelector('input[name="timeRange"]:checked').value;
    
    // Filter alert cards based on selected options
    document.querySelectorAll('.alert-card').forEach(card => {
        const priority = card.classList.contains('high-priority') ? 'high' :
                        card.classList.contains('medium-priority') ? 'medium' : 'low';
        
        if (selectedPriorities.includes(priority)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
    
    // In a real application, you would also filter based on time range
    console.log('Applied filters:', { priorities: selectedPriorities, timeRange: selectedTimeRange });
}

function handleContactTeam(alertTitle) {
    // In a real application, this would open a contact form or initiate a call
    console.log('Contacting response team for:', alertTitle);
    alert(`Contacting response team for ${alertTitle}`);
}

function handleShare(alertTitle) {
    // In a real application, this would open a share dialog
    console.log('Sharing alert:', alertTitle);
    alert(`Sharing ${alertTitle}`);
}

function handleMoreOptions(alertCard) {
    // Create and show options menu
    const menu = document.createElement('div');
    menu.className = 'options-menu';
    menu.innerHTML = `
        <ul>
            <li><i class="fas fa-edit"></i> Edit Alert</li>
            <li><i class="fas fa-archive"></i> Archive</li>
            <li><i class="fas fa-trash"></i> Delete</li>
        </ul>
    `;
    
    // Position menu
    const button = alertCard.querySelector('.fa-ellipsis-v').parentElement;
    const rect = button.getBoundingClientRect();
    menu.style.top = `${rect.bottom + 5}px`;
    menu.style.right = `${window.innerWidth - rect.right}px`;
    
    // Add click handlers
    menu.querySelectorAll('li').forEach(item => {
        item.addEventListener('click', function() {
            const action = this.textContent.trim();
            const alertTitle = alertCard.querySelector('h3').textContent;
            
            switch(action) {
                case 'Edit Alert':
                    console.log('Editing alert:', alertTitle);
                    break;
                case 'Archive':
                    console.log('Archiving alert:', alertTitle);
                    break;
                case 'Delete':
                    console.log('Deleting alert:', alertTitle);
                    break;
            }
            
            menu.remove();
        });
    });
    
    // Add click outside handler
    document.addEventListener('click', function closeMenu(e) {
        if (!menu.contains(e.target) && e.target !== button) {
            menu.remove();
            document.removeEventListener('click', closeMenu);
        }
    });
    
    document.body.appendChild(menu);
} 