var AWS = require('aws-sdk')
var path = require('path')
var uuid = require('uuid')

const uploadFile = function(file, callBack, indexKey = null) {
    AWS.config.update({
        region: 'us-west-1',
        accessKeyId: 'AKIAJLAGUG4XRJOLP4FA',
        secretAccessKey: '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',
    })
    s3 = new AWS.S3()
    
    const key = indexKey == null ? `${uuid.v4(file.name)}${path.extname(file.name)}` : indexKey

    var params = {
        Bucket: 'social-app-11th-dr',
        Key: key,
        Body: file.data,
        ACL: 'public-read',
    }

    s3.upload(params, async (err, data) => {
        if (err) {
            console.log(`Error: ${err.toString()}`)
            
        } if (data) {
            callBack(data)
        }
    })
}

module.exports = uploadFile