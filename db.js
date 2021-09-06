const mongoose = require('mongoose')
const uri = process.env.MONGODB_URI

mongoose.set('useCreateIndex', true)

module.exports = mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.catch(err => {
    console.error(err.toString())
})