class BaseRepository {
  getDuplicateField(err) {
    const field = Object.keys(err.keyPattern)[0];
    return field
      .charAt(0)
      .toUpperCase()
      .concat(field.slice(1))
      .replace('_', ' ');
  }

  getValidationErrorMessage(err) {
    const field = Object.keys(err.errors)[0];
    return err.errors[field].message.replace('Path', '');
  }
}

export default BaseRepository;
