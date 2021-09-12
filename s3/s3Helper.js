var AWS = require('aws-sdk')
var path = require('path')
var uuid = require('uuid')

AWS.config.update({
    region: process.env.AWS_REGIO,
    accessKeyId: process.env.AWS_KEY,
    secretAccessKey: process.env.AWS_SECRET,
})

s3 = new AWS.S3()

const uploadFile = function(file, callBack) {
    const key = `${uuid.v4(file.name)}${path.extname(file.name)}`

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

const deleteFile = function(fileKey, callBack) {
    var params = {
        Bucket: 'social-app-11th-dr',
        Key: fileKey,
    }

    if (fileKey != null) {
        s3.deleteObject(params, (err, data) => {
            if (err) {
                console.log(`Error: ${err.toString()}`)
                
            } if (data) {
                callBack(data)
            }
        })
    }
}

module.exports = {
    uploadFile: uploadFile,
    deleteFile: deleteFile
}