const loanManager = require('../tools/Managers/loanManager');


const loans = {
    createLoanRequest: async function(requestBody) {
        return await loanManager.createLoanRequest(requestBody);
    },

    createLoan: async function(request) {
        return await loanManager.createLoan(request);
    },

    getAll: async function(user) {
        return await loanManager.getAllLoans(user);
    },

    get: async function(id, user) {
        return await loanManager.get(id, user)
    },

    // modify

    // delete also delete loan agent
    
};

module.exports = loans;
