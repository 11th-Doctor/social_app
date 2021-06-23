const mongoose = require('mongoose')
const uri = "mongodb+srv://fullstackadmin:fullstackadmin111@cluster-wvpnn8jg.iyobr.mongodb.net/social_app?retryWrites=true&w=majority"

module.exports = mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.catch(err => {
    console.error(err.toString())
})