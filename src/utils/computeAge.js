/**
 * Computes person age
 * @param {string} dob Date of birth in ISO 8601 format.
 * @returns {number}
 */
export default function computeAge(dob) {
  const epochYear = 1970

  const diff = Date.now() - new Date(dob).getTime()
  const age = new Date(diff).getUTCFullYear() - epochYear

  return age
}
