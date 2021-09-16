const mongoose = require('mongoose')
const { Schema } = mongoose;

var schema = new Schema({
    post: {
        type: Schema.Types.ObjectId,
        ref: 'Post'
    },
    postOwner: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
}, {timestamps: true})

module.exports = mongoose.model('SensitivePost', schema)