var express = require('express')
var router = express.Router()
const Post = require('../models/Post')

router.get('/', async (req, res) => {
    
    const posts = await Post.find({}).exec()
    res.json(posts)
})

module.exports = router