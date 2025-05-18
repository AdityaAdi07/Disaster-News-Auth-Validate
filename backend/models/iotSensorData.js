/**
 * IoT Sensor Data Model
 * Represents sensor readings (temperature, humidity, gas, seismic activity)
 */

const mongoose = require('mongoose');

// Define schema
const iotSensorDataSchema = new mongoose.Schema({
    timestamp: {
        type: Date,
        required: true,
        default: Date.now
    },
    name: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['temperature', 'humidity', 'gas', 'seismic'],
        required: true
    },
    value: {
        type: Number,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    coordinates: {
        type: [Number], // [latitude, longitude]
        validate: {
            validator: function(v) {
                return v.length === 2;
            },
            message: 'Coordinates must be [latitude, longitude]'
        }
    },
    anomaly_detected: {
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        enum: ['online', 'offline', 'maintenance'],
        default: 'online'
    },
    unit: {
        type: String,
        required: function() {
            return this.type === 'temperature' || this.type === 'humidity' || this.type === 'gas';
        },
        default: function() {
            switch (this.type) {
                case 'temperature':
                    return '°C';
                case 'humidity':
                    return '%';
                case 'gas':
                    return 'ppm';
                default:
                    return '';
            }
        }
    },
    threshold: {
        normal: {
            min: Number,
            max: Number
        },
        warning: {
            min: Number,
            max: Number
        }
    }
}, {
    timestamps: true
});

// Create indexes
iotSensorDataSchema.index({ type: 1 });
iotSensorDataSchema.index({ location: 1 });
iotSensorDataSchema.index({ timestamp: -1 });
iotSensorDataSchema.index({ anomaly_detected: 1 });

// Create model
const IoTSensorData = mongoose.model('IoTSensorData', iotSensorDataSchema);

// Export model
module.exports = IoTSensorData;
