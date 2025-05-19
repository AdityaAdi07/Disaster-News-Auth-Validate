/**
 * API Client
 * Handles REST API calls to the backend server
 */

// API configuration
const API_BASE_URL = 'http://localhost:3000/api';

/**
 * Fetch all dashboard data
 * @returns {Promise<Object>} The dashboard data
 */
async function fetchDashboardData() {
    try {
        const response = await fetch(`${API_BASE_URL}/dashboard`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        throw error;
    }
}

/**
 * Verify or unverify an alert
 * @param {string} alertId - The ID of the alert
 * @param {boolean} verified - Whether the alert is verified
 * @returns {Promise<Object>} The updated alert
 */
async function verifyAlert(alertId, verified) {
    try {
        const response = await fetch(`${API_BASE_URL}/alerts/${alertId}/verify`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ verified })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error(`Error ${verified ? 'verifying' : 'unverifying'} alert:`, error);
        throw error;
    }
}

/**
 * Mark an alert as resolved
 * @param {string} alertId - The ID of the alert
 * @returns {Promise<Object>} The updated alert
 */
async function resolveAlert(alertId) {
    try {
        const response = await fetch(`${API_BASE_URL}/alerts/${alertId}/resolve`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error resolving alert:', error);
        throw error;
    }
}

/**
 * Delete an alert
 * @param {string} alertId - The ID of the alert
 * @returns {Promise<void>}
 */
async function deleteAlert(alertId) {
    try {
        const response = await fetch(`${API_BASE_URL}/alerts/${alertId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error deleting alert:', error);
        throw error;
    }
}

/**
 * Create a new alert
 * @param {Object} alertData - The alert data
 * @returns {Promise<Object>} The created alert
 */
async function createAlert(alertData) {
    try {
        const response = await fetch(`${API_BASE_URL}/alerts`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(alertData)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error creating alert:', error);
        throw error;
    }
}

/**
 * Filter social posts by disaster type
 * @param {string} disasterType - The disaster type to filter by
 * @returns {Promise<Array>} The filtered social posts
 */
async function filterSocialPosts(disasterType) {
    try {
        const url = disasterType === 'all' 
            ? `${API_BASE_URL}/social-posts` 
            : `${API_BASE_URL}/social-posts?disaster_type=${disasterType}`;
            
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error filtering social posts:', error);
        throw error;
    }
}

/**
 * Send SMS alert (mock function)
 * @param {string} alertId - The ID of the alert
 * @returns {Promise<Object>} The result
 */
async function sendSMSAlert(alertId) {
    try {
        const response = await fetch(`${API_BASE_URL}/alerts/${alertId}/sms`, {
            method: 'POST'
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error sending SMS alert:', error);
        throw error;
    }
}

/**
 * Get IoT sensor data
 * @returns {Promise<Array>} The sensor data
 */
async function getIoTSensorData() {
    try {
        const response = await fetch(`${API_BASE_URL}/iot-sensors`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error fetching IoT sensor data:', error);
        throw error;
    }
}

/**
 * Get dashboard summary data
 * @returns {Promise<Object>} The summary data
 */
async function getDashboardSummary() {
    try {
        const response = await fetch(`${API_BASE_URL}/summary`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error fetching dashboard summary:', error);
        throw error;
    }
}

/**
 * Vote on a social media post
 * @param {string} postId - The ID of the post
 * @param {string} voteType - The type of vote ('up' or 'down')
 * @returns {Promise<Object>} The updated vote counts
 */
async function voteSocialPost(postId, voteType) {
    try {
        const response = await fetch(`${API_BASE_URL}/social-posts/${postId}/vote`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ vote: voteType })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error voting on social post:', error);
        throw error;
    }
}
