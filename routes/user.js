const express = require('express')
const router = express.Router()
const User = require('../models/User')

router.post('/signup', async (req, res) => {
    const email = req.body.email.toLowerCase()
    const password = req.body.password
    const fullName = req.body.fullName

    const user = new User({
        emailAddress: email,
        password: password,
        fullName: fullName
    })

    const userCreated = await user.save()

    req.session.userId = userCreated.id

    res.send()
})

router.post('/login', async (req, res) => {

    const email = req.body.email
    const password = req.body.password

    const user = await User.findOne({
        emailAddress: email,
    }, (err, user) => {
        if (err) {
            console.log(err.toString())
            return
        }

        user.comparePassword(password, (err, isMatch) => {
            if (err) {
                console.log(err.toString())
                return
            }
            
            if (isMatch) {
                req.session.userId = user.id
            }

            res.json({result: isMatch})
        })
    })
})

module.exports = router