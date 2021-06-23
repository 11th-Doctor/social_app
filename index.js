const express = require('express')
const app = express()
const port = 3000

const posts = require('./routes/posts')
const db = require('./db')

app.use('/posts', posts)

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})