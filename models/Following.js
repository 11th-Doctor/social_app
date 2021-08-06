const mongoose = require('mongoose')
const { Schema } = mongoose;

var schema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    userFollowed: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    }
})

module.exports = mongoose.model('Following', schema)