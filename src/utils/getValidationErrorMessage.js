/**
 * Retrieves the MongoDB validation error message.
 * @param {*} error
 * @returns {string}
 */
export default function getValidationErrorMessage(error) {
  const field = Object.keys(error.errors)[0];

  return error.errors[field].message.replace('Path', '');
}
