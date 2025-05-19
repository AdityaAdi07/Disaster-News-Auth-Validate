/**
 * Main Application JavaScript
 * Initializes the dashboard and handles tab switching
 */

// Application state
const appState = {
    activeTab: 'live-feed',
    websocketConnected: false,
    lastUpdate: null,
    alertCount: 0
};

// DOM Elements
const tabElements = document.querySelectorAll('.sidebar li');
const panels = document.querySelectorAll('.panel');
const alertCountElement = document.getElementById('alertCount');

/**
 * Initialize the application
 */
function initApp() {
    console.log('Initializing Disaster Information Dashboard...');
    
    // Set up tab navigation
    setupTabNavigation();
    
    // Connect to WebSocket server
    connectWebSocket();
    
    // Initial data load via REST API
    loadInitialData();
    
    // Initialize all components
    initComponents();
}

/**
 * Set up tab navigation
 */
function setupTabNavigation() {
    tabElements.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabId = tab.getAttribute('data-tab');
            switchTab(tabId);
        });
    });
}

/**
 * Switch active tab
 * @param {string} tabId - The ID of the tab to switch to
 */
function switchTab(tabId) {
    // Update active tab in state
    appState.activeTab = tabId;
    
    // Update UI
    tabElements.forEach(tab => {
        if (tab.getAttribute('data-tab') === tabId) {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });
    
    panels.forEach(panel => {
        if (panel.id === tabId) {
            panel.classList.add('active');
        } else {
            panel.classList.remove('active');
        }
    });
    
    // Special handling for map panel - refresh map when shown
    if (tabId === 'map' && typeof refreshMap === 'function') {
        refreshMap();
    }
    
    // Special handling for analytics panel - refresh charts when shown
    if (tabId === 'analytics' && typeof refreshCharts === 'function') {
        refreshCharts();
    }
}

/**
 * Load initial data from REST API
 */
function loadInitialData() {
    fetchDashboardData()
        .then(data => {
            // Update all components with initial data
            updateDashboardComponents(data);
            
            // Update last update timestamp
            appState.lastUpdate = new Date();
            
            console.log('Initial data loaded successfully');
        })
        .catch(error => {
            console.error('Error loading initial data:', error);
        });
}

/**
 * Initialize all dashboard components
 */
function initComponents() {
    // Initialize Live Feed
    if (typeof initLiveFeed === 'function') {
        initLiveFeed();
    }
    
    // Initialize Verified Alerts
    if (typeof initVerifiedAlerts === 'function') {
        initVerifiedAlerts();
    }
    
    // Initialize IoT Sensors
    if (typeof initIoTSensors === 'function') {
        initIoTSensors();
    }
    
    // Initialize Map
    if (typeof initMap === 'function') {
        initMap();
    }
    
    // Initialize Analytics
    if (typeof initAnalytics === 'function') {
        initAnalytics();
    }
    
    // Initialize Admin Panel
    if (typeof initAdminPanel === 'function') {
        initAdminPanel();
    }
    
    // Initialize Threshold Alerts
    if (typeof initThresholdAlerts === 'function') {
        initThresholdAlerts();
    }
    
    // Initialize AI Summary Panel
    if (typeof initAISummary === 'function') {
        initAISummary();
    }
}

/**
 * Update all dashboard components with new data
 * @param {Object} data - The dashboard data
 */
function updateDashboardComponents(data) {
    // Update Live Feed
    if (typeof updateLiveFeed === 'function' && data.socialPosts) {
        updateLiveFeed(data.socialPosts);
    }
    
    // Update Verified Alerts
    if (typeof updateVerifiedAlerts === 'function' && data.verifiedAlerts) {
        updateVerifiedAlerts(data.verifiedAlerts);
    }
    
    // Update IoT Sensors
    if (typeof updateIoTSensors === 'function' && data.iotSensorData) {
        updateIoTSensors(data.iotSensorData);
    }
    
    // Update Map
    if (typeof updateMap === 'function' && data.disasterAlerts) {
        updateMap(data.disasterAlerts);
    }
    
    // Update Analytics
    if (typeof updateAnalytics === 'function' && data.regionsStats) {
        updateAnalytics(data.regionsStats);
    }
    
    // Update Admin Panel
    if (typeof updateAdminPanel === 'function' && data.disasterAlerts) {
        updateAdminPanel(data.disasterAlerts);
    }
    
    // Update alert count
    updateAlertCount(data);
}

/**
 * Update the alert count badge
 * @param {Object} data - The dashboard data
 */
function updateAlertCount(data) {
    let count = 0;
    
    // Count active alerts
    if (data.disasterAlerts) {
        count = data.disasterAlerts.filter(alert => 
            alert.status === 'active' && !alert.viewed
        ).length;
    }
    
    // Update state and UI
    appState.alertCount = count;
    alertCountElement.textContent = count;
    
    // Hide badge if count is zero
    if (count === 0) {
        alertCountElement.style.display = 'none';
    } else {
        alertCountElement.style.display = 'flex';
    }
}

// Initialize the application when DOM is fully loaded
document.addEventListener('DOMContentLoaded', initApp);
