const express = require('express')
const router = express.Router()
const FeedItem = require('../models/FeedItem')
const Like = require('../models/Like')

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
            }
        }
    })

    res.end()
})

router.post('/:id/dislike', (req, res) => {

})

module.exports = router