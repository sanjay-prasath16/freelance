const path = require('path');
const multer = require('multer');

var storage = multer.diskStorage({
    destination: function(req, file, cb) {
        if (file.fieldname === 'postPhoto') {
            cb(null, 'postPhotos/');
        }
    },
    filename: function(req, file, cb) {
        let ext = path.extname(file.originalname);
        cb(null, Date.now() + ext);
    }
});

var upload = multer({
    storage: storage,
    fileFilter: function(req, file, callback) {
        if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg' || file.mimetype === 'video/mp4' || file.mimetype === 'video/mkv') {
            callback(null, true);
        } else {
            callback(new Error('Invalid file format! Only PNG, JPG, JPEG, MP4, and MKV are allowed.'));
        }
    },
    limits: {
        fileSize: 50 * 1024 * 1024 //(50mb)
    }
});

var uploadPostDetails = upload.fields([
    { name: 'postPhoto', maxCount: 1 }
]);

module.exports = uploadPostDetails;