/**
 * Generates a random string of fixed length.
 * @param {number} len The number of characters
 * @returns {string}
 */
export default function randomString(len = 6) {
  let str = '';
  const charSet = '2468ABCDEFGHJKMNOPQRSTUVWXYZ0abcdefghjkmnopqrstuvwxyz13579';

  for (let i = 1; i <= len; i++) {
    const randomNum = Math.floor(Math.random() * charSet.length);
    str += charSet.charAt(randomNum);
  }

  return str;
}
