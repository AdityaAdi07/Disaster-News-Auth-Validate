/**
 * AI Summary Panel Component
 * Displays a compact summary of the most important metrics
 */

// DOM Elements
let summaryPanelContainer;

// Component state
let summaryData = {
    topDisasterTypes: [],
    mostActiveRegion: '',
    unverifiedPosts: 0,
    iotAnomalies: 0
};

// Polling interval for summary data (10 seconds)
const SUMMARY_POLLING_INTERVAL = 10000;
let summaryPollingTimer = null;

/**
 * Initialize the AI Summary Panel component
 */
function initAISummary() {
    console.log('Initializing AI Summary Panel component...');
    
    // Create summary panel container if it doesn't exist
    createSummaryPanel();
    
    // Start polling for summary data
    startSummaryPolling();
}

/**
 * Create the summary panel in the DOM
 */
function createSummaryPanel() {
    // Find the content element to insert the panel
    const contentElement = document.querySelector('.content');
    
    if (!contentElement) {
        console.error('Could not find content element to insert AI Summary Panel');
        return;
    }
    
    // Create the panel container
    summaryPanelContainer = createElement('div', {
        id: 'ai-summary-panel',
        className: 'ai-summary-panel'
    });
    
    // Create panel title
    const titleElement = createElement('h3', {
        className: 'ai-summary-title'
    }, 'Top Disasters & System Stats');
    
    // Create summary cards container
    const cardsContainer = createElement('div', {
        className: 'ai-summary-cards'
    });
    
    // Create initial empty cards
    cardsContainer.appendChild(createSummaryCard('disaster-types', '🔥', 'Loading...', 'Top Disaster Types'));
    cardsContainer.appendChild(createSummaryCard('active-region', '🌎', 'Loading...', 'Most Active Region'));
    cardsContainer.appendChild(createSummaryCard('unverified-posts', '❓', '0', 'Unverified Reports'));
    cardsContainer.appendChild(createSummaryCard('iot-anomalies', '⚠️', '0', 'IoT Anomalies'));
    
    // Add elements to panel
    summaryPanelContainer.appendChild(titleElement);
    summaryPanelContainer.appendChild(cardsContainer);
    
    // Insert panel at the top of the content area, before the first panel
    const firstPanel = contentElement.querySelector('.panel');
    if (firstPanel) {
        contentElement.insertBefore(summaryPanelContainer, firstPanel);
    } else {
        contentElement.appendChild(summaryPanelContainer);
    }
}

/**
 * Create a summary card element
 * @param {string} id - The card ID
 * @param {string} icon - The card icon (emoji)
 * @param {string} value - The card value
 * @param {string} label - The card label
 * @returns {HTMLElement} The card element
 */
function createSummaryCard(id, icon, value, label) {
    const card = createElement('div', {
        className: 'ai-summary-card',
        id: `summary-card-${id}`
    });
    
    const iconElement = createElement('div', {
        className: 'ai-summary-icon'
    }, icon);
    
    const valueElement = createElement('div', {
        className: 'ai-summary-value',
        id: `summary-value-${id}`
    }, value);
    
    const labelElement = createElement('div', {
        className: 'ai-summary-label'
    }, label);
    
    card.appendChild(iconElement);
    card.appendChild(valueElement);
    card.appendChild(labelElement);
    
    return card;
}

/**
 * Start polling for summary data
 */
function startSummaryPolling() {
    // Clear any existing timer
    stopSummaryPolling();
    
    // Immediately fetch data
    fetchSummaryData();
    
    // Set up interval for regular polling
    summaryPollingTimer = setInterval(fetchSummaryData, SUMMARY_POLLING_INTERVAL);
    
    console.log(`Started AI summary polling every ${SUMMARY_POLLING_INTERVAL / 1000} seconds`);
}

/**
 * Stop polling for summary data
 */
function stopSummaryPolling() {
    if (summaryPollingTimer) {
        clearInterval(summaryPollingTimer);
        summaryPollingTimer = null;
    }
}

/**
 * Fetch summary data via REST API
 */
async function fetchSummaryData() {
    try {
        const response = await fetch(`${API_BASE_URL}/summary`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Update summary data
        updateSummaryData(data);
        
    } catch (error) {
        console.error('Error fetching summary data:', error);
    }
}

/**
 * Update the summary data and UI
 * @param {Object} data - The summary data
 */
function updateSummaryData(data) {
    // Update state
    summaryData = {
        topDisasterTypes: data.top_disaster_types || [],
        mostActiveRegion: data.most_active_region || 'None',
        unverifiedPosts: data.unverified_posts || 0,
        iotAnomalies: data.iot_anomalies || 0
    };
    
    // Update UI
    updateSummaryUI();
}

/**
 * Update the summary UI with current data
 */
function updateSummaryUI() {
    // Update top disaster types
    const disasterTypesElement = document.getElementById('summary-value-disaster-types');
    if (disasterTypesElement) {
        if (summaryData.topDisasterTypes.length > 0) {
            const topThree = summaryData.topDisasterTypes.slice(0, 3);
            disasterTypesElement.textContent = topThree.map(d => d.type).join(', ');
        } else {
            disasterTypesElement.textContent = 'None';
        }
    }
    
    // Update most active region
    const activeRegionElement = document.getElementById('summary-value-active-region');
    if (activeRegionElement) {
        activeRegionElement.textContent = summaryData.mostActiveRegion;
    }
    
    // Update unverified posts
    const unverifiedPostsElement = document.getElementById('summary-value-unverified-posts');
    if (unverifiedPostsElement) {
        unverifiedPostsElement.textContent = summaryData.unverifiedPosts;
        
        // Update card color based on severity
        const card = document.getElementById('summary-card-unverified-posts');
        if (card) {
            card.className = 'ai-summary-card';
            if (summaryData.unverifiedPosts > 20) {
                card.classList.add('severity-high');
            } else if (summaryData.unverifiedPosts > 10) {
                card.classList.add('severity-medium');
            } else {
                card.classList.add('severity-low');
            }
        }
    }
    
    // Update IoT anomalies
    const iotAnomaliesElement = document.getElementById('summary-value-iot-anomalies');
    if (iotAnomaliesElement) {
        iotAnomaliesElement.textContent = summaryData.iotAnomalies;
        
        // Update card color based on severity
        const card = document.getElementById('summary-card-iot-anomalies');
        if (card) {
            card.className = 'ai-summary-card';
            if (summaryData.iotAnomalies > 5) {
                card.classList.add('severity-high');
            } else if (summaryData.iotAnomalies > 2) {
                card.classList.add('severity-medium');
            } else {
                card.classList.add('severity-low');
            }
        }
    }
}

// Export functions
window.initAISummary = initAISummary;
window.updateSummaryData = updateSummaryData;
