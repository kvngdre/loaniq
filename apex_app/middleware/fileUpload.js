const path = require('path');
const multer = require('multer');
const { FileUploadError } = require('../errors/fileUploadError');


const multiplier = 5;
const ONE_MEGABYTE = 1024 * 1024;

const storage = multer.diskStorage({
    destination: (request, file, callback) => {
        if(file.fieldname === 'passport') callback(null, `./uploads/customers/passportss`)

        else if(file.fieldname === 'idCard') callback(null, `./uploads/customers/idCards`)

        else if(file.fieldname === 'profile picture') callback(null, `./uploads/users`)
    },

    filename: (request, file, callback) => {
        //TODO: uncomment actual change
        // if(file.fieldname === 'profile picture'){
        //     return callback(null, `${request.body.phone}-${request.body.name.firstName}-${Date.now()}${path.extname(file.originalname)}`)
        // }

        callback(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`)
        // callback(null, `${request.body.name.firstName + ' ' + request.body.name.lastName}-${request.body.employmentInfo.ippis}-${Date.now()}${path.extname(file.originalname)}`);
    }
})

const upload = multer({
    storage,

    limits: {
        fileSize: ONE_MEGABYTE * multiplier,  // 5MB
    },

    fileFilter: (request, file, callback) => {
        const fileExtension = path.extname(file.originalname);

        if( (['.jpg', '.jpeg', '.png'].includes(fileExtension)) 
            && 
            (['image/jpg', 'image/jpeg', 'image/png'].includes(file.mimetype))
          ) {
            return callback(null, true)
        }

        callback(new FileUploadError('400', 'Only images with format jpeg or png are allowed'), false)
    }
})

const multipleUpload = upload.fields([{name: 'passport'}, {name: 'idCard'}])

module.exports = multipleUpload;