const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure the properties directory exists
const propertiesDir = path.join(__dirname, '../../public/properties');
if (!fs.existsSync(propertiesDir)) {
    fs.mkdirSync(propertiesDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, propertiesDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
    },
});

// Check file type
const fileFilter = (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|webp/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Only images are allowed'));
    }
};

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter,
});

module.exports = upload;