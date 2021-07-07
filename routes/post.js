var express = require('express')
var router = express.Router()
const Post = require('../models/Post')

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

    const text = req.body.text

    /*const post = await Post.create({
        text: text,
        user: req.session.userId
    }, (err, post) => {
        if (err) {
            console.log(err.toString())
            return
        }

        res.json(post)
    })*/
    console.log(req.body.file)
    res.end()
})

module.exports = router