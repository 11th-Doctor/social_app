var express = require('express')
var moment = require('moment')
moment.locale('zh-TW')
var router = express.Router()
const Post = require('../models/Post')
const User = require('../models/User')
const s3Helper  = require('../s3/s3Helper')

router.get('/', async (req, res) => {
    
    const userId = req.session.userId

    var posts = await Post.find({user: userId})
    .lean()
    .populate('user',{
        fullName: true,
        emailAddress: true,
        updatedAt: true,
        profileImageUrl: true,
    })
    .exec()
    
    posts.forEach(post => {
        post.fromNow = moment(post.createdAt, 'YYYYMMDD').fromNow()
    })
    
    res.json(posts)
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
            await Post.deleteOne({_id: postId}).exec()
        }
    })

    res.end()
})

module.exports = router