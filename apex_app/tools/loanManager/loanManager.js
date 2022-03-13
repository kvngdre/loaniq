const _ = require('lodash');
const Loan = require('../../models/loanModel');
const Customer = require('../../models/customerModel');

const manager = {
    // TODO: Come back to loan manager
    createLoanRequest: async function(requestBody) {
        try{
            requestBody.loan.ippis = requestBody.ippis;

            const customerExists = await Customer.findOne( {ippis: requestBody.ippis} );
            if(customerExists) {
                const newLoan = await Loan.create(requestBody.loan);

                customerExists.loans.push(newLoan._id);
                await customerExists.save();

                return newLoan;
            };

            // TODO: Make this a transaction
            const customerLoan = await Loan.create(requestBody.loan);
            
            // Tie customer and loan
            const newCustomer = new Customer( _.omit(requestBody, ['loan']) );
            newCustomer.loans.push(customerLoan._id);
            await newCustomer.save();

            return newCustomer;

        }catch(exception) {
            return exception;
        };

    },

    getAllLoans: async function() {
        try{
            const customers = Customer.find()
                                      .populate(['companyName', 'bankName', 'loans'])
                                      .select(['firstName', 'companyName'])
            // TODO: implement sort the loans.

            if (!customers) throw new Error('No customers.')

            return customers;
            
        }catch(exception) {
            return exception;
        };
    },

    updateLoanStatus: async function(requestBody) {
        try {
            const customer = loan.findOne( {ippis: requestBody} );
            const loans = Loan.find( {ippis: requestBody.ippis} );
            if(!customer || loans.length === 0) throw new Error('Customer does not exist or no loans.')
        }catch(exception) {
            return exception;
        };

    }
};

module.exports = manager;