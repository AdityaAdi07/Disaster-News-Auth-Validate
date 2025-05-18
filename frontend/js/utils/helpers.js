/**
 * Helper Utility Functions
 * Common utility functions used throughout the application
 */

/**
 * Format a date as a readable string
 * @param {string|Date} dateString - The date to format
 * @returns {string} The formatted date string
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
        return 'Invalid date';
    }
    
    // Get current date for comparison
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Format date based on how recent it is
    if (date >= today) {
        // Today - show time only
        return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (date >= yesterday) {
        // Yesterday
        return `Yesterday at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else {
        // Older dates - show full date
        return date.toLocaleDateString([], { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
}

/**
 * Truncate text to a specified length
 * @param {string} text - The text to truncate
 * @param {number} maxLength - The maximum length
 * @returns {string} The truncated text
 */
function truncateText(text, maxLength = 100) {
    if (!text || text.length <= maxLength) {
        return text;
    }
    
    return text.substring(0, maxLength) + '...';
}

/**
 * Get confidence level class based on score
 * @param {number} score - The confidence score (0-1)
 * @returns {string} The CSS class name
 */
function getConfidenceClass(score) {
    if (score >= 0.7) {
        return 'confidence-high';
    } else if (score >= 0.4) {
        return 'confidence-medium';
    } else {
        return 'confidence-low';
    }
}

/**
 * Get severity class based on severity level
 * @param {string} severity - The severity level
 * @returns {string} The CSS class name
 */
function getSeverityClass(severity) {
    switch (severity.toLowerCase()) {
        case 'high':
            return 'high';
        case 'medium':
            return 'medium';
        case 'low':
            return 'low';
        default:
            return '';
    }
}

/**
 * Get status class based on status
 * @param {string} status - The status
 * @returns {string} The CSS class name
 */
function getStatusClass(status) {
    switch (status.toLowerCase()) {
        case 'active':
            return 'status-active';
        case 'resolved':
            return 'status-resolved';
        default:
            return '';
    }
}

/**
 * Create an element with attributes and content
 * @param {string} tag - The HTML tag name
 * @param {Object} attributes - The attributes to set
 * @param {string|Node|Array} content - The content to append
 * @returns {HTMLElement} The created element
 */
function createElement(tag, attributes = {}, content = null) {
    const element = document.createElement(tag);
    
    // Set attributes
    for (const [key, value] of Object.entries(attributes)) {
        if (key === 'className') {
            element.className = value;
        } else {
            element.setAttribute(key, value);
        }
    }
    
    // Add content
    if (content) {
        if (Array.isArray(content)) {
            content.forEach(item => {
                if (typeof item === 'string') {
                    element.appendChild(document.createTextNode(item));
                } else {
                    element.appendChild(item);
                }
            });
        } else if (typeof content === 'string') {
            element.textContent = content;
        } else {
            element.appendChild(content);
        }
    }
    
    return element;
}

/**
 * Clear all children from an element
 * @param {HTMLElement} element - The element to clear
 */
function clearElement(element) {
    while (element.firstChild) {
        element.removeChild(element.firstChild);
    }
}

/**
 * Show a notification toast
 * @param {string} message - The message to display
 * @param {string} type - The notification type (success, error, warning, info)
 * @param {number} duration - The duration in milliseconds
 */
function showNotification(message, type = 'info', duration = 3000) {
    // Create notification element
    const notification = createElement('div', {
        className: `notification notification-${type}`
    }, message);
    
    // Create notifications container if it doesn't exist
    let container = document.querySelector('.notifications-container');
    if (!container) {
        container = createElement('div', {
            className: 'notifications-container'
        });
        document.body.appendChild(container);
    }
    
    // Add notification to container
    container.appendChild(notification);
    
    // Show notification with animation
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Remove notification after duration
    setTimeout(() => {
        notification.classList.remove('show');
        
        // Remove from DOM after animation completes
        setTimeout(() => {
            container.removeChild(notification);
        }, 300);
    }, duration);
}

/**
 * Get sensor status based on readings and thresholds
 * @param {string} sensorType - The type of sensor
 * @param {number} value - The sensor reading
 * @returns {Object} The status object with class and label
 */
function getSensorStatus(sensorType, value) {
    // Define thresholds for different sensor types
    const thresholds = {
        temperature: {
            normal: { min: 0, max: 35 },
            warning: { min: -10, max: 45 },
        },
        humidity: {
            normal: { min: 30, max: 70 },
            warning: { min: 15, max: 85 },
        },
        gas: {
            normal: { min: 0, max: 50 },
            warning: { min: 0, max: 100 },
        },
        seismic: {
            normal: { min: 0, max: 2 },
            warning: { min: 0, max: 4 },
        }
    };
    
    // Get thresholds for sensor type
    const threshold = thresholds[sensorType] || {
        normal: { min: 0, max: 100 },
        warning: { min: 0, max: 100 }
    };
    
    // Determine status
    if (value >= threshold.normal.min && value <= threshold.normal.max) {
        return { class: 'sensor-normal', label: 'Normal' };
    } else if (value >= threshold.warning.min && value <= threshold.warning.max) {
        return { class: 'sensor-warning', label: 'Warning' };
    } else {
        return { class: 'sensor-danger', label: 'Danger' };
    }
}
