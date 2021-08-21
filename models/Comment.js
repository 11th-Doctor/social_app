const mongoose = require('mongoose')
const { Schema } = mongoose;

var schema = new Schema({
    text: {
        type: String,
        require: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    post: {
        type: Schema.Types.ObjectId,
        ref: 'Post'
    }
}, {timestamps: true})

module.exports = mongoose.model('Comment', schema)