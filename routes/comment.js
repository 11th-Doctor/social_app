var express = require('express')
var moment = require('moment')
moment.locale('zh-TW')
var router = express.Router()
const Comment = require('../models/Comment')

router.get('/:postId', async (req, res) => {
    const postId = req.params.postId

    var comments = await Comment.find({post: postId})
    .populate('user', '_id fullName profileImageUrl emailAddress')
    .lean()
    .exec()

    comments.forEach(comment => {
        comment.fromNow = moment(comment.createdAt, 'YYYYMMDD').fromNow()
    })
    
    res.json(comments)
})

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