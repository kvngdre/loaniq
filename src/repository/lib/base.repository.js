export class BaseRepository {
  constructor() {
    this.getDuplicateField = function (error) {
      const field = Object.keys(error.keyPattern)[0];
      return field
        .charAt(0)
        .toUpperCase()
        .concat(field.slice(1))
        .replace('_', ' ');
    };

    this.getValidationErrorMessage = function (error) {
      const field = Object.keys(error.errors)[0];
      return error.errors[field].message.replace('Path', '');
    };
  }
}
