/**
 * Post Votes Model
 * Represents votes on social media posts
 */

const mongoose = require('mongoose');

// Define schema
const postVoteSchema = new mongoose.Schema({
    post_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SocialPost',
        required: true
    },
    vote: {
        type: String,
        enum: ['up', 'down'],
        required: true
    },
    timestamp: {
        type: Date,
        required: true,
        default: Date.now
    },
    session_id: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

// Create indexes
postVoteSchema.index({ post_id: 1 });
postVoteSchema.index({ session_id: 1 });
postVoteSchema.index({ post_id: 1, session_id: 1 }, { unique: true });

// Create model
const PostVote = mongoose.model('PostVote', postVoteSchema);

// Export model
module.exports = PostVote;
