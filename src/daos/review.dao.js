import BaseDAO from './base.dao'
import ConflictError from '../errors/ConflictError'
import Review from '../models/review.model'
import ValidationError from '../errors/ValidationError'

class ReviewDAO extends BaseDAO {
  static async insert (dto) {
    try {
      const newReview = new Review(dto)
      await newReview.save()

      return newReview
    } catch (exception) {
      if (exception.code === this.DUPLICATE_ERROR_CODE) {
        const field = this.getDuplicateField(exception)
        throw new ConflictError(`${field} already un use.`)
      }

      if (exception.name === 'Validation Error') {
        const errMsg = this.getValidationErrorMsg(exception)
        throw new ValidationError(errMsg)
      }

      throw exception
    }
  }

  static async findAll (filter = {}, projection = {}) {
    const foundRecords = await Review.find(filter).select(projection)

    return foundRecords
  }

  static async findById (id, projection = {}) {
    const foundRecord = await Review.findById(id).select(projection)

    return foundRecord
  }

  static async findOne (filter, projection = {}) {
    const foundRecord = await Review.findOne(filter).select(projection)

    return foundRecord
  }

  static async update (id, dto, projection = {}) {
    try {
      const foundRecord = await Review.findById(id).select(projection)

      foundRecord.set(dto)
      await foundRecord.save()

      return foundRecord
    } catch (exception) {
      if (exception.code === this.DUPLICATE_ERROR_CODE) {
        const field = this.getDuplicateField(exception)
        throw new ConflictError(`${field} already in use.`)
      }

      if (exception.name === 'ValidationError') {
        const errMsg = this.getValidationErrorMsg(exception)
        throw new ValidationError(errMsg)
      }

      throw exception
    }
  }

  static async remove (id) {
    const deletedRecord = await Review.findByIdAndDelete(id)

    return deletedRecord
  }
}

export default ReviewDAO
