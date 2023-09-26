export function formatValidationError(error) {
  const field = Object.keys(error.errors)[0];
  const message = error.errors[field].message
    .replace("Path", "")
    .replace("`", "")
    .replace("`", "")
    .trim();

  return {
    [field]: message,
  };
}
