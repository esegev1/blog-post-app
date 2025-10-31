
const multer = require('multer');

const imgUploadPath = process.env.IMG_UPLOAD_PATH;

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        //Route files to the upload folder defined in the .env file
        cb(null, imgUploadPath);
    },
    filename: function (req, file, cb) {
        // Create unique filename using timestamp and original extension
        cb(null, file.fieldname + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage, limits: { fileSize: 500 * 1024 * 1024 } });




const fileConfig = upload.fields([
    { name: 'imageUrl', maxCount: 1 },
    { name: 'previewImageUrl', maxCount: 1 },
    { name: 'videoUrl', maxCount: 1 }
]);


module.exports = {
    fileConfig
}