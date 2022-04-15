const Loan = require('../../models/loanModel');

async function checkForExpiringLoans() {
    const today = new Date().toLocaleDateString();

    const loans = await Loan.find( { active: true, expectedEndDate: today } );

    if(loans.length > 0) {
        loans.forEach(async (loan) => {
            loan.status = 'completed';
            loan.active = false;

            await loan.save();
        });

        
    }
}

module.exports = checkForExpiringLoans;
