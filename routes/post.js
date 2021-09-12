var express = require('express')
var moment = require('moment')
moment.locale('zh-TW')
var router = express.Router()
const Post = require('../models/Post')
const User = require('../models/User')
const Comment = require('../models/Comment')
const Following = require('../models/Following')
const Follower = require('../models/Follower')
const FeedItem = require('../models/FeedItem')
const Like = require('../models/Like')
const s3Helper  = require('../s3/s3Helper')

router.get('/', async (req, res) => {
    
    const userId = req.session.userId
    var allPosts = Array()

    var feedItems = await FeedItem.find({user: userId})
    .populate('postOwner', {
        fullName: true,
        emailAddress: true,
        profileImageUrl: true,
    })
    .sort({postCreatedAt: 'desc'})
    .populate('post')
    .lean()
    .exec()

    feedItems.forEach(item => {
        if (item.post) {
            item.post.user = item.postOwner
            item.post.canDelete = item.post.user._id == userId
            item.post.fromNow = moment(item.post.createdAt, 'YYYYMMDD').fromNow()
            item.post.hasLiked = item.hasLiked
            item.post.numLikes = item.post.numLikes
            // item.post.isSensitive = true
            allPosts.push(item.post)
        }
    })
    
    res.json(allPosts)
})

router.get('/:id', async (req, res) => {
    const postId = req.params.id

    var comments = await Comment.find({post: postId})
    .populate('user', '_id fullName profileImageUrl')
    .lean()
    .exec()

    comments.forEach(comment => {
        comment.fromNow = moment(comment.createdAt, 'YYYYMMDD').fromNow()
    })

    res.json(comments)
})

router.post('/', async (req, res) => {
    const postBody = req.body.postBody

    if (req.files.imagefile == undefined) {
        res.json({
            err: 'There are no files uploaded.'
        })
        return
    }

    var user = await User.findOne({_id: req.session.userId}).exec()

    s3Helper.uploadFile(req.files.imagefile, async (data) => {
        const post = await Post.create({
            text: postBody,
            imageUrl: data.Location,
            user: user._id
        }, async (err, post) => {
            if (err) {
                console.log(err.toString())
                return
            }

            await FeedItem.create({
                user: user._id,
                post: post._id,
                postOwner: post.user._id,
                postCreatedAt: post.createdAt
            })

            const followers = await Follower.find({follower: user._id}).exec()

            followers.forEach(async follower => {
                await FeedItem.create({
                    user: follower,
                    post: post._id,
                    postOwner: user._id,
                    postCreatedAt: post.createdAt
                })
            })

            res.json(post)
        })
    })
})

router.get('/likes/:id', async (req, res) => {
    const userId = req.session.userId
    const postId = req.params.id

    var usersLikingPost = Array()

    const likes = await Like.find({post: postId})
    .populate('user', '_id fullName profileImageUrl emailAddress')
    .lean()
    .exec()

    const followingDictionary = new Object()

    const following = await Following.find({user: userId}).lean().exec()
    following.forEach(follower => {
        followingDictionary[follower.userFollowed] = follower
    })

    likes.forEach(like => {
        like.user.isCurrentUser = like.user._id == userId
        like.user.isFollowing = followingDictionary[like.user._id] != null
        usersLikingPost.push(like.user)
    })

    res.json(usersLikingPost)
})

router.delete('/:id', async (req, res) => {
    let postId = req.params.id
    const post = await Post.findById(postId).exec()
    const path = require('path')
    const fileKey = path.basename(post.imageUrl)
    s3Helper.deleteFile(fileKey, async data => {
        if (data != null) {
            await Post.deleteOne({_id: postId}, err => {
                res.end()
            })
        }
    })
})

module.exports = router