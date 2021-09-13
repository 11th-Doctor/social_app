var express = require('express')
var router = express.Router()
const SensitivePost = require('../models/SensitivePost')
const FeedItem = require('../models/FeedItem')

router.post('/:postId', async (req, res) => {
    const postId = req.params.postId
    const userId = req.session.userId

    await SensitivePost.create({
        post: postId,
        user: userId
    })

    const count = await SensitivePost.countDocuments({post: postId}).lean()

    if (count > 2) {
        await FeedItem.updateMany({post: postId}, {isSensitive: true}).exec()
    }

    res.end()
})

module.exports = router