const fs = require('fs')
const S3 = require('aws-sdk/clients/s3')
const key = require("../../config/key");

const bucketName = key.awsBucketName;
const region = key.awsBucketRegion;
const accessKeyId = key.awsAccessKey;
const secretAccessKey = key.awsSecretKey;

const s3 = new S3({
  region,
  accessKeyId,
  secretAccessKey
})

function uploadFile(file) {
  const fileStream = fs.createReadStream(file.path)

  const uploadParams = {
    Bucket: bucketName,
    Body: fileStream,
    Key: file.filename
  }

  return s3.upload(uploadParams).promise()
}


const getFileStream = (key) =>{
  const downloadParams = {
    Key: key,
    Bucket: bucketName
  }

  return s3.getObject(downloadParams).createReadStream()
}

module.exports = {
  getFileStream,
  uploadFile
}


