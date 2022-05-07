/**
 * Generates a random number of fixed length
 * @param {number} expireIn
 * @returns {object} six digit otp string and expiration time.
 */
function generateOTP(expireIn=5) {
    const oneMinuteInMilliseconds = 60_000;

    const otp = Math.floor(100_000 + Math.random() * 900_000)
    const expirationTime = Date.now() + expireIn * oneMinuteInMilliseconds;

    return  {
        OTP: otp,
        expirationTime
    };
}   

module.exports  = generateOTP;