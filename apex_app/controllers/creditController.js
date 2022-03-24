const User = require('../models/userModel');
const loanManager = require('../tools/Managers/loanManager');



// Analyze loan request
/* 
Change status of loan
tenor
loan amount change
BVN validation -- called at approval.
prepare disbursement schedule
check if the user has been paid.
approval levels build
*/

const credit ={
    getLoan: async function(requestBody) { return await loanManager.getOne(requestBody); }
    
};

module.exports = credit;