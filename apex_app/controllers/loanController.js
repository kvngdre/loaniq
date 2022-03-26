const loanManager = require('../tools/Managers/loanManager');


const loans = {
    createLoanRequest: async function(requestBody) {
        return await loanManager.createLoanRequest(requestBody);
    },

    createLoan: async function(requestBody) {
        return await loanManager.createLoan(requestBody);
    },

    getAll: async function() {
        return await loanManager.getAllLoans();
    },

    getOne: async function(id) {
        return await loanManager.getOne(id)
    },

    // modify

    // delete also delete loan agent
    
};

module.exports = loans;
