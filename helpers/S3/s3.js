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


