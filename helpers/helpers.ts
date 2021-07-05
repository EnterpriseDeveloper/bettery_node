const fsPromise = require("fs").promises;
const fs = require("fs");
const util = require('util');
const unlinkFile = util.promisify(fs.unlink);
const s3 = require("./S3/s3");

const arrayUnique = (array) => {
    var a = array.concat();
    for (var i = 0; i < a.length; ++i) {
        for (var j = i + 1; j < a.length; ++j) {
            if (a[i] === a[j])
                a.splice(j--, 1);
        }
    }

    return a;
}

const decodeBase64Image = (dataString) => {
    var matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
        response = {};

    response.type = matches[1];
    response.data = new Buffer.from(matches[2], 'base64');

    return response;
}

const uploadImage = async (thumImage, id) => {
    let imgBuffer = decodeBase64Image(thumImage);
    let type = imgBuffer.type.slice(imgBuffer.type.lastIndexOf('/') + 1);
    let imagePath = `./${id}.${type}`;
    await fsPromise.writeFile(imagePath, imgBuffer.data);
    let file = {
        path: imagePath,
        filename: `${id}.${type}`
    }
    await s3.uploadFile(file)
    await unlinkFile(file.path);
    return type;
}



module.exports = {
    arrayUnique,
    uploadImage
}