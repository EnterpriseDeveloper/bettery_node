import fs from 'fs'
import S3 from 'aws-sdk/clients/s3'
import key from "../../config/key";

const bucketName = key.awsBucketName;
const region = key.awsBucketRegion;
const accessKeyId = key.awsAccessKey;
const secretAccessKey = key.awsSecretKey;

const s3 = new S3({
  region,
  accessKeyId,
  secretAccessKey
})

function uploadFile(file: any) {
  const fileStream = fs.createReadStream(file.path)

  const uploadParams = {
    Bucket: bucketName,
    Body: fileStream,
    Key: file.filename
  }

  return s3.upload(uploadParams).promise()
}


const getFileStream = (key: any) => {
  const downloadParams = {
    Key: key,
    Bucket: bucketName
  }

  return s3.getObject(downloadParams).createReadStream()
}

export = {
  getFileStream,
  uploadFile
}


