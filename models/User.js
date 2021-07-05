const mongoose = require('mongoose')
const { Schema } = mongoose
const bcryptjs  = require('bcryptjs')
const SALT_WORK_FACTOR = 10

const schema = new Schema({
    emailAddress: {
        type: String,
        required: true,
        index: { unique: true}
    },
    password: {
        type: String,
        required: true
    },
    fullName: {
        type: String,
        required: true
    },
    profileImageUrl: {
        type: String,
    },
    bio: {
        type: String
    }
}, {timestamps: true})

schema.pre('save', function(next) {
    var user = this
    // only hash the password if it has been modified (or is new)
    if (!user.isModified('password')) {
        return next()
    }

    // generate a salt
    bcryptjs.genSalt(SALT_WORK_FACTOR, (err, salt) => {
        if (err) {
            return next(err)
        }

        // hash the password using our new salt
        bcryptjs.hash(user.password, salt, (err, hash) => {
            if (err) {
                return next(err)
            }

            // override the cleartext password with the hashed one
            user.password = hash
            next()
        })
    })
})

schema.methods.comparePassword = function(candidatePassword, cb) {
    bcryptjs.compare(candidatePassword, this.password, (err, isMatch) => {
        if (err) {
            return cb(err)
        }
        
        cb(null, isMatch)
    })
}

const User = mongoose.model('User', schema)

module.exports = User