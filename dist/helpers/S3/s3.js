"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var fs_1 = __importDefault(require("fs"));
var s3_1 = __importDefault(require("aws-sdk/clients/s3"));
var key_1 = __importDefault(require("../../config/key"));
var bucketName = key_1.default.awsBucketName;
var region = key_1.default.awsBucketRegion;
var accessKeyId = key_1.default.awsAccessKey;
var secretAccessKey = key_1.default.awsSecretKey;
var s3 = new s3_1.default({
    region: region,
    accessKeyId: accessKeyId,
    secretAccessKey: secretAccessKey
});
function uploadFile(file) {
    var fileStream = fs_1.default.createReadStream(file.path);
    var uploadParams = {
        Bucket: bucketName,
        Body: fileStream,
        Key: file.filename
    };
    return s3.upload(uploadParams).promise();
}
var getFileStream = function (key) {
    var downloadParams = {
        Key: key,
        Bucket: bucketName
    };
    return s3.getObject(downloadParams).createReadStream();
};
module.exports = {
    getFileStream: getFileStream,
    uploadFile: uploadFile
};
