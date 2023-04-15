/**
 * Validates if the given otp matches and has not expired
 * @param {string} otp - pin
 * @param {number} otp - pin expiration time in milliseconds from epoch
 * @param {string} otp - user provided otp
 * @returns {{isValid: boolean, message?: string}}
 */
export default function validateOTP (pin, expiresIn, otp) {
  if (Date.now() > expiresIn) {
    return { isValid: false, reason: 'OTP has expired.' }
  }

  if (otp !== pin) {
    return { isValid: false, reason: 'Invalid OTP' }
  }

  return { isValid: true }
}
