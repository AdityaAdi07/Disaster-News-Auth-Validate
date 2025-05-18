/**
 * WebSocket Handler
 * Manages WebSocket connections and real-time data updates
 */

// Import models
const SocialPost = require('./models/socialPosts');
const IoTSensorData = require('./models/iotSensorData');
const DisasterAlert = require('./models/disasterAlerts');
const RegionsStats = require('./models/regionsStats');

// Connected clients
const clients = new Set();

// Update intervals
const UPDATE_INTERVAL = 10000; // 10 seconds

/**
 * Set up WebSocket server
 * @param {WebSocket.Server} wss - The WebSocket server
 */
function setupWebSocket(wss) {
    console.log('Setting up WebSocket server');
    
    // Handle connection
    wss.on('connection', (ws) => {
        console.log('Client connected');
        
        // Add client to set
        clients.add(ws);
        
        // Send initial data
        sendInitialData(ws);
        
        // Handle messages
        ws.on('message', (message) => {
            handleMessage(ws, message);
        });
        
        // Handle close
        ws.on('close', () => {
            console.log('Client disconnected');
            clients.delete(ws);
        });
        
        // Handle errors
        ws.on('error', (error) => {
            console.error('WebSocket error:', error);
        });
    });
    
    // Start update intervals
    startUpdateIntervals();
}

/**
 * Send initial data to client
 * @param {WebSocket} ws - The WebSocket client
 */
async function sendInitialData(ws) {
    try {
        // Get data from database
        const [socialPosts, iotSensorData, disasterAlerts, regionsStats] = await Promise.all([
            SocialPost.find().sort({ timestamp: -1 }).limit(20),
            IoTSensorData.find().sort({ timestamp: -1 }),
            DisasterAlert.find().sort({ timestamp: -1 }),
            RegionsStats.findOne().sort({ timestamp: -1 })
        ]);
        
        // Send social posts
        ws.send(JSON.stringify({
            type: 'social_update',
            data: socialPosts
        }));
        
        // Send IoT sensor data
        ws.send(JSON.stringify({
            type: 'sensor_update',
            data: iotSensorData
        }));
        
        // Send disaster alerts
        const verifiedAlerts = [...disasterAlerts, ...socialPosts.filter(post => post.verified)];
        ws.send(JSON.stringify({
            type: 'alert_update',
            data: {
                disasterAlerts,
                verifiedAlerts
            }
        }));
        
        // Send regions stats
        ws.send(JSON.stringify({
            type: 'analytics_update',
            data: regionsStats
        }));
    } catch (error) {
        console.error('Error sending initial data:', error);
    }
}

/**
 * Handle incoming WebSocket message
 * @param {WebSocket} ws - The WebSocket client
 * @param {string} message - The message
 */
function handleMessage(ws, message) {
    try {
        const data = JSON.parse(message);
        
        // Handle message based on type
        switch (data.type) {
            case 'subscribe':
                // Handle subscription
                console.log('Client subscribed to channels:', data.channels);
                break;
                
            default:
                console.warn('Unknown message type:', data.type);
        }
    } catch (error) {
        console.error('Error handling message:', error);
    }
}

/**
 * Start update intervals for real-time data
 */
function startUpdateIntervals() {
    // Update social posts every 10 seconds
    setInterval(async () => {
        if (clients.size === 0) return;
        
        try {
            const socialPosts = await SocialPost.find().sort({ timestamp: -1 }).limit(20);
            
            broadcastToAll({
                type: 'social_update',
                data: socialPosts
            });
        } catch (error) {
            console.error('Error updating social posts:', error);
        }
    }, UPDATE_INTERVAL);
    
    // Update IoT sensor data every 5 seconds
    setInterval(async () => {
        if (clients.size === 0) return;
        
        try {
            const iotSensorData = await IoTSensorData.find().sort({ timestamp: -1 });
            
            broadcastToAll({
                type: 'sensor_update',
                data: iotSensorData
            });
        } catch (error) {
            console.error('Error updating IoT sensor data:', error);
        }
    }, UPDATE_INTERVAL / 2);
    
    // Update disaster alerts every 10 seconds
    setInterval(async () => {
        if (clients.size === 0) return;
        
        try {
            const [disasterAlerts, socialPosts] = await Promise.all([
                DisasterAlert.find().sort({ timestamp: -1 }),
                SocialPost.find({ verified: true }).sort({ timestamp: -1 })
            ]);
            
            const verifiedAlerts = [...disasterAlerts, ...socialPosts];
            
            broadcastToAll({
                type: 'alert_update',
                data: {
                    disasterAlerts,
                    verifiedAlerts
                }
            });
        } catch (error) {
            console.error('Error updating disaster alerts:', error);
        }
    }, UPDATE_INTERVAL);
    
    // Update regions stats every 10 seconds
    setInterval(async () => {
        if (clients.size === 0) return;
        
        try {
            const regionsStats = await RegionsStats.findOne().sort({ timestamp: -1 });
            
            broadcastToAll({
                type: 'analytics_update',
                data: regionsStats
            });
        } catch (error) {
            console.error('Error updating regions stats:', error);
        }
    }, UPDATE_INTERVAL);
}

/**
 * Broadcast message to all connected clients
 * @param {Object} message - The message to broadcast
 */
function broadcastToAll(message) {
    const messageString = JSON.stringify(message);
    
    clients.forEach(client => {
        if (client.readyState === 1) { // OPEN
            client.send(messageString);
        }
    });
}

/**
 * Broadcast message to specific client
 * @param {WebSocket} ws - The WebSocket client
 * @param {Object} message - The message to send
 */
function sendToClient(ws, message) {
    if (ws.readyState === 1) { // OPEN
        ws.send(JSON.stringify(message));
    }
}

// Export the setup function
module.exports = setupWebSocket;
