const multer = require('multer');
const path = require('path');

// Use Memory Storage for ImageKit upload
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    console.log(`📁 [Multer FileFilter] Inspecting file: originalname="${file.originalname}", mimetype="${file.mimetype}"`);
    
    const allowedExtensions = /jpeg|jpg|png|gif|webp|svg|avif|bmp|heic|mp4|webm|mov|mkv/;
    const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
    const isExtAllowed = allowedExtensions.test(ext);
    const isMimeAllowed = file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/');

    if (isExtAllowed || isMimeAllowed) {
        console.log(`✅ [Multer FileFilter] File accepted: ${file.originalname}`);
        return cb(null, true);
    } else {
        console.error(`❌ [Multer FileFilter] File REJECTED (unsupported type): ${file.originalname} (${file.mimetype})`);
        cb(new Error(`Only images and videos are allowed! Received: ${file.mimetype}`), false);
    }
};

const upload = multer({
    storage: storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
    fileFilter: fileFilter
});

module.exports = upload;
