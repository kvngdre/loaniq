/**
 * Computes employment tenure.
 * @param {string} doe Date of employment in ISO 8601 format.
 * @returns {number}
 */
export default function computeTenure (doe) {
  const diff = Date.now() - new Date(doe).getTime()
  const tenure = new Date(diff).getUTCFullYear() - 1970

  return tenure
}
