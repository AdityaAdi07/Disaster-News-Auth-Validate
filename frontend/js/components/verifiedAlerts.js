/**
 * Verified Alerts Component
 * Displays verified alerts from social posts and disaster alerts
 */

// DOM Elements
const verifiedAlertsContainer = document.getElementById('verified-alerts-container');

// Component state
let currentVerifiedAlerts = [];

/**
 * Initialize the Verified Alerts component
 */
function initVerifiedAlerts() {
    console.log('Initializing Verified Alerts component...');
}

/**
 * Update the Verified Alerts with new data
 * @param {Array} alerts - The verified alerts
 */
function updateVerifiedAlerts(alerts) {
    // Update current alerts
    currentVerifiedAlerts = alerts;
    
    // Render alerts
    renderVerifiedAlerts(alerts);
}

/**
 * Render verified alerts
 * @param {Array} alerts - The alerts to render
 */
function renderVerifiedAlerts(alerts) {
    // Clear container
    clearElement(verifiedAlertsContainer);
    
    // Check if alerts exist
    if (!alerts || alerts.length === 0) {
        const emptyMessage = createElement('div', {
            className: 'empty-message'
        }, 'No verified alerts found.');
        
        verifiedAlertsContainer.appendChild(emptyMessage);
        return;
    }
    
    // Sort alerts by timestamp (newest first)
    const sortedAlerts = [...alerts].sort((a, b) => 
        new Date(b.timestamp) - new Date(a.timestamp)
    );
    
    // Create alert elements
    sortedAlerts.forEach(alert => {
        const alertElement = createAlertElement(alert);
        verifiedAlertsContainer.appendChild(alertElement);
        
        // Add fade-in animation
        setTimeout(() => {
            alertElement.classList.add('visible');
        }, 10);
    });
}

/**
 * Create an alert element
 * @param {Object} alert - The alert data
 * @returns {HTMLElement} The alert element
 */
function createAlertElement(alert) {
    // Get severity class
    const severityClass = getSeverityClass(alert.severity || 'medium');
    
    // Create alert container
    const alertElement = createElement('div', {
        className: `alert-card ${severityClass}`,
        'data-id': alert._id
    });
    
    // Create alert header
    const alertHeader = createElement('div', {
        className: 'alert-header'
    });
    
    // Create alert type element
    const typeElement = createElement('div', {
        className: 'alert-type'
    }, alert.disaster_type || 'Alert');
    
    // Create timestamp element
    const timestampElement = createElement('div', {
        className: 'alert-timestamp'
    }, formatDate(alert.timestamp));
    
    // Add type and timestamp to header
    alertHeader.appendChild(typeElement);
    alertHeader.appendChild(timestampElement);
    
    // Create alert location
    const locationElement = createElement('div', {
        className: 'alert-location'
    }, `📍 ${alert.location}`);
    
    // Create alert content if available
    let contentElement = null;
    if (alert.content) {
        contentElement = createElement('div', {
            className: 'alert-content'
        }, alert.content);
    }
    
    // Create alert status if available
    let statusElement = null;
    if (alert.status) {
        const statusClass = getStatusClass(alert.status);
        statusElement = createElement('div', {
            className: `alert-status ${statusClass}`
        }, alert.status);
    }
    
    // Create alert severity if available
    let severityElement = null;
    if (alert.severity) {
        severityElement = createElement('div', {
            className: 'alert-severity'
        }, `Severity: ${alert.severity}`);
    }
    
    // Create alert footer
    const alertFooter = createElement('div', {
        className: 'alert-footer'
    });
    
    // Add status and severity to footer if available
    if (statusElement) {
        alertFooter.appendChild(statusElement);
    }
    
    if (severityElement) {
        alertFooter.appendChild(severityElement);
    }
    
    // Add source if available
    if (alert.source) {
        const sourceElement = createElement('div', {
            className: 'alert-source'
        }, `Source: ${alert.source}`);
        
        alertFooter.appendChild(sourceElement);
    }
    
    // Add all elements to alert container
    alertElement.appendChild(alertHeader);
    alertElement.appendChild(locationElement);
    
    if (contentElement) {
        alertElement.appendChild(contentElement);
    }
    
    alertElement.appendChild(alertFooter);
    
    return alertElement;
}
