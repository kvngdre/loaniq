export function getValidationErrorMessage(error) {
  const field = Object.keys(error.errors)[0];
  return error.errors[field].message
    .replace("Path", "")
    .replace("`", "")
    .replace("`", "")
    .trim();
}
