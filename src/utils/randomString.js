/**
 * Generates a random string of fixed length.
 * @param {number} len The number of characters
 * @returns {string}
 */
export default function randomString (len = 6) {
  let randomString = ''
  const charSet =
    'ABCDEFGHJKMNOPQRSTUVWXYZ0123456789abcdefghjkmnopqrstuvwxyz9876543210'

  for (let i = 1; i <= len; i++) {
    const char = Math.floor(Math.random() * charSet.length)

    randomString += charSet.charAt(char)
  }
  return randomString
}
