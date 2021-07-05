const session = require('express-session')
const MongoStore = require('connect-mongo')

// session({
//     secret: '6d235981824df090e65b108cf95c3d0b',
//     resave: true,
//     saveUninitialized: true,
    // cookie: {
    //     _expires: 365 * 24 * 60 * 60 * 1000
    // },
    // store: MongoStore.create({
    //     mongoUrl: 'mongodb+srv://fullstackadmin:fullstackadmin111@cluster-wvpnn8jg.iyobr.mongodb.net/social_app?retryWrites=true&w=majority',
    //     collectionName: 'sessions'
    // })
// })


module.exports = session