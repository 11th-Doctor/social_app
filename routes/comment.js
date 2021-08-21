var express = require('express')
var moment = require('moment')
moment.locale('zh-TW')
var router = express.Router()
const Comment = require('../models/Comment')

router.post('/:postId', async (req, res) => {
    const userId = req.session.userId
    const postId = req.params.postId
    const text = req.body.text

    await Comment.create({
        text: text,
        user: userId,
        post: postId
    })

    res.end()
})

module.exports = router