const loans = require('../../controllers/loanController');
const Customer = require('../../models/customerModel');
const Loan = require('../../models/loanModel');
const _ = require('lodash');

const manager = {
    // TODO: Come back to loan manager
    createLoanRequest: async function(requestBody) {
        // create customer then loan and save.
        try{
            const customer = await Customer.findOne( {ippis: requestBody.ippis} );
            // if customer exists
            if(customer) {
                // requestBody.loanRequest expecting ab obj
                requestBody.loan.ippis = requestBody.ippis;
                const loan = new Loan(requestBody.loan);
                await loan.save();

                customer.loans.push(loan._id);
                
                await customer.save();

                return customer;
            };

            const customerLoan = new Loan(requestBody.loan);
            // customerLoan.ippis = requestBody.ippis;
            await customerLoan.save();

            const newCustomer = new Customer(_.omit(requestBody, ['loan']));
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
            // TODO: implement sort the loans.

            if (!customers) throw new Error('No customers.')

            return customers;
        }catch(exception) {
            return exception;
        };
    }
};

module.exports = manager;