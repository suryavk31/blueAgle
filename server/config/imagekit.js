const ImageKit = require('imagekit');
const dotenv = require('dotenv');
dotenv.config();

let imagekit;
try {
    if (process.env.IMAGEKIT_PUBLIC_KEY && process.env.IMAGEKIT_PRIVATE_KEY && process.env.IMAGEKIT_URL_ENDPOINT) {
        imagekit = new ImageKit({
            publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
            privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
            urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
        });
    } else {
        console.warn("⚠️ ImageKit keys missing. Image uploads will fail.");
        imagekit = null;
    }
} catch (error) {
    console.error("ImageKit initialization error:", error.message);
    imagekit = null;
}

module.exports = imagekit;
