const FileUploadError = require('../errors/fileUploadError');
const multer = require('multer');
const path = require('path');

const multiplier = 5;
const ONE_MEGABYTE = 1024 * 1024;

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        if (file.fieldname === 'passport')
            cb(null, `./uploads/customers/passports`);
        else if (file.fieldname === 'idCard')
            cb(null, `./uploads/customers/idCards`);
        else if (file.fieldname === 'photo') cb(null, `./uploads/users`);
    },

    filename: (req, file, cb) => {
        //TODO: uncomment actual change
        if (file.fieldname === 'photo')
            return cb(
                null,
                `${req.user.id}--${Date.now()}${path.extname(
                    file.originalname
                )}`
            );

        cb(
            null,
            `${req.body?.name?.first}_${req.body?.name?.last}--${req.body?.ippis}--${Date.now()}${path.extname(file.originalname)}`
        );
    },
});

const upload = multer({
    storage,

    limits: {
        fileSize: ONE_MEGABYTE * multiplier, // 5MB
    },

    fileFilter: (request, file, callback) => {
        const fileExtension = path.extname(file.originalname);

        if (
            ['.jpg', '.jpeg', '.png'].includes(fileExtension) &&
            ['image/jpg', 'image/jpeg', 'image/png'].includes(file.mimetype)
        ) {
            return callback(null, true);
        }

        callback(
            new FileUploadError(
                400,
                'Only images with format jpeg or png are allowed'
            ),
            false
        );
    },
});

// .fields([{name: 'passport'}, {name: 'idCard'}])
module.exports = upload;
