const express = require('express')
const router = express.Router()
const FeedItem = require('../models/FeedItem')
const Like = require('../models/Like')
const Post = require('../models/Post')

router.post('/:id/like', async (req, res) => {
    postId = req.params.id
    userId = req.session.userId

    await FeedItem.updateOne({
        post: postId,
        user: userId
    }, {hasLiked: true}, null, async (err, res) => {
        if (err === null) {
            //res.n: Number of documents matched
            //res.nModified: Number of documents modified
            if (res.n === 1 && res.nModified === 1) {
                await Like.create({
                    post: postId,
                    user: userId
                })

                const numLikes = await Like.countDocuments()
                console.log(`like: ${numLikes}`)
                await Post.updateOne({_id: postId}, {numLikes: numLikes})
            }
        }
    })

    res.end()
})

router.post('/:id/dislike', async (req, res) => {
    const postId = req.params.id
    const userId = req.session.userId

    await FeedItem.updateOne({
        post: postId,
        user: userId
    }, {hasLiked: false}, null, async (err, res) => {
        if (err === null) {
            if (res.n === 1 && res.nModified === 1) {
                await Like.deleteOne({
                    post: postId,
                    user: userId
                })

                const numLikes = await Like.countDocuments()
                console.log(`like: ${numLikes}`)
                await Post.updateOne({_id: postId}, {numLikes: numLikes})
            }
        }
    })

    res.end()
})

module.exports = router