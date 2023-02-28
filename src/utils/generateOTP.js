const ONE_MINUTE_IN_MILLISECONDS = 60_000

/**
 * Generates a random number of fixed length (6)
 * @param {number} [expiresIn=5] OTP time-to-live in minutes.
 * @param {number} [len=6] The number of digits the otp should contain.
 * @returns {{pin, expires}} six digit otp string and expiration time.
 */
function generateOTP (expiresIn = 5, len = 6) {
  const val1 = 10 ** (len - 1)
  const val2 = val1 * 9

  const pin = Math.floor(Math.random() * val2 + val1).toString()
  const expires = Date.now() + expiresIn * ONE_MINUTE_IN_MILLISECONDS

  return { pin, expires }
}

export default generateOTP
