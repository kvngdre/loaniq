
/**
 * Generates a random number of fixed length
 * @returns {number} six digit number
 */
function generateOTP(expireIn=5) {
    const minutesToMilliseconds = 60000
    
    const otp = Math.floor(100_000 + Math.random() * 900_000)
    const expirationTime = Date.now() + expireIn *minutesToMilliseconds;
    return  { 
         value: otp, 
        expirationTime 
    }
}

module.exports  = generateOTP;





