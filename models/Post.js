const mongoose = require('mongoose')
const { Schema } = mongoose;

const schema = new Schema({
    text: {
        type: String
    },
    imageUrl: {
        type: String
    },
    numLikes: {
        type: Number,
        default: 0
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
}, {timestamps: true})

const Post = mongoose.model('Post', schema)

module.exports = Post