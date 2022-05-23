const path = require('path');
const multer = require('multer');
const { FileUploadError } = require('../Errors/fileUploadError');


const multiplier = 5;
const ONE_MEGABYTE = 1024 * 1024;

const storage = multer.diskStorage({
    destination: (request, file, callback) => {
        console.log(request)
        if(file.fieldname === 'passport') callback(null, `./uploads/customers/passports`)

        else if(file.fieldname === 'idCard') callback(null, `./uploads/customers/idCards`)
    },

    filename: (request, file, callback) => {
        callback(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`)
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