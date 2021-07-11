const express = require('express')
const app = express()
const port = 3000

const db = require('./db')
const session = require('express-session')
const MongoStore = require('connect-mongo')
const fileUpload = require('express-fileupload');

app.use(session({
    secret: '6d235981824df090e65b108cf95c3d0b',
    resave: true,
    saveUninitialized: true,
    cookie: {
        _expires: 365 * 24 * 60 * 60 * 1000,
    },
    store: MongoStore.create({
        mongoUrl: 'mongodb+srv://fullstackadmin:fullstackadmin111@cluster-wvpnn8jg.iyobr.mongodb.net/social_app?retryWrites=true&w=majority',
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

app.use(fileUpload())
app.use('/post', post)
app.use('/user', user)

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})