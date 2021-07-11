const mongoose = require('mongoose')
const { Schema } = mongoose;

var schema = new Schema({
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

schema.virtual('id').get(function() {
    return this._id
})

const Post = mongoose.model('Post', schema)

module.exports = Post