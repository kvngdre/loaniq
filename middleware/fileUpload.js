const { FileUploadError } = require('../errors/fileUploadError');
const multer = require('multer');
const path = require('path');

const multiplier = 5;
const ONE_MEGABYTE = 1024 * 1024;

const storage = multer.diskStorage({
    destination: (request, file, callback) => {
        if (file.fieldname === 'passport')
            callback(null, `./uploads/customers/passports`);
        else if (file.fieldname === 'idCard')
            callback(null, `./uploads/customers/idCards`);
        else if (file.fieldname === 'photo') callback(null, `./uploads/users`);
    },

    filename: (request, file, callback) => {
        //TODO: uncomment actual change
        if (file.fieldname === 'photo')
            return callback(
                null,
                `${request.body?.email}--${Date.now()}${path.extname(
                    file.originalname
                )}`
            );

        // console.log('multer request', request);

        // callback(null, `${Date.now()}${path.extname(file.originalname)}`)
        callback(
            null,
            `${request.body?.name?.first + ' ' + request.body?.name?.last}-${
                request.body?.employmentInfo?.ippis
            }--${Date.now()}${path.extname(file.originalname)}`
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
