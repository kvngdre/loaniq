const ONE_MINUTE_IN_MILLISECONDS = 60_000;

/**
 * Generates a random number of fixed length (8)
 * @param {number} [expireIn=5] OTP life span in minutes.
 * @returns {object} six digit otp string and expiration time.
 */
function generateOTP(expireIn = 5) {
    const otp = Math.floor(Math.random() * 90_000_000 + 10_000_000 ).toString();
    const expires = Date.now() + expireIn * ONE_MINUTE_IN_MILLISECONDS;

    return {
        OTP: otp,
        expires,
    };
}

module.exports = generateOTP;
