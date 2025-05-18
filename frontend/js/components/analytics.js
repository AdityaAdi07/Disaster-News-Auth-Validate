/**
 * Analytics Component
 * Displays disaster statistics and charts
 */

// DOM Elements
const disasterTypesChart = document.getElementById('disaster-types-chart');
const regionDisasterChart = document.getElementById('region-disaster-chart');

// Component state
let currentAnalyticsData = null;

/**
 * Initialize the Analytics component
 */
function initAnalytics() {
    console.log('Initializing Analytics component...');
    
    // Set up chart canvases
    if (disasterTypesChart && regionDisasterChart) {
        // Initialize empty charts
        createPieChart('disaster-types-chart', []);
        createBarChart('region-disaster-chart', []);
    } else {
        console.error('Chart canvas elements not found');
    }
}

/**
 * Update the Analytics with new data
 * @param {Object} data - The analytics data
 */
function updateAnalytics(data) {
    // Update current analytics data
    currentAnalyticsData = data;
    
    // Update charts
    updateCharts(data);
    
    // Update statistics
    updateStatistics(data);
}

/**
 * Update statistics display
 * @param {Object} data - The analytics data
 */
function updateStatistics(data) {
    // Check if data exists
    if (!data) {
        return;
    }
    
    // Update total disasters count if element exists
    const totalDisastersElement = document.getElementById('total-disasters');
    if (totalDisastersElement && data.totalDisasters !== undefined) {
        totalDisastersElement.textContent = data.totalDisasters;
    }
    
    // Update active alerts count if element exists
    const activeAlertsElement = document.getElementById('active-alerts');
    if (activeAlertsElement && data.activeAlerts !== undefined) {
        activeAlertsElement.textContent = data.activeAlerts;
    }
    
    // Update sensor status if element exists
    const sensorsOnlineElement = document.getElementById('sensors-online');
    if (sensorsOnlineElement && data.sensorsOnline !== undefined) {
        sensorsOnlineElement.textContent = `${data.sensorsOnline}/${data.totalSensors || 0}`;
    }
    
    // Update affected regions if element exists
    const affectedRegionsElement = document.getElementById('affected-regions');
    if (affectedRegionsElement && data.affectedRegions !== undefined) {
        affectedRegionsElement.textContent = data.affectedRegions;
    }
}

/**
 * Prepare data for charts
 * @param {Object} data - The analytics data
 * @returns {Object} The prepared chart data
 */
function prepareChartData(data) {
    // Default empty data
    const chartData = {
        disasterTypes: [],
        regionDisasters: []
    };
    
    // Check if data exists
    if (!data) {
        return chartData;
    }
    
    // Prepare disaster types data for pie chart
    if (data.disasterTypes) {
        chartData.disasterTypes = Object.entries(data.disasterTypes).map(([label, value]) => ({
            label,
            value
        }));
    }
    
    // Prepare region disasters data for bar chart
    if (data.regionDisasters) {
        chartData.regionDisasters = Object.entries(data.regionDisasters).map(([label, value]) => ({
            label,
            value
        }));
    }
    
    return chartData;
}

/**
 * Refresh charts when the analytics tab is shown
 */
function refreshCharts() {
    // Check if analytics data exists
    if (currentAnalyticsData) {
        // Update charts with current data
        updateCharts(currentAnalyticsData);
    } else {
        // Initialize empty charts
        if (disasterTypesChart && regionDisasterChart) {
            createPieChart('disaster-types-chart', []);
            createBarChart('region-disaster-chart', []);
        }
    }
}

/**
 * Create a statistics card
 * @param {string} title - The card title
 * @param {string|number} value - The card value
 * @param {string} icon - The card icon (SVG string)
 * @param {string} trend - The trend direction ('up', 'down', or 'neutral')
 * @param {string} trendValue - The trend value
 * @returns {HTMLElement} The card element
 */
function createStatCard(title, value, icon, trend = 'neutral', trendValue = '') {
    // Create card container
    const cardElement = createElement('div', {
        className: 'stat-card'
    });
    
    // Create card header
    const cardHeader = createElement('div', {
        className: 'stat-card-header'
    });
    
    // Create title element
    const titleElement = createElement('div', {
        className: 'stat-card-title'
    }, title);
    
    // Create icon element
    const iconElement = createElement('div', {
        className: 'stat-card-icon'
    });
    iconElement.innerHTML = icon;
    
    // Add title and icon to header
    cardHeader.appendChild(titleElement);
    cardHeader.appendChild(iconElement);
    
    // Create value element
    const valueElement = createElement('div', {
        className: 'stat-card-value'
    }, value);
    
    // Create trend element if trend is provided
    let trendElement = null;
    if (trend !== 'neutral' && trendValue) {
        // Determine trend icon and class
        let trendIcon = '';
        let trendClass = '';
        
        if (trend === 'up') {
            trendIcon = '↑';
            trendClass = 'trend-up';
        } else if (trend === 'down') {
            trendIcon = '↓';
            trendClass = 'trend-down';
        }
        
        // Create trend element
        trendElement = createElement('div', {
            className: `stat-card-trend ${trendClass}`
        }, `${trendIcon} ${trendValue}`);
    }
    
    // Add all elements to card
    cardElement.appendChild(cardHeader);
    cardElement.appendChild(valueElement);
    
    if (trendElement) {
        cardElement.appendChild(trendElement);
    }
    
    return cardElement;
}
