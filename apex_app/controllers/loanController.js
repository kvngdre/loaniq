const loanManager = require('../tools/loanManager/loanManager');


const loans = {
    createLoan: async function(requestBody) {
        const loanRequest = await loanManager.createLoanRequest(requestBody);
        return loanRequest;
    },

    getAll: async function() {
        const loans = await loanManager.getAllLoans();

        // if (loans instanceof Error) return loanRequest;

        return loans;
    }
};

module.exports = loans;
