const _ = require('lodash');
const Loan = require('../../models/loanModel');
const User = require('../../models/userModel');
const Customer = require('../../models/customerModel');
const pickRandomAgent = require('../../utils/pickRandomAgent');

const manager = {
    // TODO: Come back to loan manager
    createLoanRequest: async function(requestBody) {
        try{
            // If no loan agent, pick on at random
            if(!requestBody.loan.agent) requestBody.loan.agent = await pickRandomAgent(requestBody.companyName);
            
            requestBody.loan.ippis = requestBody.ippis;

            const customerExists = await Customer.findOne( {ippis: requestBody.ippis} );
            if(customerExists) {
                

                // TODO: Make this a transaction
                const newLoan = await Loan.create(requestBody.loan);
                newLoan.customer = customerExists._id;
                
                // Map loan request to agent
                const agent = await User.findById(requestBody.loan.agent);
                if (!agent) throw new Error ('Agent does not exist.');

                agent.loans.push(newLoan._id);
                await agent.save();

                customerExists.loans.push(newLoan._id);
                await customerExists.save();
                
                return newLoan;
            };

            // TODO: Make this a transaction
            const customerLoan = await Loan.create(requestBody.loan);

            // Map loan agent and loan request
            const agent = await User.findById(requestBody.loan.agent);
                if (!agent) throw new Error ('Agent does not exist.');
                agent.loans.push(customerLoan._id);
                await agent.save();
            
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
            const loans = await Loan.find()
                                  .populate(['agent'])
                                  .sort('_id');
            // TODO: implement sort the loans.
            if(!loans) throw new Error('No customers.');

            return loans;
            
        }catch(exception) {
            return exception;
        };
    },

    getOne: async function(requestBody) {
        try{
                const doesExist = await Loan.findOne( {_id: requestBody.params.id} ).populate('customer');
                if(!doesExist) throw new Error('Loan does not exist.');

                return doesExist;

        }catch(exception) {
            return exception;
        };
    },

    updateLoanStatus: async function(requestBody) {
        try {
            // TODO: come back to update loan status
            const customer = Loan.findOne( {ippis: requestBody} );
            const loans = Loan.find( {ippis: requestBody.ippis} );
            if(!customer || loans.length === 0) throw new Error('Customer does not exist or no loans.');

        }catch(exception) {
            return exception;
        };

    }
};

module.exports = manager;