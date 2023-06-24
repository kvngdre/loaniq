export class BaseRepository {
  DUPLICATE_ERROR_CODE = 11000;

  getDuplicateField(err) {
    const field = Object.keys(err.keyPattern)[0];
    return field
      .charAt(0)
      .toUpperCase()
      .concat(field.slice(1))
      .replace('_', ' ');
  }

  getValidationErrorMsg(err) {
    const field = Object.keys(err.errors)[0];
    return err.errors[field].message.replace('Path', '');
  }
}
