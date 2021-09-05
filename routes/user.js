const express = require('express')
const router = express.Router()
var moment = require('moment')
moment.locale('zh-TW')
const User = require('../models/User')
const Post = require('../models/Post')
const Following = require('../models/Following')
const Follower = require('../models/Follower')
const s3Helper  = require('../s3/s3Helper')
const FeedItem = require('../models/FeedItem')

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
    let userId = req.session.userId

    var profile = await User.findById(userId, {password: false})
    .lean()
    .exec()

    const posts = await Post.find({user: userId})
    .populate('user','_id emailAddress fullName  profileImageUrl bio')
    .sort({createdAt: 'desc'})
    .lean()
    .exec()

    const following = await Following.find({user: userId}).lean()
    const followers = await Follower.find({user: userId}).lean()

    profile.posts = posts
    profile.posts.forEach(post => {
        post.canDelete = true
        post.fromNow = moment(post.createdAt, 'YYYYMMDD').fromNow()
    })

    profile.following = following.length
    profile.followers = followers.length
    
    res.json(profile)
})

router.get('/profile/:id', async (req, res) => {
    let userId = req.params.id
    var profile = await User.findById(userId, {password: false})
    .sort({createdAt: 'desc'})
    .lean()
    .exec()

    const posts = await Post.find({user: userId})
    .populate('user','_id emailAddress fullName  profileImageUrl')
    .lean()
    .exec()

    const following = await Following.find({user: userId}).lean()
    const followers = await Follower.find({user: userId}).lean()

    profile.posts = posts
    profile.posts.forEach(post => {
        post.canDelete = false
        post.fromNow = moment(post.createdAt, 'YYYYMMDD').fromNow()
    })

    profile.following = following.length
    profile.followers = followers.length
    var isFollowing = followers.findIndex(item => {
        return item.follower == req.session.userId
    })
    profile.isFollowing = isFollowing > -1 ? true : false

    res.json(profile)
})

router.post('/profile', async (req, res) => {
    const userId = req.session.userId
    const fullName = req.body.fullName
    const bio = req.body.bio
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
                        await User.updateOne({_id: userId}, {
                                profileImageUrl: data.Location, 
                                fullName: fullName,
                                bio: bio
                            })

                            res.json({result: 1})
                            return
                    })
                } else {
                    console.log('Failed to delete the file')
                }
            })
            
        } else {
            s3Helper.uploadFile(imagefile, async data => {
                await User.updateOne({_id: userId}, {profileImageUrl: data.Location})
                res.json({result: 1})
                return
            })
        }
    }

})

router.get('/search', async (req, res) => {
    const userId = req.session.userId
    var users = await User.find({_id: {$ne: userId}},
        {posts: false, password: false})
        .lean()
        .exec()
    
    const followingDictionary = new Object()

    const following = await Following.find({user: userId})
    following.forEach(follower => {
        followingDictionary[follower.userFollowed] = follower
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
    })

    await Follower.create({
        user: userIdToFollow,
        follower: currentUserId
    })

    const postsForUserImFollowing = await Post.find({user: userIdToFollow})
    .lean()
    .exec()

    postsForUserImFollowing.forEach(async post => {
        await FeedItem.create({
            user: currentUserId,
            post: post._id,
            postOwner: userIdToFollow,
            postCreatedAt: post.createdAt,
        })
    })

    res.end()
})

router.post('/unfollow/:id', async (req, res) => {
    const currentUserId = req.session.userId
    const userIdToUnfollow = req.params.id

    await Following.deleteOne({
        user: currentUserId,
        userFollowed: userIdToUnfollow
    }).exec()

    await Follower.deleteOne({
        user: userIdToUnfollow,
        follower: currentUserId
    })

    await FeedItem.deleteMany({$and: [
        {user: currentUserId},
        {postOwner: userIdToUnfollow}
    ]})

    res.end()
})

router.get('/following', async (req,res) => {
    userId = req.session.userId

    const following = await Following.find({user: userId})
    .populate('userFollowed', '_id emailAddress fullName  profileImageUrl')
    .lean()
    .exec()

    var allFollowing = Array()

    following.forEach(user => {
        allFollowing.push(user.userFollowed)
    })

    res.json(allFollowing)
})

module.exports = router