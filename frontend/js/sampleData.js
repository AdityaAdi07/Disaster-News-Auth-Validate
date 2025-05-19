/**
 * Sample Data for Development and Testing
 * This file contains sample data for the dashboard
 */

// Sample social posts with media attachments
const sampleSocialPosts = [
    {
        _id: 'sp001',
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
        location: 'San Francisco, California',
        content: 'Heavy flooding in downtown area. Streets completely submerged near Market Street. #FloodAlert',
        disaster_type: 'flood',
        confidence_score: 0.92,
        verified: true,
        source: 'Twitter',
        coordinates: [37.7749, -122.4194],
        viewed: true,
        media_url: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Zmxvb2R8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=800&q=60',
        upvotes: 24,
        downvotes: 2
    },
    {
        _id: 'sp002',
        timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(), // 45 minutes ago
        location: 'Los Angeles, California',
        content: 'Wildfire spotted in the hills. Smoke visible from miles away. Authorities responding. #FireAlert',
        disaster_type: 'fire',
        confidence_score: 0.88,
        verified: false,
        source: 'Instagram',
        coordinates: [34.0522, -118.2437],
        viewed: false,
        media_url: 'https://images.unsplash.com/photo-1473260079709-83c808703435?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8d2lsZGZpcmV8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=800&q=60',
        upvotes: 18,
        downvotes: 1
    },
    {
        _id: 'sp003',
        timestamp: new Date(Date.now() - 120 * 60 * 1000).toISOString(), // 2 hours ago
        location: 'Seattle, Washington',
        content: 'Earthquake just now! Building shook for about 10 seconds. Anyone else feel that? #Earthquake',
        disaster_type: 'earthquake',
        confidence_score: 0.95,
        verified: true,
        source: 'Twitter',
        coordinates: [47.6062, -122.3321],
        viewed: true,
        media_url: 'https://images.unsplash.com/photo-1600096194534-95cf5ece04cf?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8ZWFydGhxdWFrZXxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60',
        upvotes: 42,
        downvotes: 3
    },
    {
        _id: 'sp004',
        timestamp: new Date(Date.now() - 180 * 60 * 1000).toISOString(), // 3 hours ago
        location: 'Miami, Florida',
        content: 'Hurricane approaching. Winds picking up significantly. Preparing to evacuate. Stay safe everyone! #HurricaneWarning',
        disaster_type: 'cyclone',
        confidence_score: 0.91,
        verified: true,
        source: 'Facebook',
        coordinates: [25.7617, -80.1918],
        viewed: false,
        media_url: 'https://images.unsplash.com/photo-1504901645230-4a2ccf0be348?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8aHVycmljYW5lfGVufDB8fDB8fHww&auto=format&fit=crop&w=800&q=60',
        upvotes: 56,
        downvotes: 0
    },
    {
        _id: 'sp005',
        timestamp: new Date(Date.now() - 240 * 60 * 1000).toISOString(), // 4 hours ago
        location: 'Denver, Colorado',
        content: 'Landslide on mountain road after heavy rain. Road completely blocked. Avoid Highway 70. #Landslide',
        disaster_type: 'landslide',
        confidence_score: 0.87,
        verified: false,
        source: 'Local News',
        coordinates: [39.7392, -104.9903],
        viewed: true,
        media_url: 'https://images.unsplash.com/photo-1600103815368-5d2c9c3b8d2a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bGFuZHNsaWRlfGVufDB8fDB8fHww&auto=format&fit=crop&w=800&q=60',
        upvotes: 12,
        downvotes: 2
    }
];

// Function to inject sample data into the dashboard
function injectSampleData() {
    console.log('Injecting sample data for testing...');
    
    // Inject social posts with media
    if (typeof updateLiveFeed === 'function') {
        updateLiveFeed(sampleSocialPosts);
    }
}

// Export functions
window.injectSampleData = injectSampleData;
