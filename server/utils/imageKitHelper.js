const imagekit = require('../config/imagekit');

const uploadToImageKit = async (fileBuffer, fileName) => {
    return new Promise((resolve, reject) => {
        imagekit.upload({
            file: fileBuffer, // required
            fileName: fileName, // required
            folder: '/project_one' // optional
        }, function (error, result) {
            if (error) reject(error);
            else resolve(result);
        });
    });
};

module.exports = { uploadToImageKit };
