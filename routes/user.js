const { json } = require('express')
const express = require('express')
const router = express.Router()
const User = require('../models/User')
const s3Helper  = require('../s3/s3Helper')

router.post('/signup', async (req, res) => {
    const email = req.body.email.toLowerCase()
    const password = req.body.password
    const fullName = req.body.fullName

    const user = new User({
        emailAddress: email,
        password: password,
        fullName: fullName
    })

    const userCreated = await user.save()

    req.session.userId = userCreated.id

    res.send()
})

router.post('/login', async (req, res) => {

    const email = req.body.email.toLowerCase()
    const password = req.body.password

    await User.findOne({
        emailAddress: email,
    }, (err, user) => {
        if (err) {
            console.log(err.toString())
            return
        }
        console.log(user)
        if (user === null) {
            res.json({result: false})
        } else {
            user.comparePassword(password, (err, isMatch) => {
                if (err) {
                    console.log(err.toString())
                    return
                }
                
                if (isMatch) {
                    req.session.userId = user.id
                }
                
                res.json({result: isMatch, userId: req.session.userId})
            })
        }
    })
})

router.get('/profile', async (req, res) => {

    const profile = await User.findOne({_id: '60dc826b1a9edb095e134b25'}, {password: false})
    .populate({
        path: 'posts',
        model: 'Post',
        populate: {
            path: 'user',
            model: 'User',
            select: {posts: 0}
        }
    }).exec()
    console.log(profile)
    res.json(profile)
})

router.post('/profile', async (req, res) => {
    const userId = req.session.userId
    const fullName = req.body.fullName
    var fileKey = null

    await User.findById(userId, {profileImageUrl: true}, (err, data) => {
        if (err) {
            consloe.log(err.toString())
            return
        }

        var path = require('path')
        fileKey = data.profileImageUrl == '' ? null : path.basename(data.profileImageUrl)
    })

    if (req.files != undefined) {
        const imagefile = req.files.imagefile

        if (fileKey != null) {
            s3Helper.deleteFile(fileKey, data => {
                if (data != null) {
                    s3Helper.uploadFile(imagefile, async data => {
                        await User.updateOne({_id: userId}, {profileImageUrl: data.Location})
                    })
                } else {
                    console.log('Failed to delete the file')
                }
            })
            
        } else {
            s3Helper.uploadFile(imagefile, async data => {
                await User.updateOne({_id: userId}, {profileImageUrl: data.Location})
            })
        }
    }

    res.json({result: 1})
})

module.exports = router