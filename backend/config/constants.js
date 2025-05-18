/**
 * Application Constants
 * Defines constants used throughout the application
 */

// Disaster types
const DISASTER_TYPES = {
    FLOOD: 'flood',
    EARTHQUAKE: 'earthquake',
    FIRE: 'fire',
    CYCLONE: 'cyclone',
    LANDSLIDE: 'landslide'
};

// Sensor types
const SENSOR_TYPES = {
    TEMPERATURE: 'temperature',
    HUMIDITY: 'humidity',
    GAS: 'gas',
    SEISMIC: 'seismic'
};

// Alert statuses
const ALERT_STATUSES = {
    ACTIVE: 'active',
    RESOLVED: 'resolved'
};

// Alert severities
const ALERT_SEVERITIES = {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high'
};

// Sensor thresholds
const SENSOR_THRESHOLDS = {
    TEMPERATURE: {
        NORMAL: { MIN: 0, MAX: 35 },
        WARNING: { MIN: -10, MAX: 45 }
    },
    HUMIDITY: {
        NORMAL: { MIN: 30, MAX: 70 },
        WARNING: { MIN: 15, MAX: 85 }
    },
    GAS: {
        NORMAL: { MIN: 0, MAX: 50 },
        WARNING: { MIN: 0, MAX: 100 }
    },
    SEISMIC: {
        NORMAL: { MIN: 0, MAX: 2 },
        WARNING: { MIN: 0, MAX: 4 }
    }
};

// WebSocket update intervals (in milliseconds)
const UPDATE_INTERVALS = {
    SOCIAL_POSTS: 10000, // 10 seconds
    IOT_SENSORS: 5000,   // 5 seconds
    ALERTS: 10000,       // 10 seconds
    ANALYTICS: 10000     // 10 seconds
};

// Default map center (India)
const DEFAULT_MAP_CENTER = [20.5937, 78.9629];
const DEFAULT_MAP_ZOOM = 5;

// Export constants
module.exports = {
    DISASTER_TYPES,
    SENSOR_TYPES,
    ALERT_STATUSES,
    ALERT_SEVERITIES,
    SENSOR_THRESHOLDS,
    UPDATE_INTERVALS,
    DEFAULT_MAP_CENTER,
    DEFAULT_MAP_ZOOM
};
