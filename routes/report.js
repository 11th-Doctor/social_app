var express = require('express')
var router = express.Router()
const SensitivePost = require('../models/SensitivePost')
const Post = require('../models/Post')
const FeedItem = require('../models/FeedItem')

router.post('/:postId/:ownerId', async (req, res) => {
    const postId = req.params.postId
    const ownerId = req.params.ownerId
    const userId = req.session.userId

    await SensitivePost.create({
        post: postId,
        postOwner: ownerId,
        user: userId
    })

    const count = await SensitivePost.countDocuments({post: postId}).lean()

    if (count > 2) {
        const flag = await Post.updateOne({_id: postId}, {isSensitive: true}).exec()
        await FeedItem.updateMany({post: postId}, {isSensitive: true}).exec()
    }

    await FeedItem.deleteOne({post: postId, user: userId})

    res.end()
})

module.exports = router