/**
 * Retrieves the duplicate field
 * @param {*} error
 * @returns {string}
 */
export default function getDuplicateErrorField(error) {
  const field = Object.keys(error.keyPattern)[0];

  // Capitalize the first letter and remove underscore if any.
  return field.charAt(0).toUpperCase().concat(field.slice(1)).replace('_', ' ');
}
