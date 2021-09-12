const mongoUrl = 'mongodb+srv://'+process.env.MONGODB_USERNAME+':'+process.env.MONGODB_PASSWORD+'@'+process.env.MONGODB_DATABASE+'?retryWrites=true&w=majority'
const mongoose = require('mongoose')

mongoose.set('useCreateIndex', true)

module.exports = mongoose.connect(mongoUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.catch(err => {
    console.error(err.toString())
})