const mongoose = require('mongoose')
const { Schema } = mongoose;

const schema = new Schema({
    title: String,
    body: String,
}, {timestamps: true})

const Post = mongoose.model('Post', schema)

module.exports = Post