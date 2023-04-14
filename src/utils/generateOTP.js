/**
 * Generates a random number string of specified length and expiration time.
 * @param {number} expiresIn OTP time-to-live in minutes.
 * @param {number} len The number of digits the otp should contain.
 * @returns {{pin: string, expires: number}}
 */
export default function generateOTP (expiresIn = 5, len = 6) {
  const ONE_MINUTE_IN_MILLISECONDS = 60_000
  const val1 = 10 ** (len - 1)
  const val2 = val1 * 9

  const pin = Math.floor(Math.random() * val2 + val1).toString()
  const expires = Date.now() + expiresIn * ONE_MINUTE_IN_MILLISECONDS

  return { pin, expires }
}
