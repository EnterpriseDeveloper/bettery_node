import fs from 'fs'
import S3 from 'aws-sdk/clients/s3'
import {awsBucketName, awsBucketRegion, awsAccessKey, awsSecretKey} from "../../config/key";

const bucketName = awsBucketName;
const region = awsBucketRegion;
const accessKeyId = awsAccessKey;
const secretAccessKey = awsSecretKey;

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

export {
  getFileStream,
  uploadFile
}


