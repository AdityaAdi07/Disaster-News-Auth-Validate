/**
 * Analytics Component
 * Displays disaster statistics and charts
 */

// DOM Elements
const disasterTypesChart = document.getElementById('disaster-types-chart');
const regionDisasterChart = document.getElementById('region-disaster-chart');
const disasterTrendChart = document.getElementById('disaster-trend-chart');
const sensorAlertChart = document.getElementById('sensor-alert-chart');
const responseTimeChart = document.getElementById('response-time-chart');
const resourceAllocationChart = document.getElementById('resource-allocation-chart');
const synapseGauge = document.getElementById('synapse-gauge');
const synapseScoreValue = document.getElementById('synapse-score-value');
const exportPdfButton = document.getElementById('export-pdf');
const refreshAnalyticsButton = document.getElementById('refresh-analytics');
const dateRangeSelect = document.getElementById('date-range');
const trendChartTypeSelect = document.getElementById('trend-chart-type');
const lastUpdatedSpan = document.getElementById('last-updated');
const printDateSpan = document.getElementById('print-date');

// Component state
let currentAnalyticsData = null;
let charts = {};
let synapseScore = 78; // Default value
let isFullscreenMode = false;
let fullscreenChart = null;

/**
 * Initialize the Analytics component
 */
function initAnalytics() {
    console.log('Initializing Analytics component...');
    
    // Set up chart canvases
    if (disasterTypesChart && regionDisasterChart && disasterTrendChart) {
        // Initialize empty charts
        charts.disasterTypes = createPieChart('disaster-types-chart', [], {
            interactive: true,
            showLegend: true,
            donut: true
        });
        
        charts.regionDisasters = createBarChart('region-disaster-chart', [], {
            interactive: true,
            showLegend: true,
            showGrid: true
        });
        
        charts.disasterTrend = createLineChart('disaster-trend-chart', [], {
            interactive: true,
            showLegend: true,
            showGrid: true,
            multiSeries: true
        });
        
        if (sensorAlertChart) {
            charts.sensorAlerts = createPieChart('sensor-alert-chart', [], {
                interactive: true,
                showLegend: true,
                donut: false
            });
        }
        
        if (responseTimeChart) {
            charts.responseTime = createLineChart('response-time-chart', [], {
                interactive: true,
                showLegend: true,
                showGrid: true
            });
        }
        
        if (resourceAllocationChart) {
            charts.resourceAllocation = createBarChart('resource-allocation-chart', [], {
                interactive: true,
                showLegend: true,
                showGrid: true,
                horizontal: true
            });
        }
    } else {
        console.error('Chart canvas elements not found');
    }
    
    // Initialize synapse gauge
    if (synapseGauge) {
        initSynapseGauge();
    }
    
    // Set event listeners
    setupEventListeners();
    
    // Set current date for print
    if (printDateSpan) {
        printDateSpan.textContent = new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
}

/**
 * Set up event listeners for analytics components
 */
function setupEventListeners() {
    // Export PDF button
    if (exportPdfButton) {
        exportPdfButton.addEventListener('click', exportAnalyticsToPdf);
    }
    
    // Refresh button
    if (refreshAnalyticsButton) {
        refreshAnalyticsButton.addEventListener('click', () => {
            refreshAnalyticsData();
            showToast('Analytics data refreshed', 'success');
        });
    }
    
    // Date range filter
    if (dateRangeSelect) {
        dateRangeSelect.addEventListener('change', () => {
            refreshAnalyticsData();
        });
    }
    
    // Trend chart type filter
    if (trendChartTypeSelect) {
        trendChartTypeSelect.addEventListener('change', () => {
            updateTrendChart();
        });
    }
    
    // Chart action buttons
    document.querySelectorAll('.chart-action-btn').forEach(button => {
        button.addEventListener('click', handleChartAction);
    });
    
    // Listen for tab changes to refresh charts
    document.querySelectorAll('.sidebar li').forEach(item => {
        item.addEventListener('click', function() {
            if (this.dataset.tab === 'analytics') {
                setTimeout(refreshCharts, 100);
            }
        });
    });
}

/**
 * Handle chart actions (download, fullscreen)
 * @param {Event} event - The click event
 */
function handleChartAction(event) {
    const button = event.currentTarget;
    const action = button.dataset.action;
    const chartId = button.dataset.chart;
    
    if (action === 'download') {
        downloadChart(chartId);
    } else if (action === 'fullscreen') {
        openChartFullscreen(chartId);
    }
}

/**
 * Download chart as image
 * @param {string} chartId - The ID of the chart canvas
 */
function downloadChart(chartId) {
    const canvas = document.getElementById(chartId);
    if (!canvas) return;
    
    // Create a temporary link
    const link = document.createElement('a');
    link.download = `${chartId}-${new Date().toISOString().split('T')[0]}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    
    showToast('Chart downloaded successfully', 'success');
}

/**
 * Open chart in fullscreen mode
 * @param {string} chartId - The ID of the chart canvas
 */
function openChartFullscreen(chartId) {
    const canvas = document.getElementById(chartId);
    if (!canvas) return;
    
    // Get chart title
    let title = '';
    const chartContainer = canvas.closest('.chart-container-medium, .chart-container-small, .chart-container-large');
    if (chartContainer) {
        const titleElement = chartContainer.querySelector('h3');
        if (titleElement) {
            title = titleElement.textContent;
        }
    }
    
    // Create fullscreen overlay
    const overlay = document.createElement('div');
    overlay.className = 'chart-fullscreen-overlay';
    
    // Create fullscreen container
    const container = document.createElement('div');
    container.className = 'chart-fullscreen-container';
    
    // Create header
    const header = document.createElement('div');
    header.className = 'chart-fullscreen-header';
    
    const titleElement = document.createElement('div');
    titleElement.className = 'chart-fullscreen-title';
    titleElement.textContent = title;
    
    const closeButton = document.createElement('button');
    closeButton.className = 'chart-fullscreen-close';
    closeButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
    closeButton.addEventListener('click', () => {
        document.body.removeChild(overlay);
        isFullscreenMode = false;
    });
    
    header.appendChild(titleElement);
    header.appendChild(closeButton);
    
    // Create content
    const content = document.createElement('div');
    content.className = 'chart-fullscreen-content';
    
    // Create new canvas
    const newCanvas = document.createElement('canvas');
    newCanvas.id = `${chartId}-fullscreen`;
    content.appendChild(newCanvas);
    
    // Add elements to container
    container.appendChild(header);
    container.appendChild(content);
    overlay.appendChild(container);
    
    // Add to body
    document.body.appendChild(overlay);
    
    // Set flag
    isFullscreenMode = true;
    fullscreenChart = chartId;
    
    // Redraw chart in fullscreen
    setTimeout(() => {
        const chartData = getChartData(chartId);
        const chartType = getChartType(chartId);
        
        if (chartType === 'pie') {
            createPieChart(`${chartId}-fullscreen`, chartData, {
                interactive: true,
                showLegend: true,
                donut: chartId === 'disaster-types-chart'
            });
        } else if (chartType === 'bar') {
            createBarChart(`${chartId}-fullscreen`, chartData, {
                interactive: true,
                showLegend: true,
                showGrid: true,
                horizontal: chartId === 'resource-allocation-chart'
            });
        } else if (chartType === 'line') {
            createLineChart(`${chartId}-fullscreen`, chartData, {
                interactive: true,
                showLegend: true,
                showGrid: true,
                multiSeries: chartId === 'disaster-trend-chart'
            });
        }
    }, 100);
}

/**
 * Get chart data for a specific chart
 * @param {string} chartId - The ID of the chart canvas
 * @returns {Array} The chart data
 */
function getChartData(chartId) {
    if (!currentAnalyticsData) return [];
    
    switch (chartId) {
        case 'disaster-types-chart':
            return Object.entries(currentAnalyticsData.disasterTypes || {}).map(([label, value]) => ({
                label,
                value
            }));
        case 'region-disaster-chart':
            return Object.entries(currentAnalyticsData.regionDisasters || {}).map(([label, value]) => ({
                label,
                value
            }));
        case 'disaster-trend-chart':
            return currentAnalyticsData.disasterTrends || [];
        case 'sensor-alert-chart':
            return Object.entries(currentAnalyticsData.sensorAlerts || {}).map(([label, value]) => ({
                label,
                value
            }));
        case 'response-time-chart':
            return currentAnalyticsData.responseTime || [];
        case 'resource-allocation-chart':
            return Object.entries(currentAnalyticsData.resourceAllocation || {}).map(([label, value]) => ({
                label,
                value
            }));
        default:
            return [];
    }
}

/**
 * Get chart type for a specific chart
 * @param {string} chartId - The ID of the chart canvas
 * @returns {string} The chart type ('pie', 'bar', or 'line')
 */
function getChartType(chartId) {
    if (chartId === 'disaster-types-chart' || chartId === 'sensor-alert-chart') {
        return 'pie';
    } else if (chartId === 'region-disaster-chart' || chartId === 'resource-allocation-chart') {
        return 'bar';
    } else if (chartId === 'disaster-trend-chart' || chartId === 'response-time-chart') {
        return 'line';
    }
    return 'bar'; // Default
}

/**
 * Initialize the synapse gauge
 */
function initSynapseGauge() {
    if (!synapseGauge) return;
    
    // Set initial value
    updateSynapseGauge(synapseScore);
}

/**
 * Update the synapse gauge with a new value
 * @param {number} value - The gauge value (0-100)
 */
function updateSynapseGauge(value) {
    if (!synapseGauge) return;
    
    // Update value display
    if (synapseScoreValue) {
        synapseScoreValue.textContent = value;
    }
    
    // Clear previous gauge
    const ctx = synapseGauge.getContext('2d');
    ctx.clearRect(0, 0, synapseGauge.width, synapseGauge.height);
    
    // Set canvas dimensions
    synapseGauge.width = synapseGauge.parentElement.clientWidth;
    synapseGauge.height = synapseGauge.parentElement.clientHeight;
    
    // Calculate center and radius
    const centerX = synapseGauge.width / 2;
    const centerY = synapseGauge.height / 2;
    const radius = Math.min(centerX, centerY) - 10;
    
    // Draw background arc
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, Math.PI, 2 * Math.PI, false);
    ctx.lineWidth = 20;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.stroke();
    
    // Calculate value angle
    const valueAngle = Math.PI + (value / 100) * Math.PI;
    
    // Determine color based on value
    let color;
    if (value < 40) {
        color = '#e74c3c'; // Red for critical
    } else if (value < 70) {
        color = '#f39c12'; // Orange for warning
    } else {
        color = '#2ecc71'; // Green for good
    }
    
    // Draw value arc
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, Math.PI, valueAngle, false);
    ctx.lineWidth = 20;
    ctx.strokeStyle = color;
    ctx.stroke();
    
    // Draw ticks
    for (let i = 0; i <= 10; i++) {
        const tickAngle = Math.PI + (i / 10) * Math.PI;
        const tickLength = i % 5 === 0 ? 15 : 7;
        
        const innerX = centerX + (radius - 25) * Math.cos(tickAngle);
        const innerY = centerY + (radius - 25) * Math.sin(tickAngle);
        const outerX = centerX + (radius - 25 + tickLength) * Math.cos(tickAngle);
        const outerY = centerY + (radius - 25 + tickLength) * Math.sin(tickAngle);
        
        ctx.beginPath();
        ctx.moveTo(innerX, innerY);
        ctx.lineTo(outerX, outerY);
        ctx.lineWidth = i % 5 === 0 ? 3 : 1;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.stroke();
        
        // Draw labels for major ticks
        if (i % 5 === 0) {
            const labelX = centerX + (radius - 45) * Math.cos(tickAngle);
            const labelY = centerY + (radius - 45) * Math.sin(tickAngle);
            
            ctx.font = '12px Arial';
            ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(i * 10, labelX, labelY);
        }
    }
}

/**
 * Update the Analytics with new data
 * @param {Object} data - The analytics data
 */
function updateAnalytics(data) {
    // Update current analytics data
    currentAnalyticsData = data;
    
    // Update last updated time
    if (lastUpdatedSpan) {
        const now = new Date();
        lastUpdatedSpan.textContent = now.toLocaleTimeString();
    }
    
    // Update charts
    updateCharts(data);
    
    // Update statistics
    updateStatistics(data);
    
    // Update synapse score
    if (data.synapseScore !== undefined) {
        synapseScore = data.synapseScore;
        updateSynapseGauge(synapseScore);
    }
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
 * Refresh analytics data from the server
 */
function refreshAnalyticsData() {
    // Show loading indicator
    showLoadingIndicator(true);
    
    // Get selected date range
    const dateRange = dateRangeSelect ? dateRangeSelect.value : 'week';
    
    // Fetch data from server
    fetch(`/api/analytics?range=${dateRange}`)
        .then(response => response.json())
        .then(data => {
            updateAnalytics(data);
            showLoadingIndicator(false);
        })
        .catch(error => {
            console.error('Error fetching analytics data:', error);
            showLoadingIndicator(false);
            showToast('Failed to fetch analytics data', 'error');
        });
}

/**
 * Show or hide loading indicator
 * @param {boolean} show - Whether to show or hide the indicator
 */
function showLoadingIndicator(show) {
    const refreshButton = document.getElementById('refresh-analytics');
    if (!refreshButton) return;
    
    if (show) {
        refreshButton.disabled = true;
        refreshButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="spin"><path d="M21 12a9 9 0 1 1-6.219-8.56"></path></svg> Loading...';
    } else {
        refreshButton.disabled = false;
        refreshButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 4v6h-6"></path><path d="M1 20v-6h6"></path><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10"></path><path d="M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg> Refresh';
    }
}

/**
 * Update trend chart based on selected filter
 */
function updateTrendChart() {
    if (!currentAnalyticsData || !charts.disasterTrend) return;
    
    const selectedType = trendChartTypeSelect ? trendChartTypeSelect.value : 'all';
    let trendData;
    
    if (selectedType === 'all') {
        trendData = currentAnalyticsData.disasterTrends || [];
    } else {
        // Filter trend data for selected disaster type
        trendData = (currentAnalyticsData.disasterTrendsByType || {})[selectedType] || [];
    }
    
    // Update chart
    createLineChart('disaster-trend-chart', trendData, {
        interactive: true,
        showLegend: true,
        showGrid: true,
        multiSeries: selectedType === 'all'
    });
}

/**
 * Show a toast notification
 * @param {string} message - The notification message
 * @param {string} type - The notification type ('success', 'error', 'warning', 'info')
 */
function showToast(message, type = 'info') {
    // Check if toast container exists, create if not
    let toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container';
        document.body.appendChild(toastContainer);
    }
    
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast-notification ${type}`;
    
    // Add icon based on type
    let icon = '';
    switch (type) {
        case 'success':
            icon = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>';
            break;
        case 'error':
            icon = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>';
            break;
        case 'warning':
            icon = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>';
            break;
        default:
            icon = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>';
    }
    
    // Set toast content
    toast.innerHTML = `
        <div class="toast-icon ${type}">${icon}</div>
        <div class="toast-content">
            <div class="toast-message">${message}</div>
        </div>
        <div class="toast-close">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
        </div>
        <div class="toast-progress"></div>
    `;
    
    // Add close event
    toast.querySelector('.toast-close').addEventListener('click', () => {
        toast.remove();
    });
    
    // Add to container
    toastContainer.appendChild(toast);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (toast.parentNode) {
            toast.remove();
        }
    }, 5000);
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
            createPieChart('disaster-types-chart', [], {
                interactive: true,
                showLegend: true,
                donut: true
            });
            
            createBarChart('region-disaster-chart', [], {
                interactive: true,
                showLegend: true,
                showGrid: true
            });
        }
    }
    
    // Refresh synapse gauge
    if (synapseGauge) {
        updateSynapseGauge(synapseScore);
    }
}

// Initialize the Analytics component
initAnalytics();
