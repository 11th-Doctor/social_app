var express = require('express')
var router = express.Router()
const Post = require('../models/Post')
const User = require('../models/User')
const s3Helper  = require('../s3/s3Helper')

router.get('/', async (req, res) => {
    
    const userId = req.session.userId

    const posts = await Post.find({user: userId})
    .populate('user',{
        password: false,
        createdAt: false,
        updatedAt: false
    })
    .exec()
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
            user.posts.push(post)
            user.save()
            res.json(post)
        })
    })
})

module.exports = router