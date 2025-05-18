/**
 * Social Posts Model
 * Represents social media posts related to disasters
 */

const mongoose = require('mongoose');

// Define schema
const socialPostSchema = new mongoose.Schema({
    timestamp: {
        type: Date,
        required: true,
        default: Date.now
    },
    location: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    disaster_type: {
        type: String,
        enum: ['flood', 'earthquake', 'fire', 'cyclone', 'landslide'],
        required: true
    },
    confidence_score: {
        type: Number,
        required: true,
        min: 0,
        max: 1
    },
    verified: {
        type: Boolean,
        default: false
    },
    source: {
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
    viewed: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Create indexes
socialPostSchema.index({ location: 1 });
socialPostSchema.index({ verified: 1 });
socialPostSchema.index({ disaster_type: 1 });
socialPostSchema.index({ timestamp: -1 });

// Create model
const SocialPost = mongoose.model('SocialPost', socialPostSchema);

// Export model
module.exports = SocialPost;
