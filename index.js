const express = require('express')
const app = express()
const port = process.env.PORT || 5000

const db = require('./db')
const session = require('express-session')
const MongoStore = require('connect-mongo')
const fileUpload = require('express-fileupload');

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
    cookie: {
        _expires: 365 * 24 * 60 * 60 * 1000,
    },
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI,
        collectionName: 'sessions'
    })
}))

// parse application/x-www-form-urlencoded
app.use(express.urlencoded({
    extended: true
}))
app.use(express.json())

const post = require('./routes/post')
const user = require('./routes/user')
const comment = require('./routes/comment')
const like = require('./routes/like')

app.use(fileUpload())
app.use('/static', express.static('public'))
app.use('/post', post)
app.use('/user', user)
app.use('/comment', comment)
app.use('/like', like)

app.get('/', (req, res) => {
    res.json({msg: `Hi, there!`})
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})