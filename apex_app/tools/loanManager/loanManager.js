const loans = require('../../controllers/loanController');
const Customer = require('../../models/customerModel');
const Loan = require('../../models/loanModel');
const _ = require('lodash');

const manager = {
    // TODO: Come back to loan manager
    createLoanRequest: async function(requestBody) {
        // create customer then loan and save.
        try{
            const doesExist = await Customer.findOne( {ippis: requestBody.ippis} ).exec();
            
            // if customer exists
            if(doesExist) {
                requestBody.loan.ippis = requestBody.ippis;
                const newLoan = new Loan(requestBody.loan);
                await newLoan.save();

                doesExist.loans.push(newLoan._id);
                
                await doesExist.save();

                return newLoan;
            };

            const newCustomer = new Customer(_.omit(requestBody, ['loan']));
            
            // Create customer loan
            const customerLoan = new Loan(requestBody.loan);
            customerLoan.ippis = requestBody.ippis;
            await customerLoan.save();

            // Tie customer and loan
            newCustomer.loans.push(customerLoan._id);
            
            await newCustomer.save();

            return newCustomer;

        }catch(exception) {
            console.log(exception.message);
            return exception;
        };

    },

    getAllLoans: async function() {
        try{
            const customers = Customer.find()
                                      .populate(['companyName', 'loans'])
                                      .select(['firstName', 'companyName'])
            // TODO: implement sort the loans.

            if (!customers) throw new Error('No customers.')

            return customers;
            
        }catch(exception) {
            return exception;
        };
    }
};

module.exports = manager;