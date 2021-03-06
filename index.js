const express = require('express')
const app = express()
const port = process.env.PORT || 5000
const mongoUrl = 'mongodb+srv://'+process.env.MONGODB_USERNAME+':'+process.env.MONGODB_PASSWORD+'@'+process.env.MONGODB_DATABASE+'?retryWrites=true&w=majority'

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
        mongoUrl: mongoUrl,
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
const report = require('./routes/report')

app.use(fileUpload())
app.use('/static', express.static('public'))
app.use('/post', post)
app.use('/user', user)
app.use('/comment', comment)
app.use('/like', like)
app.use('/report', report)

app.get('/', (req, res) => {
    res.json({msg: `Hi, there!`})
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})