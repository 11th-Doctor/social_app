var express = require('express')
var router = express.Router()
const Post = require('../models/Post')
const uploadFile = require('../uploadFile')

router.get('/', async (req, res) => {
    
    const posts = await Post.find({})
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

    uploadFile(req.files.imagefile, async (data) => {

        const post = await Post.create({
            text: postBody,
            imageUrl: data.Location,
            user: req.session.userId
        }, (err, post) => {
            if (err) {
                console.log(err.toString())
                return
            }
    
            res.json(post)
        })
    })
    
})

module.exports = router