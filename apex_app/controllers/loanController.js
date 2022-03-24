const loanManager = require('../tools/Managers/loanManager');


const loans = {
    createLoan: async function(requestBody) {
        const loanRequest = await loanManager.createLoanRequest(requestBody);
        return loanRequest;
    },

    getAll: async function() {
        return await loanManager.getAllLoans();
    },

    getOne: async function() {

    },

    // modify

    // delete also delete loan agent
    
};

module.exports = loans;
