
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { faker } = require('@faker-js/faker');

// Import models
const SocialPost = require('./models/socialPosts');
const IoTSensorData = require('./models/iotSensorData');
const DisasterAlert = require('./models/disasterAlerts');
const RegionsStats = require('./models/regionsStats');

// Import constants
const { 
    DISASTER_TYPES, 
    SENSOR_TYPES, 
    ALERT_STATUSES, 
    ALERT_SEVERITIES 
} = require('./config/constants');

// Load environment variables
dotenv.config();

// MongoDB connection URI
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/disaster-dashboard';

// Sample data counts
const SOCIAL_POSTS_COUNT = 50;
const IOT_SENSORS_COUNT = 20;
const DISASTER_ALERTS_COUNT = 15;

// Indian cities for sample data
const INDIAN_CITIES = [
    { name: 'Mumbai', coordinates: [19.0760, 72.8777] },
    { name: 'Delhi', coordinates: [28.7041, 77.1025] },
    { name: 'Bangalore', coordinates: [12.9716, 77.5946] },
    { name: 'Hyderabad', coordinates: [17.3850, 78.4867] },
    { name: 'Chennai', coordinates: [13.0827, 80.2707] },
    { name: 'Kolkata', coordinates: [22.5726, 88.3639] },
    { name: 'Ahmedabad', coordinates: [23.0225, 72.5714] },
    { name: 'Pune', coordinates: [18.5204, 73.8567] },
    { name: 'Jaipur', coordinates: [26.9124, 75.7873] },
    { name: 'Lucknow', coordinates: [26.8467, 80.9462] },
    { name: 'Bhopal', coordinates: [23.2599, 77.4126] },
    { name: 'Patna', coordinates: [25.5941, 85.1376] },
    { name: 'Kochi', coordinates: [9.9312, 76.2673] },
    { name: 'Guwahati', coordinates: [26.1445, 91.7362] },
    { name: 'Bhubaneswar', coordinates: [20.2961, 85.8245] }
];

// Social media sources
const SOCIAL_MEDIA_SOURCES = [
    'Twitter',
    'Facebook',
    'Instagram',
    'Local News',
    'Government Alert',
    'Citizen Report',
    'Emergency Services'
];

// Sensor names
const SENSOR_NAMES = {
    [SENSOR_TYPES.TEMPERATURE]: [
        'Temperature Sensor',
        'Weather Station',
        'Climate Monitor',
        'Heat Detector'
    ],
    [SENSOR_TYPES.HUMIDITY]: [
        'Humidity Sensor',
        'Moisture Monitor',
        'Weather Station',
        'Climate Tracker'
    ],
    [SENSOR_TYPES.GAS]: [
        'Gas Detector',
        'Air Quality Monitor',
        'Pollution Sensor',
        'Chemical Detector'
    ],
    [SENSOR_TYPES.SEISMIC]: [
        'Seismic Sensor',
        'Earthquake Monitor',
        'Ground Motion Detector',
        'Vibration Sensor'
    ]
};

/**
 * Generate a random date within the last 7 days
 * @returns {Date} Random date
 */
const getRandomRecentDate = () => {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return new Date(sevenDaysAgo.getTime() + Math.random() * (now.getTime() - sevenDaysAgo.getTime()));
};

/**
 * Get a random item from an array
 * @param {Array} array - The array to get a random item from
 * @returns {*} Random item
 */
const getRandomItem = (array) => {
    return array[Math.floor(Math.random() * array.length)];
};

/**
 * Get a random disaster type
 * @returns {string} Random disaster type
 */
const getRandomDisasterType = () => {
    const disasterTypes = Object.values(DISASTER_TYPES);
    return getRandomItem(disasterTypes);
};

/**
 * Get a random sensor type
 * @returns {string} Random sensor type
 */
const getRandomSensorType = () => {
    const sensorTypes = Object.values(SENSOR_TYPES);
    return getRandomItem(sensorTypes);
};

/**
 * Get a random severity
 * @returns {string} Random severity
 */
const getRandomSeverity = () => {
    const severities = Object.values(ALERT_SEVERITIES);
    return getRandomItem(severities);
};

/**
 * Get a random city
 * @returns {Object} Random city with name and coordinates
 */
const getRandomCity = () => {
    return getRandomItem(INDIAN_CITIES);
};

/**
 * Generate sample social posts
 * @returns {Array} Array of social post objects
 */
const generateSocialPosts = () => {
    const socialPosts = [];
    
    for (let i = 0; i < SOCIAL_POSTS_COUNT; i++) {
        const city = getRandomCity();
        const disasterType = getRandomDisasterType();
        
        // Generate disaster-specific content
        let content = '';
        switch (disasterType) {
            case DISASTER_TYPES.FLOOD:
                content = faker.helpers.arrayElement([
                    `Heavy flooding in ${city.name}. Roads are submerged and people are stranded.`,
                    `Water levels rising rapidly in ${city.name} due to continuous rainfall.`,
                    `Flash floods reported in ${city.name}. Authorities advising evacuation.`
                ]);
                break;
            case DISASTER_TYPES.EARTHQUAKE:
                content = faker.helpers.arrayElement([
                    `Earthquake of magnitude ${(Math.random() * 3 + 3).toFixed(1)} felt in ${city.name}.`,
                    `Buildings shaking in ${city.name}. People rushing outdoors.`,
                    `Tremors felt across ${city.name}. No major damage reported yet.`
                ]);
                break;
            case DISASTER_TYPES.FIRE:
                content = faker.helpers.arrayElement([
                    `Major fire outbreak in ${city.name}. Fire department responding.`,
                    `Building on fire in downtown ${city.name}. Smoke visible from miles away.`,
                    `Forest fire approaching ${city.name}. Authorities on high alert.`
                ]);
                break;
            case DISASTER_TYPES.CYCLONE:
                content = faker.helpers.arrayElement([
                    `Cyclone approaching ${city.name}. Heavy winds and rainfall expected.`,
                    `${city.name} bracing for cyclone impact. Evacuation orders issued.`,
                    `Cyclonic storm intensifying near ${city.name}. Red alert issued.`
                ]);
                break;
            case DISASTER_TYPES.LANDSLIDE:
                content = faker.helpers.arrayElement([
                    `Landslide reported on the outskirts of ${city.name} after heavy rainfall.`,
                    `Major landslide blocks highway to ${city.name}. Vehicles stranded.`,
                    `Several homes damaged in ${city.name} due to landslide.`
                ]);
                break;
        }
        
        socialPosts.push({
            timestamp: getRandomRecentDate(),
            location: city.name,
            content,
            disaster_type: disasterType,
            confidence_score: Math.random().toFixed(2),
            verified: Math.random() > 0.7, // 30% chance of being verified
            source: getRandomItem(SOCIAL_MEDIA_SOURCES),
            coordinates: city.coordinates,
            viewed: Math.random() > 0.5 // 50% chance of being viewed
        });
    }
    
    return socialPosts;
};

/**
 * Generate sample IoT sensor data
 * @returns {Array} Array of IoT sensor data objects
 */
const generateIoTSensorData = () => {
    const iotSensorData = [];
    
    for (let i = 0; i < IOT_SENSORS_COUNT; i++) {
        const city = getRandomCity();
        const sensorType = getRandomSensorType();
        
        // Generate sensor-specific value
        let value = 0;
        let anomalyDetected = false;
        
        switch (sensorType) {
            case SENSOR_TYPES.TEMPERATURE:
                // Temperature between -5 and 50 degrees Celsius
                value = (Math.random() * 55 - 5).toFixed(1);
                anomalyDetected = value < -5 || value > 40;
                break;
            case SENSOR_TYPES.HUMIDITY:
                // Humidity between 0% and 100%
                value = (Math.random() * 100).toFixed(1);
                anomalyDetected = value < 10 || value > 90;
                break;
            case SENSOR_TYPES.GAS:
                // Gas level between 0 and 150 ppm
                value = (Math.random() * 150).toFixed(1);
                anomalyDetected = value > 100;
                break;
            case SENSOR_TYPES.SEISMIC:
                // Seismic activity between 0 and 6
                value = (Math.random() * 6).toFixed(2);
                anomalyDetected = value > 4;
                break;
        }
        
        iotSensorData.push({
            timestamp: getRandomRecentDate(),
            name: getRandomItem(SENSOR_NAMES[sensorType]),
            type: sensorType,
            value,
            location: city.name,
            coordinates: city.coordinates,
            anomaly_detected: anomalyDetected,
            status: Math.random() > 0.9 ? 'offline' : 'online', // 10% chance of being offline
            threshold: {
                normal: {
                    min: 0,
                    max: 100
                },
                warning: {
                    min: -10,
                    max: 150
                }
            }
        });
    }
    
    return iotSensorData;
};

/**
 * Generate sample disaster alerts
 * @returns {Array} Array of disaster alert objects
 */
const generateDisasterAlerts = () => {
    const disasterAlerts = [];
    
    for (let i = 0; i < DISASTER_ALERTS_COUNT; i++) {
        const city = getRandomCity();
        const disasterType = getRandomDisasterType();
        const severity = getRandomSeverity();
        const isActive = Math.random() > 0.3; // 70% chance of being active
        
        // Generate disaster-specific content
        let content = '';
        switch (disasterType) {
            case DISASTER_TYPES.FLOOD:
                content = `Flood warning for ${city.name}. ${severity === ALERT_SEVERITIES.HIGH ? 'Immediate evacuation required.' : 'Stay alert and follow authorities\' instructions.'}`;
                break;
            case DISASTER_TYPES.EARTHQUAKE:
                content = `Earthquake alert for ${city.name}. ${severity === ALERT_SEVERITIES.HIGH ? 'Take cover immediately.' : 'Be prepared for aftershocks.'}`;
                break;
            case DISASTER_TYPES.FIRE:
                content = `Fire alert for ${city.name}. ${severity === ALERT_SEVERITIES.HIGH ? 'Evacuate the area immediately.' : 'Stay away from affected areas.'}`;
                break;
            case DISASTER_TYPES.CYCLONE:
                content = `Cyclone warning for ${city.name}. ${severity === ALERT_SEVERITIES.HIGH ? 'Seek shelter immediately.' : 'Secure loose items and stay indoors.'}`;
                break;
            case DISASTER_TYPES.LANDSLIDE:
                content = `Landslide warning for ${city.name}. ${severity === ALERT_SEVERITIES.HIGH ? 'Evacuate the area immediately.' : 'Avoid hilly areas and follow safety guidelines.'}`;
                break;
        }
        
        const alert = {
            timestamp: getRandomRecentDate(),
            location: city.name,
            disaster_type: disasterType,
            status: isActive ? ALERT_STATUSES.ACTIVE : ALERT_STATUSES.RESOLVED,
            severity,
            verified: Math.random() > 0.2, // 80% chance of being verified
            coordinates: city.coordinates,
            content,
            source: Math.random() > 0.5 ? 'system' : getRandomItem(SOCIAL_MEDIA_SOURCES),
            affected_area_radius: Math.floor(Math.random() * 20) + 1, // 1-20 km
            viewed: Math.random() > 0.5 // 50% chance of being viewed
        };
        
        // Add resolved_at and resolved_by if the alert is resolved
        if (!isActive) {
            alert.resolved_at = new Date();
            alert.resolved_by = 'admin';
        }
        
        disasterAlerts.push(alert);
    }
    
    return disasterAlerts;
};

/**
 * Generate sample regions stats
 * @param {Array} disasterAlerts - Array of disaster alerts
 * @param {Array} iotSensorData - Array of IoT sensor data
 * @returns {Object} Regions stats object
 */
const generateRegionsStats = (disasterAlerts, iotSensorData) => {
    // Count disasters by type
    const disasterTypes = {
        [DISASTER_TYPES.FLOOD]: 0,
        [DISASTER_TYPES.EARTHQUAKE]: 0,
        [DISASTER_TYPES.FIRE]: 0,
        [DISASTER_TYPES.CYCLONE]: 0,
        [DISASTER_TYPES.LANDSLIDE]: 0
    };
    
    disasterAlerts.forEach(alert => {
        disasterTypes[alert.disaster_type]++;
    });
    
    // Count disasters by region
    const regionDisasters = new Map();
    
    disasterAlerts.forEach(alert => {
        const region = alert.location;
        regionDisasters.set(region, (regionDisasters.get(region) || 0) + 1);
    });
    
    // Convert Map to object for MongoDB
    const regionDisastersObj = {};
    regionDisasters.forEach((value, key) => {
        regionDisastersObj[key] = value;
    });
    
    // Count active alerts
    const activeAlerts = disasterAlerts.filter(alert => alert.status === ALERT_STATUSES.ACTIVE).length;
    
    // Count affected regions
    const affectedRegions = regionDisasters.size;
    
    // Count sensors
    const totalSensors = iotSensorData.length;
    const sensorsOnline = iotSensorData.filter(sensor => sensor.status === 'online').length;
    
    return {
        timestamp: new Date(),
        disasterTypes,
        regionDisasters: regionDisastersObj,
        totalDisasters: disasterAlerts.length,
        activeAlerts,
        affectedRegions,
        sensorsOnline,
        totalSensors,
        trends: {
            disasterChange: Math.random() * 20 - 10, // -10% to +10%
            alertChange: Math.random() * 20 - 10,
            regionChange: Math.random() * 20 - 10
        },
        period: 'daily'
    };
};

/**
 * Seed the database with sample data
 */
const seedDatabase = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        
        console.log('MongoDB connected');
        
        // Clear existing data
        await Promise.all([
            SocialPost.deleteMany({}),
            IoTSensorData.deleteMany({}),
            DisasterAlert.deleteMany({}),
            RegionsStats.deleteMany({})
        ]);
        
        console.log('Existing data cleared');
        
        // Generate sample data
        const socialPosts = generateSocialPosts();
        const iotSensorData = generateIoTSensorData();
        const disasterAlerts = generateDisasterAlerts();
        const regionsStats = generateRegionsStats(disasterAlerts, iotSensorData);
        
        // Insert sample data
        await Promise.all([
            SocialPost.insertMany(socialPosts),
            IoTSensorData.insertMany(iotSensorData),
            DisasterAlert.insertMany(disasterAlerts),
            RegionsStats.create(regionsStats)
        ]);
        
        console.log('Sample data inserted');
        console.log(`- ${socialPosts.length} social posts`);
        console.log(`- ${iotSensorData.length} IoT sensor data points`);
        console.log(`- ${disasterAlerts.length} disaster alerts`);
        console.log('- 1 regions stats document');
        
        // Disconnect from MongoDB
        await mongoose.disconnect();
        
        console.log('Database seeded successfully');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

// Run the seeder
seedDatabase();
