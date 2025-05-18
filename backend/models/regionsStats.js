/**
 * Regions Stats Model
 * Represents aggregated region-level statistics for charting
 */

const mongoose = require('mongoose');

// Define schema
const regionsStatsSchema = new mongoose.Schema({
    timestamp: {
        type: Date,
        required: true,
        default: Date.now
    },
    // Disaster counts per type
    disasterTypes: {
        flood: {
            type: Number,
            default: 0
        },
        earthquake: {
            type: Number,
            default: 0
        },
        fire: {
            type: Number,
            default: 0
        },
        cyclone: {
            type: Number,
            default: 0
        },
        landslide: {
            type: Number,
            default: 0
        }
    },
    // Region disaster counts
    regionDisasters: {
        type: Map,
        of: Number,
        default: new Map()
    },
    // Total disasters
    totalDisasters: {
        type: Number,
        default: 0
    },
    // Active alerts
    activeAlerts: {
        type: Number,
        default: 0
    },
    // Affected regions count
    affectedRegions: {
        type: Number,
        default: 0
    },
    // Sensor health
    sensorsOnline: {
        type: Number,
        default: 0
    },
    totalSensors: {
        type: Number,
        default: 0
    },
    // Trend data (for showing changes over time)
    trends: {
        // Percentage change in disasters compared to previous period
        disasterChange: {
            type: Number,
            default: 0
        },
        // Percentage change in active alerts compared to previous period
        alertChange: {
            type: Number,
            default: 0
        },
        // Percentage change in affected regions compared to previous period
        regionChange: {
            type: Number,
            default: 0
        }
    },
    // Time period for the stats
    period: {
        type: String,
        enum: ['hourly', 'daily', 'weekly', 'monthly'],
        default: 'daily'
    }
}, {
    timestamps: true
});

// Create indexes
regionsStatsSchema.index({ timestamp: -1 });
regionsStatsSchema.index({ period: 1 });

// Create model
const RegionsStats = mongoose.model('RegionsStats', regionsStatsSchema);

// Export model
module.exports = RegionsStats;
