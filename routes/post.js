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

    var user = await User.findOne({_id: req.session.userId},
        {_id: 1,profileImageUrl: 1, emailAddress: 1 ,fullName: 1, updatedAt: 1, posts: 1}).exec()

    s3Helper.uploadFile(req.files.imagefile, async (data) => {
        const post = await Post.create({
            text: postBody,
            imageUrl: data.Location,
            user: user
        }, async (err, post) => {
            if (err) {
                console.log(err.toString())
                return
            }
            
            user.posts.push(post)
            user.save()
            res.json(post)
        })
    })
})

module.exports = router