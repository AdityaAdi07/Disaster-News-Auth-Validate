/**
 * WebSocket Handler
 * Manages WebSocket connection and real-time data updates
 */

// WebSocket connection
let socket = null;
const WS_URL = 'ws://localhost:3000/ws';

// Reconnection settings
const RECONNECT_INTERVAL = 5000; // 5 seconds
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 10;

/**
 * Connect to WebSocket server
 */
function connectWebSocket() {
    try {
        socket = new WebSocket(WS_URL);
        
        // Connection opened
        socket.addEventListener('open', handleSocketOpen);
        
        // Listen for messages
        socket.addEventListener('message', handleSocketMessage);
        
        // Connection closed
        socket.addEventListener('close', handleSocketClose);
        
        // Connection error
        socket.addEventListener('error', handleSocketError);
        
    } catch (error) {
        console.error('WebSocket connection error:', error);
        scheduleReconnect();
    }
}

/**
 * Handle WebSocket open event
 */
function handleSocketOpen() {
    console.log('WebSocket connection established');
    appState.websocketConnected = true;
    reconnectAttempts = 0;
    
    // Subscribe to channels
    subscribeToChannels();
}

/**
 * Subscribe to WebSocket channels
 */
function subscribeToChannels() {
    const subscriptions = [
        'social_update',
        'sensor_update',
        'alert_update',
        'analytics_update'
    ];
    
    // Send subscription message
    socket.send(JSON.stringify({
        type: 'subscribe',
        channels: subscriptions
    }));
}

/**
 * Handle WebSocket message event
 * @param {MessageEvent} event - The message event
 */
function handleSocketMessage(event) {
    try {
        const data = JSON.parse(event.data);
        
        // Process message based on type
        switch (data.type) {
            case 'social_update':
                if (typeof updateLiveFeed === 'function') {
                    updateLiveFeed(data.data);
                }
                break;
                
            case 'sensor_update':
                if (typeof updateIoTSensors === 'function') {
                    updateIoTSensors(data.data);
                }
                break;
                
            case 'alert_update':
                if (typeof updateVerifiedAlerts === 'function') {
                    updateVerifiedAlerts(data.data.verifiedAlerts);
                }
                if (typeof updateMap === 'function') {
                    updateMap(data.data.disasterAlerts);
                }
                if (typeof updateAdminPanel === 'function') {
                    updateAdminPanel(data.data.disasterAlerts);
                }
                
                // Update alert count
                const alertData = {
                    disasterAlerts: data.data.disasterAlerts || []
                };
                updateAlertCount(alertData);
                break;
                
            case 'analytics_update':
                if (typeof updateAnalytics === 'function') {
                    updateAnalytics(data.data);
                }
                break;
                
            default:
                console.warn('Unknown message type:', data.type);
        }
        
        // Update last update timestamp
        appState.lastUpdate = new Date();
        
    } catch (error) {
        console.error('Error processing WebSocket message:', error);
    }
}

/**
 * Handle WebSocket close event
 * @param {CloseEvent} event - The close event
 */
function handleSocketClose(event) {
    console.log(`WebSocket connection closed: ${event.code} ${event.reason}`);
    appState.websocketConnected = false;
    
    // Attempt to reconnect
    scheduleReconnect();
}

/**
 * Handle WebSocket error event
 * @param {Event} event - The error event
 */
function handleSocketError(event) {
    console.error('WebSocket error:', event);
}

/**
 * Schedule a reconnection attempt
 */
function scheduleReconnect() {
    if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
        reconnectAttempts++;
        
        console.log(`Attempting to reconnect (${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS}) in ${RECONNECT_INTERVAL / 1000} seconds...`);
        
        setTimeout(() => {
            connectWebSocket();
        }, RECONNECT_INTERVAL);
    } else {
        console.error('Maximum reconnection attempts reached. Please refresh the page.');
        
        // Show reconnection error to user
        showReconnectionError();
    }
}

/**
 * Show reconnection error message to user
 */
function showReconnectionError() {
    // Create error message element
    const errorElement = document.createElement('div');
    errorElement.className = 'connection-error';
    errorElement.innerHTML = `
        <div class="error-icon">⚠️</div>
        <div class="error-message">
            <h3>Connection Lost</h3>
            <p>Unable to connect to the server. Please check your connection and refresh the page.</p>
            <button onclick="window.location.reload()">Refresh</button>
        </div>
    `;
    
    // Add to document
    document.body.appendChild(errorElement);
}

/**
 * Send a message to the WebSocket server
 * @param {string} type - The message type
 * @param {Object} data - The message data
 */
function sendWebSocketMessage(type, data) {
    if (socket && socket.readyState === WebSocket.OPEN) {
        const message = {
            type,
            data
        };
        
        socket.send(JSON.stringify(message));
    } else {
        console.error('Cannot send message: WebSocket is not connected');
    }
}
