export function formatDuplicateFieldError(error) {
  const field = Object.keys(error.keyPattern)[0];
  return {
    [field]: field
      .charAt(0)
      .toUpperCase()
      .concat(field.slice(1))
      .replace(/([A-Z])/g, " $1")
      .trim()
      .concat(" is already in use"),
  };
}
