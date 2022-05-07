const validTime = 5;

/**
 * Get the current date 
* Multiple by 60000 to convert to milliseconds
*/
function expireOTP() {
    const expiration_time = Date.now() + validTime * 60000;
    return  expiration_time;
    }

module.exports  = expireOTP;