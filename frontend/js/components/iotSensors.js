/**
 * IoT Sensors Component
 * Displays real-time IoT sensor data
 */

// DOM Elements
const sensorDataContainer = document.getElementById('sensor-data-container');

// Component state
let currentSensorData = [];

/**
 * Initialize the IoT Sensors component
 */
function initIoTSensors() {
    console.log('Initializing IoT Sensors component...');
}

/**
 * Update the IoT Sensors with new data
 * @param {Array} sensorData - The sensor data
 */
function updateIoTSensors(sensorData) {
    // Update current sensor data
    currentSensorData = sensorData;
    
    // Render sensor data
    renderSensorData(sensorData);
    
    // Check thresholds for alerts
    if (typeof checkThresholds === 'function') {
        checkThresholds(sensorData);
    }
}

/**
 * Render sensor data
 * @param {Array} sensorData - The sensor data to render
 */
function renderSensorData(sensorData) {
    // Clear container
    clearElement(sensorDataContainer);
    
    // Check if sensor data exists
    if (!sensorData || sensorData.length === 0) {
        const emptyMessage = createElement('div', {
            className: 'empty-message'
        }, 'No sensor data available.');
        
        sensorDataContainer.appendChild(emptyMessage);
        return;
    }
    
    // Group sensors by type
    const sensorTypes = {
        temperature: [],
        humidity: [],
        gas: [],
        seismic: []
    };
    
    // Group sensors
    sensorData.forEach(sensor => {
        if (sensor.type in sensorTypes) {
            sensorTypes[sensor.type].push(sensor);
        }
    });
    
    // Create sensor type sections
    Object.entries(sensorTypes).forEach(([type, sensors]) => {
        if (sensors.length > 0) {
            // Create section for this sensor type
            const sectionElement = createElement('div', {
                className: 'sensor-section'
            });
            
            // Create section title
            const titleElement = createElement('h3', {
                className: 'sensor-section-title'
            }, `${type.charAt(0).toUpperCase() + type.slice(1)} Sensors`);
            
            sectionElement.appendChild(titleElement);
            
            // Create sensor cards container
            const cardsContainer = createElement('div', {
                className: 'sensor-cards-container'
            });
            
            // Create sensor cards
            sensors.forEach(sensor => {
                const sensorCard = createSensorCard(sensor);
                cardsContainer.appendChild(sensorCard);
            });
            
            sectionElement.appendChild(cardsContainer);
            sensorDataContainer.appendChild(sectionElement);
        }
    });
}

/**
 * Create a sensor card
 * @param {Object} sensor - The sensor data
 * @returns {HTMLElement} The sensor card element
 */
function createSensorCard(sensor) {
    // Get sensor status
    const status = getSensorStatus(sensor.type, sensor.value);
    
    // Create sensor card container
    const cardElement = createElement('div', {
        className: 'sensor-card',
        'data-id': sensor._id
    });
    
    // Create sensor icon based on type
    let iconSvg = '';
    switch (sensor.type) {
        case 'temperature':
            iconSvg = `
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"></path>
                </svg>
            `;
            break;
        case 'humidity':
            iconSvg = `
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path>
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
        className: 'sensor-icon'
    });
    iconElement.innerHTML = iconSvg;
    
    // Create sensor value
    const valueElement = createElement('div', {
        className: `sensor-value ${status.class}`
    });
    
    // Format value based on sensor type
    let formattedValue = '';
    switch (sensor.type) {
        case 'temperature':
            formattedValue = `${sensor.value}°C`;
            break;
        case 'humidity':
            formattedValue = `${sensor.value}%`;
            break;
        case 'gas':
            formattedValue = `${sensor.value} ppm`;
            break;
        case 'seismic':
            formattedValue = sensor.value.toFixed(1);
            break;
        default:
            formattedValue = sensor.value.toString();
    }
    
    valueElement.textContent = formattedValue;
    
    // Create sensor label
    const labelElement = createElement('div', {
        className: 'sensor-label'
    }, sensor.name || `${sensor.type.charAt(0).toUpperCase() + sensor.type.slice(1)} Sensor`);
    
    // Create sensor status
    const statusElement = createElement('div', {
        className: `sensor-status ${status.class}`
    }, status.label);
    
    // Create sensor location
    const locationElement = createElement('div', {
        className: 'sensor-location'
    }, sensor.location);
    
    // Create anomaly indicator if anomaly detected
    if (sensor.anomaly_detected) {
        const anomalyElement = createElement('div', {
            className: 'sensor-anomaly'
        }, '⚠️ Anomaly Detected');
        
        cardElement.appendChild(anomalyElement);
    }
    
    // Add all elements to card
    cardElement.appendChild(iconElement);
    cardElement.appendChild(valueElement);
    cardElement.appendChild(labelElement);
    cardElement.appendChild(statusElement);
    cardElement.appendChild(locationElement);
    
    // Add last updated timestamp
    if (sensor.timestamp) {
        const timestampElement = createElement('div', {
            className: 'sensor-timestamp'
        }, `Updated: ${formatDate(sensor.timestamp)}`);
        
        cardElement.appendChild(timestampElement);
    }
    
    return cardElement;
}
