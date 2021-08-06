const express = require('express')
const router = express.Router()
var moment = require('moment')
moment.locale('zh-TW')
const User = require('../models/User')
const Following = require('../models/Following')
const s3Helper  = require('../s3/s3Helper')
const { find } = require('../models/User')

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
    .lean()
    .populate({
        path: 'posts',
        model: 'Post',
        populate: {
            path: 'user',
            model: 'User',
            select: {password: 0, posts: 0, following: 0}
        }
    })
    .populate('following', {password: false})
    .exec()

    profile.posts.forEach(post => {
        post.fromNow = moment(post.createdAt, 'YYYYMMDD').fromNow()
    })
    
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

router.get('/search', async (req, res) => {
    const userId = '60dc826b1a9edb095e134b25'
    var users = await User.find({_id: {$ne: userId}},
        {posts: false, password: false})
        .lean()
        .exec()
    
    const followingDictionary = new Object()
    const currentUser = await User.findById(userId).exec()
    currentUser.following.forEach(follower => {
        followingDictionary[follower] = follower
    })

    users.forEach(user => {
        user.isFollowing = followingDictionary[user._id] != null
    })
    
    res.json(users)
})

router.post('/follow/:id', async (req, res) => {
    const currentUserId = req.session.userId
    const userIdToFollow = req.params.id
    
    await Following.create({
        user: currentUserId,
        userFollowed: userIdToFollow
    }, async (err, following) => {
        var currentUser = await User.findById(following.user).exec()
        var userFollowed = await User.findById(following.userFollowed).exec()
        currentUser.following.push(userFollowed)
        currentUser.save()
    })

    console.log(`Following: ${userIdToFollow}`)
    res.end()
})

router.post('/unfollow/:id', async (req, res) => {
    const currentUserId = req.session.userId
    const userIdToUnfollow = req.params.id

    await Following.deleteOne({
        user: currentUserId,
        userFollowed: userIdToUnfollow
    }).exec()

    var currentUser = await User.findById(currentUserId).exec()
    currentUser.following.pull({_id: userIdToUnfollow})
    currentUser.save()

    res.end()
})

module.exports = router