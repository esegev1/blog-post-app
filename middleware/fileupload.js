const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Convert relative path to absolute
const imgUploadPath = process.env.IMG_UPLOAD_PATH;

const storage = multer.diskStorage({
    destination: function (req, file, cb) {  
        // Check if directory exists and is writable
        try {
            fs.accessSync(imgUploadPath, fs.constants.W_OK);
            console.log('Directory is writable ✓');
            cb(null, imgUploadPath);
        } catch (err) {
            console.error('Directory access error:', err);
            cb(err);
        }
    },
    filename: function (req, file, cb) {
        const filename = file.fieldname + '-' + file.originalname;
        cb(null, filename);
    }
});

const upload = multer({ 
    storage: storage, 
    limits: { fileSize: 500 * 1024 * 1024 }
});

// Wrap with error handling
const fileConfig = (req, res, next) => {
    upload.fields([
        { name: 'imageUrl', maxCount: 1 },
        { name: 'previewImageUrl', maxCount: 1 },
        { name: 'videoUrl', maxCount: 1 }
    ])(req, res, (err) => {
        if (err) {
            console.error('Full error:', err);
            return res.status(400).json({ error: err.message });
        }
        if (req.files) {
            for (const [fieldname, files] of Object.entries(req.files)) {
                console.log(`${fieldname}:`, files[0].filename, `(${files[0].size} bytes)`);
            }
        }
        
        next();
    });
};

module.exports = {
    fileConfig
};