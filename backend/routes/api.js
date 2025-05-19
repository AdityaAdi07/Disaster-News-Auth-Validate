/**
 * API Routes
 * Handles all REST API endpoints for the dashboard
 */

const express = require('express');
const router = express.Router();

// Import models
const SocialPost = require('../models/socialPosts');
const IoTSensorData = require('../models/iotSensorData');
const DisasterAlert = require('../models/disasterAlerts');
const RegionsStats = require('../models/regionsStats');
const PostVote = require('../models/postVotes');

/**
 * GET /api/dashboard
 * Get all dashboard data
 */
router.get('/dashboard', async (req, res) => {
    try {
        // Get data from database
        const [socialPosts, iotSensorData, disasterAlerts, regionsStats] = await Promise.all([
            SocialPost.find().sort({ timestamp: -1 }).limit(20),
            IoTSensorData.find().sort({ timestamp: -1 }),
            DisasterAlert.find().sort({ timestamp: -1 }),
            RegionsStats.findOne().sort({ timestamp: -1 })
        ]);
        
        // Get verified alerts (from both disaster alerts and social posts)
        const verifiedAlerts = [
            ...disasterAlerts.filter(alert => alert.verified),
            ...socialPosts.filter(post => post.verified)
        ];
        
        // Return all data
        res.json({
            socialPosts,
            iotSensorData,
            disasterAlerts,
            verifiedAlerts,
            regionsStats
        });
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard data' });
    }
});

/**
 * GET /api/social-posts
 * Get social posts with optional filtering
 */
router.get('/social-posts', async (req, res) => {
    try {
        const { disaster_type } = req.query;
        
        // Build query
        const query = {};
        if (disaster_type && disaster_type !== 'all') {
            query.disaster_type = disaster_type;
        }
        
        // Get social posts
        const socialPosts = await SocialPost.find(query)
            .sort({ timestamp: -1 })
            .limit(20);
        
        res.json(socialPosts);
    } catch (error) {
        console.error('Error fetching social posts:', error);
        res.status(500).json({ error: 'Failed to fetch social posts' });
    }
});

/**
 * GET /api/iot-sensors
 * Get IoT sensor data
 */
router.get('/iot-sensors', async (req, res) => {
    try {
        const { type } = req.query;
        
        // Build query
        const query = {};
        if (type) {
            query.type = type;
        }
        
        // Get IoT sensor data
        const iotSensorData = await IoTSensorData.find(query)
            .sort({ timestamp: -1 });
        
        res.json(iotSensorData);
    } catch (error) {
        console.error('Error fetching IoT sensor data:', error);
        res.status(500).json({ error: 'Failed to fetch IoT sensor data' });
    }
});

/**
 * GET /api/alerts
 * Get disaster alerts
 */
router.get('/alerts', async (req, res) => {
    try {
        const { status, verified } = req.query;
        
        // Build query
        const query = {};
        if (status) {
            query.status = status;
        }
        if (verified !== undefined) {
            query.verified = verified === 'true';
        }
        
        // Get disaster alerts
        const disasterAlerts = await DisasterAlert.find(query)
            .sort({ timestamp: -1 });
        
        res.json(disasterAlerts);
    } catch (error) {
        console.error('Error fetching disaster alerts:', error);
        res.status(500).json({ error: 'Failed to fetch disaster alerts' });
    }
});

/**
 * GET /api/verified-alerts
 * Get verified alerts from both disaster alerts and social posts
 */
router.get('/verified-alerts', async (req, res) => {
    try {
        // Get verified alerts from disaster alerts
        const verifiedDisasterAlerts = await DisasterAlert.find({ verified: true })
            .sort({ timestamp: -1 });
        
        // Get verified alerts from social posts
        const verifiedSocialPosts = await SocialPost.find({ verified: true })
            .sort({ timestamp: -1 });
        
        // Combine and sort by timestamp
        const verifiedAlerts = [...verifiedDisasterAlerts, ...verifiedSocialPosts]
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        res.json(verifiedAlerts);
    } catch (error) {
        console.error('Error fetching verified alerts:', error);
        res.status(500).json({ error: 'Failed to fetch verified alerts' });
    }
});

/**
 * GET /api/analytics
 * Get analytics data
 */
router.get('/analytics', async (req, res) => {
    try {
        // Get latest regions stats
        const regionsStats = await RegionsStats.findOne()
            .sort({ timestamp: -1 });
        
        res.json(regionsStats);
    } catch (error) {
        console.error('Error fetching analytics data:', error);
        res.status(500).json({ error: 'Failed to fetch analytics data' });
    }
});

/**
 * POST /api/alerts
 * Create a new disaster alert
 */
router.post('/alerts', async (req, res) => {
    try {
        // Create new alert
        const newAlert = new DisasterAlert(req.body);
        
        // Save alert to database
        await newAlert.save();
        
        res.status(201).json(newAlert);
    } catch (error) {
        console.error('Error creating disaster alert:', error);
        res.status(500).json({ error: 'Failed to create disaster alert' });
    }
});

/**
 * PUT /api/alerts/:id/verify
 * Verify or unverify a disaster alert
 */
router.put('/alerts/:id/verify', async (req, res) => {
    try {
        const { id } = req.params;
        const { verified } = req.body;
        
        // Update alert
        const updatedAlert = await DisasterAlert.findByIdAndUpdate(
            id,
            { verified },
            { new: true }
        );
        
        if (!updatedAlert) {
            return res.status(404).json({ error: 'Disaster alert not found' });
        }
        
        res.json(updatedAlert);
    } catch (error) {
        console.error('Error verifying disaster alert:', error);
        res.status(500).json({ error: 'Failed to verify disaster alert' });
    }
});

/**
 * PUT /api/alerts/:id/resolve
 * Mark a disaster alert as resolved
 */
router.put('/alerts/:id/resolve', async (req, res) => {
    try {
        const { id } = req.params;
        
        // Update alert
        const updatedAlert = await DisasterAlert.findByIdAndUpdate(
            id,
            { 
                status: 'resolved',
                resolved_at: new Date(),
                resolved_by: req.body.resolved_by || 'admin'
            },
            { new: true }
        );
        
        if (!updatedAlert) {
            return res.status(404).json({ error: 'Disaster alert not found' });
        }
        
        res.json(updatedAlert);
    } catch (error) {
        console.error('Error resolving disaster alert:', error);
        res.status(500).json({ error: 'Failed to resolve disaster alert' });
    }
});

/**
 * DELETE /api/alerts/:id
 * Delete a disaster alert
 */
router.delete('/alerts/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        // Delete alert
        const deletedAlert = await DisasterAlert.findByIdAndDelete(id);
        
        if (!deletedAlert) {
            return res.status(404).json({ error: 'Disaster alert not found' });
        }
        
        res.json({ message: 'Disaster alert deleted successfully' });
    } catch (error) {
        console.error('Error deleting disaster alert:', error);
        res.status(500).json({ error: 'Failed to delete disaster alert' });
    }
});

/**
 * POST /api/alerts/:id/sms
 * Send SMS alert (mock endpoint)
 */
router.post('/alerts/:id/sms', async (req, res) => {
    try {
        const { id } = req.params;
        
        // Get alert
        const alert = await DisasterAlert.findById(id);
        
        if (!alert) {
            return res.status(404).json({ error: 'Disaster alert not found' });
        }
        
        // Mock SMS sending
        console.log(`[MOCK] Sending SMS alert for ${alert.disaster_type} in ${alert.location}`);
        
        // In a real application, you would integrate with an SMS service here
        
        res.json({ message: 'SMS alert sent successfully' });
    } catch (error) {
        console.error('Error sending SMS alert:', error);
        res.status(500).json({ error: 'Failed to send SMS alert' });
    }
});

/**
 * POST /api/social-posts/:id/vote
 * Vote on a social media post (upvote or downvote)
 */
router.post('/social-posts/:id/vote', async (req, res) => {
    try {
        const { id } = req.params;
        const { vote } = req.body;
        
        // Validate vote type
        if (!['up', 'down'].includes(vote)) {
            return res.status(400).json({ error: 'Invalid vote type. Must be "up" or "down"' });
        }
        
        // Get post
        const post = await SocialPost.findById(id);
        
        if (!post) {
            return res.status(404).json({ error: 'Social post not found' });
        }
        
        // Generate a session ID (in a real app, this would come from the user's session)
        // For this demo, we'll use the IP address or a random ID
        const session_id = req.headers['x-forwarded-for'] || 
                          req.connection.remoteAddress || 
                          Math.random().toString(36).substring(2, 15);
        
        // Check if user has already voted on this post
        const existingVote = await PostVote.findOne({
            post_id: id,
            session_id
        });
        
        if (existingVote) {
            // If vote type is the same, return current counts
            if (existingVote.vote === vote) {
                return res.json({
                    upvotes: post.upvotes,
                    downvotes: post.downvotes
                });
            }
            
            // Update existing vote
            existingVote.vote = vote;
            await existingVote.save();
            
            // Update post vote counts
            if (vote === 'up') {
                post.upvotes += 1;
                post.downvotes = Math.max(0, post.downvotes - 1);
            } else {
                post.downvotes += 1;
                post.upvotes = Math.max(0, post.upvotes - 1);
            }
        } else {
            // Create new vote
            const newVote = new PostVote({
                post_id: id,
                vote,
                session_id
            });
            
            await newVote.save();
            
            // Update post vote counts
            if (vote === 'up') {
                post.upvotes += 1;
            } else {
                post.downvotes += 1;
            }
        }
        
        // Save post
        await post.save();
        
        // Return updated vote counts
        res.json({
            upvotes: post.upvotes,
            downvotes: post.downvotes
        });
    } catch (error) {
        console.error('Error voting on social post:', error);
        res.status(500).json({ error: 'Failed to vote on social post' });
    }
});

/**
 * GET /api/summary
 * Get dashboard summary data
 */
router.get('/summary', async (req, res) => {
    try {
        // Get data for summary
        const [socialPosts, iotSensorData, disasterAlerts] = await Promise.all([
            SocialPost.find(),
            IoTSensorData.find(),
            DisasterAlert.find({ status: 'active' })
        ]);
        
        // Calculate top disaster types in the last hour
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        const recentAlerts = disasterAlerts.filter(alert => 
            new Date(alert.timestamp) >= oneHourAgo
        );
        
        // Count disaster types
        const disasterTypeCounts = {};
        recentAlerts.forEach(alert => {
            const type = alert.disaster_type;
            disasterTypeCounts[type] = (disasterTypeCounts[type] || 0) + 1;
        });
        
        // Convert to array and sort
        const topDisasterTypes = Object.entries(disasterTypeCounts)
            .map(([type, count]) => ({ type, count }))
            .sort((a, b) => b.count - a.count);
        
        // Find region with most active alerts
        const regionCounts = {};
        disasterAlerts.forEach(alert => {
            const region = alert.location.split(',').pop().trim();
            regionCounts[region] = (regionCounts[region] || 0) + 1;
        });
        
        let mostActiveRegion = 'None';
        let maxCount = 0;
        
        Object.entries(regionCounts).forEach(([region, count]) => {
            if (count > maxCount) {
                mostActiveRegion = region;
                maxCount = count;
            }
        });
        
        // Count unverified social posts
        const unverifiedPosts = socialPosts.filter(post => !post.verified).length;
        
        // Count IoT anomalies
        const iotAnomalies = iotSensorData.filter(sensor => sensor.anomaly_detected).length;
        
        // Return summary data
        res.json({
            top_disaster_types: topDisasterTypes,
            most_active_region: mostActiveRegion,
            unverified_posts: unverifiedPosts,
            iot_anomalies: iotAnomalies
        });
    } catch (error) {
        console.error('Error fetching summary data:', error);
        res.status(500).json({ error: 'Failed to fetch summary data' });
    }
});

// Export router
module.exports = router;
