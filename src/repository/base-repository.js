class BaseDAO {
  static DUPLICATE_ERROR_CODE = 11000

  static getDuplicateField (err) {
    const field = Object.keys(err.keyPattern)[0]
    return field
      .charAt(0)
      .toUpperCase()
      .concat(field.slice(1))
      .replace('_', ' ')
  }

  static getValidationErrorMsg (err) {
    const field = Object.keys(err.errors)[0]
    return exception.errors[field].message.replace('Path', '')
  }
}

export default BaseDAO
