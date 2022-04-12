const loanManager = require('../tools/Managers/loanManager');


const loans = {
    createLoanRequest: async function(request) {
        return await loanManager.createLoanRequest(request);
    },

    createLoan: async function(request) {
        return await loanManager.createLoan(request);
    },

    getAll: async function(user) {
        return await loanManager.getAll(user);
    },

    getOne: async function(id, user) {
        return await loanManager.getOne(id, user)
    },

    edit: async function(request) {
        return await loanManager.edit(request);
    }
    
};

module.exports = loans;
