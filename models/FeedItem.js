const mongoose = require('mongoose')
const { Schema } = mongoose;

var schema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    post: {
        type: Schema.Types.ObjectId,
        ref: 'Post'
    },
    postOwner: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    postCreatedAt: {
        type: Date,
    },
    hasLiked: {
        type: Boolean,
        default: false
    },
    isSensitive: {
        type: Boolean,
        default: false
    }
}, {timestamps: true})

module.exports = mongoose.model('FeedItem', schema)