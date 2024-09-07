const path = require('path');
const multer = require('multer');

var storage = multer.diskStorage({
    destination: function(req, file, cb) {
        if (file.fieldname === 'profilePhoto') {
            cb(null, 'profilePhoto/');
        } else if (file.fieldname === 'coverPhoto') {
            cb(null, 'coverPhoto/');
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
        if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
            callback(null, true);
        } else {
            callback(new Error('Invalid file format! Only PNG, JPG, and JPEG are allowed.'));
        }
    },
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB
    }
});

var uploadFields = upload.fields([
    { name: 'profilePhoto', maxCount: 1 },
    { name: 'coverPhoto', maxCount: 1 }
]);

module.exports = uploadFields;