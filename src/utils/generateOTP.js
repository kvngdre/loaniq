/**
 * Generates a random number string of specified length and expiration time.
 * @param {number} len The number of digits the otp should contain.
 * @param {number} expiresIn OTP time-to-live in minutes.
 * @returns {{pin: string, expiresIn: number}}
 */
export default function generateOTP(len, expires = 10) {
  if (!len) throw new Error('Length is required.');

  const ONE_MINUTE_IN_MILLISECONDS = 60_000;
  const val1 = 10 ** (len - 1);
  const val2 = val1 * 9;

  const pin = Math.floor(Math.random() * val2 + val1).toString();
  const expiresIn = Date.now() + expires * ONE_MINUTE_IN_MILLISECONDS;

  return { pin, expiresIn };
}

/**
 *
 * @param {number} len
 * @param {number} ttl
 * @returns
 */
// export default function generateOTP(len, ttl) {
//   if (typeof len !== number || typeof ttl !== number) {
//     throw new Error('Arguments must be of type "number".');
//   }

//   return {
//     value: Math.random() * 10 ** len,
//     expiresIn: Date.now() + ttl * 60 * 1_000,
//   };
// }
