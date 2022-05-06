
/**
 * Generates a random number of fixed length
 * @returns {number} six digit number
 */
function generateOTP() {
    const otp = Math.floor(100_000 + Math.random() * 900_000)
    return  otp;
    }

module.exports  = generateOTP;





