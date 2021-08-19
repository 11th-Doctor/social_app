var express = require('express')
var moment = require('moment')
moment.locale('zh-TW')
var router = express.Router()
const Post = require('../models/Post')
const User = require('../models/User')
const Follower = require('../models/Follower')
const FeedItem = require('../models/FeedItem')
const s3Helper  = require('../s3/s3Helper')
const { populate } = require('../models/Post')

router.get('/', async (req, res) => {
    
    const userId = req.session.userId
    var allPosts = Array()

    var feedItems = await FeedItem.find({user: userId})
    .populate('postOwner', {
        fullName: true,
        emailAddress: true,
        profileImageUrl: true,
    })
    .populate('post')
    .lean()
    .exec()

    feedItems.forEach(item => {
        if (item.post) {
            item.post.user = item.postOwner
            item.post.canDelete = item.post.user.id == userId
            item.post.fromNow = moment(item.post.createdAt, 'YYYYMMDD').fromNow()
            allPosts.push(item.post)
        }
    })
    
    res.json(allPosts)
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