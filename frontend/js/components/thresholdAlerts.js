/**
 * Threshold Alerts Component
 * Displays real-time alerts when sensor readings exceed danger levels
 */

// DOM Elements
const alertPanelContainer = document.createElement('div');
alertPanelContainer.id = 'threshold-alert-panel';
alertPanelContainer.className = 'threshold-alert-panel';
document.body.appendChild(alertPanelContainer);

// Component state
let activeAlerts = [];
let isPanelDismissed = false; // Track if panel was manually dismissed
const THRESHOLDS = {
    seismic: 5.0,
    gas: 250,
    temperature: 45
};

/**
 * Initialize the Threshold Alerts component
 */
function initThresholdAlerts() {
    console.log('Initializing Threshold Alerts component...');
    // Initial render of empty alert panel
    renderAlertPanel();
}

/**
 * Check sensor data against thresholds
 * @param {Array} sensorData - The sensor data to check
 */
function checkThresholds(sensorData) {
    if (!sensorData || !Array.isArray(sensorData)) return;
    
    // If panel was manually dismissed, don't show new alerts
    if (isPanelDismissed) return;
    
    // Check each sensor against thresholds
    sensorData.forEach(sensor => {
        const { type, value, location, timestamp, _id, name } = sensor;
        
        // Skip if sensor type is not in our thresholds
        if (!(type in THRESHOLDS)) return;
        
        // Get threshold for this sensor type
        const threshold = THRESHOLDS[type];
        
        // Check if value exceeds threshold
        if (value > threshold) {
            // Format the value based on sensor type
            let formattedValue = '';
            let unit = '';
            
            switch (type) {
                case 'temperature':
                    formattedValue = value;
                    unit = '°C';
                    break;
                case 'gas':
                    formattedValue = value;
                    unit = 'ppm';
                    break;
                case 'seismic':
                    formattedValue = value.toFixed(1);
                    unit = '';
                    break;
            }
            
            // Check if this alert already exists
            const existingAlertIndex = activeAlerts.findIndex(alert => 
                alert._id === _id && alert.type === type
            );
            
            if (existingAlertIndex >= 0) {
                // Update existing alert
                activeAlerts[existingAlertIndex] = {
                    _id,
                    type,
                    value: formattedValue,
                    unit,
                    location,
                    timestamp,
                    name: name || `${type.charAt(0).toUpperCase() + type.slice(1)} Sensor`
                };
            } else {
                // Add new alert
                activeAlerts.push({
                    _id,
                    type,
                    value: formattedValue,
                    unit,
                    location,
                    timestamp,
                    name: name || `${type.charAt(0).toUpperCase() + type.slice(1)} Sensor`
                });
            }
        } else {
            // Remove alert if value no longer exceeds threshold
            activeAlerts = activeAlerts.filter(alert => 
                !(alert._id === _id && alert.type === type)
            );
        }
    });
    
    // Update the alert panel
    renderAlertPanel();
}

/**
 * Render the alert panel
 */
function renderAlertPanel() {
    // Clear the container
    clearElement(alertPanelContainer);
    
    // Hide panel if no active alerts or if manually dismissed
    if (activeAlerts.length === 0 || isPanelDismissed) {
        alertPanelContainer.classList.remove('active');
        return;
    }
    
    // Show panel if there are active alerts
    alertPanelContainer.classList.add('active');
    
    // Create header
    const headerElement = createElement('div', {
        className: 'threshold-alert-header'
    });
    
    const titleElement = createElement('div', {
        className: 'threshold-alert-title'
    }, 'DANGER: Threshold Exceeded');
    
    // Create close button with proper event handling
    const closeButton = createElement('button', {
        className: 'threshold-alert-close'
    }, '×');
    
    // Add click event listener directly
    closeButton.addEventListener('click', function() {
        isPanelDismissed = true;
        alertPanelContainer.classList.remove('active');
    });
    
    headerElement.appendChild(titleElement);
    headerElement.appendChild(closeButton);
    
    // Create alerts container
    const alertsContainer = createElement('div', {
        className: 'threshold-alerts-container'
    });
    
    // Add each alert
    activeAlerts.forEach(alert => {
        const alertElement = createAlertElement(alert);
        alertsContainer.appendChild(alertElement);
    });
    
    // Add elements to panel
    alertPanelContainer.appendChild(headerElement);
    alertPanelContainer.appendChild(alertsContainer);
}

/**
 * Create an alert element
 * @param {Object} alert - The alert data
 * @returns {HTMLElement} The alert element
 */
function createAlertElement(alert) {
    const alertElement = createElement('div', {
        className: 'threshold-alert-item',
        'data-id': alert._id
    });
    
    // Create alert icon based on type
    let iconSvg = '';
    switch (alert.type) {
        case 'temperature':
            iconSvg = `
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"></path>
                </svg>
            `;
            break;
        case 'gas':
            iconSvg = `
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M8 2h8"></path>
                    <path d="M12 14v-4"></path>
                    <rect x="6" y="6" width="12" height="12" rx="2"></rect>
                </svg>
            `;
            break;
        case 'seismic':
            iconSvg = `
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                </svg>
            `;
            break;
    }
    
    // Create icon element
    const iconElement = createElement('div', {
        className: 'threshold-alert-icon'
    });
    iconElement.innerHTML = iconSvg;
    
    // Create content container
    const contentElement = createElement('div', {
        className: 'threshold-alert-content'
    });
    
    // Create sensor name
    const nameElement = createElement('div', {
        className: 'threshold-alert-name'
    }, alert.name);
    
    // Create value
    const valueElement = createElement('div', {
        className: 'threshold-alert-value'
    }, `${alert.value}${alert.unit}`);
    
    // Create location and time
    const metaElement = createElement('div', {
        className: 'threshold-alert-meta'
    }, `${alert.location} • ${formatDate(alert.timestamp)}`);
    
    // Add elements to content
    contentElement.appendChild(nameElement);
    contentElement.appendChild(valueElement);
    contentElement.appendChild(metaElement);
    
    // Add dismiss button for individual alert with direct event listener
    const dismissButton = createElement('button', {
        className: 'threshold-alert-dismiss'
    }, 'Dismiss');
    
    // Add click event listener directly
    dismissButton.addEventListener('click', function(e) {
        e.stopPropagation();
        // Remove this specific alert
        activeAlerts = activeAlerts.filter(a => !(a._id === alert._id && a.type === alert.type));
        renderAlertPanel();
    });
    
    // Add all elements to alert
    alertElement.appendChild(iconElement);
    alertElement.appendChild(contentElement);
    alertElement.appendChild(dismissButton);
    
    return alertElement;
}

/**
 * Reset the dismissed state (used when new alerts come in)
 */
function resetAlertPanel() {
    isPanelDismissed = false;
    renderAlertPanel();
}

// Export functions
window.initThresholdAlerts = initThresholdAlerts;
window.checkThresholds = checkThresholds;
window.resetAlertPanel = resetAlertPanel;
