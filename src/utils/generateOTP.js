const ONE_MINUTE_IN_MILLISECONDS = 60_000

/**
 * Generates a random number of fixed length (6)
 * @param {number} [expireIn=5] OTP life span in minutes.
 * @returns {object} six digit otp string and expiration time.
 */
function generateOTP (expireIn = 5) {
  const pin = Math.floor(Math.random() * 900_000 + 100_000).toString()
  const expires = Date.now() + expireIn * ONE_MINUTE_IN_MILLISECONDS

  return { pin, expires }
}

export default generateOTP
