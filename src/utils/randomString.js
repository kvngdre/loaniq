/**
 * Generates a random string of fixed length.
 * @param {number} len The number of characters
 * @returns {string}
 */
export default function randomString (len = 6) {
  let str = ''
  const charSet = 'ABCDEFGHJKM0123456789NOPQRSTUVWXYZ'

  for (let i = 1; i <= len; i++) {
    const randomNum = Math.floor(Math.random() * charSet.length)
    str += charSet.charAt(randomNum)
  }

  return str
}
