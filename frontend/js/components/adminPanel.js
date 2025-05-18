/**
 * Admin Panel Component
 * Manages disaster alerts
 */

// DOM Elements
const alertsTableBody = document.getElementById('alerts-table-body');
const createAlertBtn = document.getElementById('create-alert-btn');

// Component state
let currentAlerts = [];

/**
 * Initialize the Admin Panel component
 */
function initAdminPanel() {
    console.log('Initializing Admin Panel component...');
    
    // Set up create alert button
    if (createAlertBtn) {
        createAlertBtn.addEventListener('click', handleCreateAlert);
    }
}

/**
 * Update the Admin Panel with new data
 * @param {Array} alerts - The disaster alerts
 */
function updateAdminPanel(alerts) {
    // Update current alerts
    currentAlerts = alerts;
    
    // Render alerts table
    renderAlertsTable(alerts);
}

/**
 * Render alerts table
 * @param {Array} alerts - The alerts to render
 */
function renderAlertsTable(alerts) {
    // Clear table body
    clearElement(alertsTableBody);
    
    // Check if alerts exist
    if (!alerts || alerts.length === 0) {
        // Create empty row
        const emptyRow = createElement('tr');
        const emptyCell = createElement('td', {
            colSpan: '7',
            className: 'empty-message'
        }, 'No alerts found.');
        
        emptyRow.appendChild(emptyCell);
        alertsTableBody.appendChild(emptyRow);
        return;
    }
    
    // Sort alerts by timestamp (newest first)
    const sortedAlerts = [...alerts].sort((a, b) => 
        new Date(b.timestamp) - new Date(a.timestamp)
    );
    
    // Create table rows
    sortedAlerts.forEach(alert => {
        const row = createAlertRow(alert);
        alertsTableBody.appendChild(row);
    });
}

/**
 * Create an alert table row
 * @param {Object} alert - The alert data
 * @returns {HTMLElement} The table row element
 */
function createAlertRow(alert) {
    // Create row
    const row = createElement('tr', {
        'data-id': alert._id
    });
    
    // Create timestamp cell
    const timestampCell = createElement('td', {}, formatDate(alert.timestamp));
    
    // Create location cell
    const locationCell = createElement('td', {}, alert.location);
    
    // Create disaster type cell
    const disasterTypeCell = createElement('td', {}, alert.disaster_type || '-');
    
    // Create severity cell
    const severityCell = createElement('td', {});
    
    // Add severity badge if available
    if (alert.severity) {
        const severityClass = getSeverityClass(alert.severity);
        const severityBadge = createElement('span', {
            className: `severity-badge ${severityClass}`
        }, alert.severity);
        
        severityCell.appendChild(severityBadge);
    } else {
        severityCell.textContent = '-';
    }
    
    // Create status cell
    const statusCell = createElement('td', {});
    
    // Add status badge if available
    if (alert.status) {
        const statusClass = getStatusClass(alert.status);
        const statusBadge = createElement('span', {
            className: `status-badge ${statusClass}`
        }, alert.status);
        
        statusCell.appendChild(statusBadge);
    } else {
        statusCell.textContent = '-';
    }
    
    // Create verified cell
    const verifiedCell = createElement('td', {});
    
    // Add verified badge
    const verifiedBadge = createElement('span', {
        className: `verified-badge ${alert.verified ? 'verified' : 'unverified'}`
    }, alert.verified ? 'Verified' : 'Unverified');
    
    verifiedCell.appendChild(verifiedBadge);
    
    // Create actions cell
    const actionsCell = createElement('td', {});
    
    // Create actions container
    const actionsContainer = createElement('div', {
        className: 'action-buttons'
    });
    
    // Create verify/unverify button
    const verifyBtn = createElement('button', {
        className: `btn ${alert.verified ? 'warning' : 'primary'}`,
        'data-action': 'verify'
    }, alert.verified ? 'Unverify' : 'Verify');
    
    // Add verify button event listener
    verifyBtn.addEventListener('click', () => handleVerifyAlert(alert._id, !alert.verified));
    
    // Create resolve button
    const resolveBtn = createElement('button', {
        className: 'btn primary',
        'data-action': 'resolve',
        disabled: alert.status === 'resolved'
    }, 'Resolve');
    
    // Add resolve button event listener
    resolveBtn.addEventListener('click', () => handleResolveAlert(alert._id));
    
    // Create delete button
    const deleteBtn = createElement('button', {
        className: 'btn danger',
        'data-action': 'delete'
    }, 'Delete');
    
    // Add delete button event listener
    deleteBtn.addEventListener('click', () => handleDeleteAlert(alert._id));
    
    // Create SMS button
    const smsBtn = createElement('button', {
        className: 'btn primary',
        'data-action': 'sms'
    }, 'SMS');
    
    // Add SMS button event listener
    smsBtn.addEventListener('click', () => handleSendSMS(alert._id));
    
    // Add buttons to actions container
    actionsContainer.appendChild(verifyBtn);
    actionsContainer.appendChild(resolveBtn);
    actionsContainer.appendChild(deleteBtn);
    actionsContainer.appendChild(smsBtn);
    
    // Add actions container to cell
    actionsCell.appendChild(actionsContainer);
    
    // Add cells to row
    row.appendChild(timestampCell);
    row.appendChild(locationCell);
    row.appendChild(disasterTypeCell);
    row.appendChild(severityCell);
    row.appendChild(statusCell);
    row.appendChild(verifiedCell);
    row.appendChild(actionsCell);
    
    return row;
}

/**
 * Handle verify/unverify alert
 * @param {string} alertId - The alert ID
 * @param {boolean} verified - Whether the alert is verified
 */
async function handleVerifyAlert(alertId, verified) {
    try {
        // Show loading state
        showNotification('Updating alert...', 'info');
        
        // Call API to verify/unverify alert
        const updatedAlert = await verifyAlert(alertId, verified);
        
        // Show success notification
        showNotification(
            `Alert ${verified ? 'verified' : 'unverified'} successfully`,
            'success'
        );
        
        // Update row in table
        updateAlertRow(updatedAlert);
    } catch (error) {
        console.error('Error verifying alert:', error);
        
        // Show error notification
        showNotification(
            `Error ${verified ? 'verifying' : 'unverifying'} alert: ${error.message}`,
            'error'
        );
    }
}

/**
 * Handle resolve alert
 * @param {string} alertId - The alert ID
 */
async function handleResolveAlert(alertId) {
    try {
        // Show loading state
        showNotification('Resolving alert...', 'info');
        
        // Call API to resolve alert
        const updatedAlert = await resolveAlert(alertId);
        
        // Show success notification
        showNotification('Alert resolved successfully', 'success');
        
        // Update row in table
        updateAlertRow(updatedAlert);
    } catch (error) {
        console.error('Error resolving alert:', error);
        
        // Show error notification
        showNotification(`Error resolving alert: ${error.message}`, 'error');
    }
}

/**
 * Handle delete alert
 * @param {string} alertId - The alert ID
 */
async function handleDeleteAlert(alertId) {
    // Confirm deletion
    if (!confirm('Are you sure you want to delete this alert?')) {
        return;
    }
    
    try {
        // Show loading state
        showNotification('Deleting alert...', 'info');
        
        // Call API to delete alert
        await deleteAlert(alertId);
        
        // Show success notification
        showNotification('Alert deleted successfully', 'success');
        
        // Remove row from table
        const row = alertsTableBody.querySelector(`tr[data-id="${alertId}"]`);
        if (row) {
            row.remove();
        }
        
        // Update current alerts
        currentAlerts = currentAlerts.filter(alert => alert._id !== alertId);
    } catch (error) {
        console.error('Error deleting alert:', error);
        
        // Show error notification
        showNotification(`Error deleting alert: ${error.message}`, 'error');
    }
}

/**
 * Handle send SMS
 * @param {string} alertId - The alert ID
 */
async function handleSendSMS(alertId) {
    try {
        // Show loading state
        showNotification('Sending SMS alert...', 'info');
        
        // Call API to send SMS
        await sendSMSAlert(alertId);
        
        // Show success notification
        showNotification('SMS alert sent successfully', 'success');
    } catch (error) {
        console.error('Error sending SMS alert:', error);
        
        // Show error notification
        showNotification(`Error sending SMS alert: ${error.message}`, 'error');
    }
}

/**
 * Handle create alert
 */
function handleCreateAlert() {
    // Create modal HTML
    const modalHTML = `
        <div class="modal-header">
            <h3>Create New Alert</h3>
            <button class="close-btn">&times;</button>
        </div>
        <div class="modal-body">
            <form id="create-alert-form">
                <div class="form-group">
                    <label for="disaster-type">Disaster Type</label>
                    <select id="disaster-type" required>
                        <option value="">Select Disaster Type</option>
                        <option value="flood">Flood</option>
                        <option value="earthquake">Earthquake</option>
                        <option value="fire">Fire</option>
                        <option value="cyclone">Cyclone</option>
                        <option value="landslide">Landslide</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="location">Location</label>
                    <input type="text" id="location" required>
                </div>
                <div class="form-group">
                    <label for="coordinates">Coordinates (Latitude, Longitude)</label>
                    <input type="text" id="coordinates" placeholder="e.g. 20.5937, 78.9629" required>
                </div>
                <div class="form-group">
                    <label for="severity">Severity</label>
                    <select id="severity" required>
                        <option value="">Select Severity</option>
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="content">Description</label>
                    <textarea id="content" rows="3"></textarea>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn" id="cancel-alert-btn">Cancel</button>
                    <button type="submit" class="btn primary">Create Alert</button>
                </div>
            </form>
        </div>
    `;
    
    // Create modal element
    const modalElement = createElement('div', {
        className: 'modal'
    });
    
    // Create modal content
    const modalContent = createElement('div', {
        className: 'modal-content'
    });
    
    // Set modal content HTML
    modalContent.innerHTML = modalHTML;
    
    // Add modal content to modal
    modalElement.appendChild(modalContent);
    
    // Add modal to document
    document.body.appendChild(modalElement);
    
    // Add modal overlay
    const overlayElement = createElement('div', {
        className: 'modal-overlay'
    });
    
    document.body.appendChild(overlayElement);
    
    // Show modal
    setTimeout(() => {
        modalElement.classList.add('show');
        overlayElement.classList.add('show');
    }, 10);
    
    // Set up close button
    const closeBtn = modalContent.querySelector('.close-btn');
    closeBtn.addEventListener('click', closeModal);
    
    // Set up cancel button
    const cancelBtn = modalContent.querySelector('#cancel-alert-btn');
    cancelBtn.addEventListener('click', closeModal);
    
    // Set up form submission
    const form = modalContent.querySelector('#create-alert-form');
    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        
        // Get form values
        const disasterType = form.querySelector('#disaster-type').value;
        const location = form.querySelector('#location').value;
        const coordinatesStr = form.querySelector('#coordinates').value;
        const severity = form.querySelector('#severity').value;
        const content = form.querySelector('#content').value;
        
        // Parse coordinates
        let coordinates = [];
        try {
            coordinates = coordinatesStr.split(',').map(coord => parseFloat(coord.trim()));
            
            // Validate coordinates
            if (coordinates.length !== 2 || isNaN(coordinates[0]) || isNaN(coordinates[1])) {
                throw new Error('Invalid coordinates format');
            }
        } catch (error) {
            showNotification('Invalid coordinates format. Please use "latitude, longitude"', 'error');
            return;
        }
        
        // Create alert data
        const alertData = {
            disaster_type: disasterType,
            location,
            coordinates,
            severity,
            content,
            status: 'active',
            verified: false,
            timestamp: new Date().toISOString()
        };
        
        try {
            // Show loading state
            showNotification('Creating alert...', 'info');
            
            // Call API to create alert
            const newAlert = await createAlert(alertData);
            
            // Show success notification
            showNotification('Alert created successfully', 'success');
            
            // Close modal
            closeModal();
            
            // Add new alert to table
            currentAlerts.unshift(newAlert);
            renderAlertsTable(currentAlerts);
        } catch (error) {
            console.error('Error creating alert:', error);
            
            // Show error notification
            showNotification(`Error creating alert: ${error.message}`, 'error');
        }
    });
    
    // Function to close modal
    function closeModal() {
        modalElement.classList.remove('show');
        overlayElement.classList.remove('show');
        
        // Remove modal after animation
        setTimeout(() => {
            document.body.removeChild(modalElement);
            document.body.removeChild(overlayElement);
        }, 300);
    }
}

/**
 * Update an alert row in the table
 * @param {Object} updatedAlert - The updated alert data
 */
function updateAlertRow(updatedAlert) {
    // Find alert in current alerts
    const alertIndex = currentAlerts.findIndex(alert => alert._id === updatedAlert._id);
    
    if (alertIndex !== -1) {
        // Update alert in current alerts
        currentAlerts[alertIndex] = updatedAlert;
        
        // Find row in table
        const row = alertsTableBody.querySelector(`tr[data-id="${updatedAlert._id}"]`);
        
        if (row) {
            // Replace row with updated row
            const updatedRow = createAlertRow(updatedAlert);
            row.parentNode.replaceChild(updatedRow, row);
        }
    }
}
