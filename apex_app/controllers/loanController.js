const loanManager = require('../tools/Managers/loanManager');


const loans = {
    createLoanRequest: async function(request) {
        return await loanManager.createLoanRequest(request);
    },

    createLoan: async function(request) {
        return await loanManager.createLoan(request);
    },

    getAll: async function(user, queryParam) {
        return await loanManager.getAllLoans(user);
    },

    get: async function(id, user) {
        return await loanManager.get(id, user)
    },

    edit: async function(request) {
        return await loanManager.edit(request);
    }
    
};

module.exports = loans;
