import multer, { diskStorage } from 'multer';
import { extname } from 'path';
import ValidationError from '../errors/validation.error.js';

const ONE_MEGABYTE = 1024 * 1024;

const getStorageOpts = (req, file) => {
  const { body, currentUser } = req;

  // * Switching to get file path and name.
  switch (file.fieldname) {
    case 'passport':
      return ['./src/uploads/customers/passports', `${Date.now()}.${body?.staff_id}${extname(file.originalname)}`];

    case 'id_card':
      return ['./src/uploads/customers/id_cards', `${Date.now()}.${body?.staff_id}${extname(file.originalname)}`];

    case 'avatar':
      return ['./src/uploads/users/avatars', `${Date.now()}.${currentUser._id}${extname(file.originalname)}`];

    case 'documents':
      return ['./src/uploads/tenants/documents', `${Date.now()}.${currentUser.tenantId}${extname(file.originalname)}`];

    case 'logo':
      return ['./src/uploads/tenants/logos', `${Date.now()}.${currentUser.tenantId}${extname(file.originalname)}`];
    default:
      throw new ValidationError('Invalid field name.');
  }
};

const fileFilter = (_req, file, callback) => {
  const validFileExt = ['.jpg', '.jpeg', '.png'];
  const fileExt = extname(file.originalname);

  if (validFileExt.includes(fileExt)) {
    return callback(null, true);
  }

  return callback(new ValidationError('Only images with format jpeg or png are allowed'));
};

class FileUploader {
  #multiplier;
  // #storage
  // #multer

  constructor() {
    this.#multiplier = 5;
  }

  #storage = diskStorage({
    destination: (req, file, callback) => {
      try {
        callback(null, getStorageOpts(req, file)[0]);
      } catch (err) {
        callback(err);
      }
    },

    filename: (req, file, callback) => {
      try {
        callback(null, getStorageOpts(req, file)[1]);
      } catch (err) {
        callback(err);
      }
    },
  });

  #multer = multer({
    storage: this.#storage,
    limits: {
      fileSize: ONE_MEGABYTE * this.#multiplier, // 5MB
    },
    fileFilter,
  });

  single = (fieldName) => {
    const upload = this.#multer.single(fieldName);
    return (req, res, next) => {
      upload(req, res, (err) => {
        if (err) next(err);

        next();
      });
    };
  };

  fields = (fields) => {
    const upload = this.#multer.fields(fields);
    return (req, res, next) => {
      upload(req, res, (err) => {
        if (err) next(err);

        next();
      });
    };
  };
}

export default new FileUploader();
// .fields([{name: 'passport'}, {name: 'idCard'}])
