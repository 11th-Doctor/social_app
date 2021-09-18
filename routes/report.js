var express = require('express')
var router = express.Router()
const SensitivePost = require('../models/SensitivePost')
const Post = require('../models/Post')
const FeedItem = require('../models/FeedItem')

router.post('/post/:postId/owner/:ownerId', async (req, res) => {
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

router.post('/user/:id', (req, res) => {

    const userId = req.session.userId
    const reportedUserId = req.params.id

    console.log(`reportedUserId: ${reportedUserId}`)

    res.end()
})

router.post('/block/:id', (req, res) => {
    const userId = req.session.userId
    const reportedUserId = req.params.id

    console.log(`blocking...: ${reportedUserId}`)

    res.end()
})

router.post('/issue', (req, res) => {
    const userId = req.session.userId
    const description = req.body.description

    console.log(`did receive an issue: ${description}`)
    res.end()
})

module.exports = router