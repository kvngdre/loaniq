import { Error } from 'mongoose';
import DuplicateError from '../errors/duplicate.error.js';
import ValidationError from '../errors/validation.error.js';
import getDuplicateErrorField from '../utils/getDuplicateErrorField.js';
import getValidationErrorMessage from '../utils/getValidationErrorMessage.js';
import User from './user.model.js';

class UserRepository {
  /**
   * Inserts a new user document into the database.
   * @param {*} newUserDto
   * @param {mongoose.ClientSession} session Mongo transaction session
   * @returns
   */
  async insert(newUserDto, session) {
    try {
      const newRecord = new User(newUserDto);
      await newRecord.save({ session });

      return newRecord;
    } catch (exception) {
      // * Handling duplicate field error
      if (exception.message.includes('E11000')) {
        const field = getDuplicateErrorField(exception);
        throw new DuplicateError(`${field} already in use.`);
      }

      if (exception instanceof Error.ValidationError) {
        const errorMessage = getValidationErrorMessage(exception);
        throw new ValidationError(errorMessage);
      }

      throw exception;
    }
  }

  static async find(
    filter = {},
    projection = {},
    sortOrder = { first_name: 1 },
  ) {
    const foundRecords = await User.find(filter)
      .select(projection)
      .sort(sortOrder);

    return foundRecords;
  }

  static async findById(id, projection = {}) {
    const foundRecord = await User.findById(id)
      .select(projection)
      .populate({ path: 'role', select: '-tenantId' });

    return foundRecord;
  }

  static async findOne(filter, projection = {}) {
    const foundRecord = await User.findOne(filter)
      .select(projection)
      .populate({ path: 'role', select: '-tenantId' });

    return foundRecord;
  }

  static async update(filter, dto, projection = {}) {
    try {
      const foundRecord = await User.findOne(filter).select(projection);

      foundRecord.set(dto);
      await foundRecord.save();

      return foundRecord;
    } catch (exception) {
      if (exception.code === this.DUPLICATE_ERROR_CODE) {
        const field = this.getDuplicateField(exception);
        throw new DuplicateError(`${field} already in use.`);
      }

      if (exception instanceof Error.ValidationError) {
        const errMsg = this.getValidationErrorMsg(exception);
        throw new ValidationError(errMsg);
      }

      throw exception;
    }
  }

  static async updateMany(filter, dto) {
    const result = await User.updateMany(filter, dto);

    return result;
  }

  static async remove(id) {
    const foundRecord = await User.findByIdAndDelete(id);

    return foundRecord;
  }
}

export default UserRepository;
