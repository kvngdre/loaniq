/**
 * Generates a random number string of specified length and expiration time.
 * @param {number} len The number of digits the otp should contain.
 * @param {number} expires OTP time-to-live in minutes.
 * @returns {{pin: string, expires: number}}
 */
export default function generateOTP (len, expires = 10) {
  if (!len) throw new Error('Length is required.')

  const ONE_MINUTE_IN_MILLISECONDS = 60_000
  const val1 = 10 ** (len - 1)
  const val2 = val1 * 9

  const pin = Math.floor(Math.random() * val2 + val1).toString()
  const expiresIn = Date.now() + expires * ONE_MINUTE_IN_MILLISECONDS

  return { pin, expiresIn }
}
