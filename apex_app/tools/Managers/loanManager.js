const _ = require('lodash');
const debug = require('debug')('app:loanMgr')
const Loan = require('../../models/loanModel');
const User = require('../../models/userModel');
const Customer = require('../../models/customerModel');
const pickRandomAgent = require('../../utils/pickRandomAgent');
const userViewController = require('../../controllers/userController');
const customerViewController = require('../../controllers/customerController');

const manager = {
    createLoan: async function(request) {
        try{
            const customer = await customerViewController.get(request.body.customer, request.user);
            if(customer instanceof Error) throw new Error(customer.message);

            // Find the loan agent
            const agent = await userViewController.get( { _id: customer.loanAgent, active: true, segments: customer.segment } );
            if(agent instanceof Error) {
                debug(agent);
                throw new Error('Invalid loan agent.');
            };

            const newLoan =  new Loan(request.body);
            
            // Updating customer loans
            customer.loans.push(newLoan._id);
            // if(customer.loanAgent !== agent._id) customer.loanAgent = agent._id;
            
            // Updating loan agent customers.
            if(!agent.customers.includes(customer._id)) agent.customers.push(customer._id);
            agent.loans.push(newLoan._id);
            
            await customer.save();
            await agent.save();
            await newLoan.save();

            return newLoan;

        }catch(exception) {
            return exception;
        };
    },

    // TODO: Come back to loan manager
    createLoanRequest: async function(requestBody) {
        try{          
            const customerExists = await Customer.findOne( {ippis: requestBody.ippis} );
            if(customerExists) {
                const agent = await User.findOne(requestBody.loanAgent ? { _id: requestBody.loanAgent, active: true, segments: requestBody.segment } : { _id: customerExists.loanAgent } );
                if (!agent) throw new Error ('Agent does not exist or inactive.');
                if (!agent.customers.includes(customerExists._id)) agent.customers.push(customerExists._id);
                            
                // TODO: Make this a transaction
                requestBody.loan.customer = customerExists._id;
                requestBody.loan.loanAgent = agent._id;
                const newLoan = await Loan.create(requestBody.loan);
                
                // Updating loanAgent loans array.
                agent.loans.push(newLoan._id);
                
                // Updating the customer loans and loan agent.
                customerExists.loans.push(newLoan._id);
                if (!customerExists.loanAgent !== agent._id) customerExists.loanAgent = agent._id;
                
                await agent.save();
                await customerExists.save();
                
                return newLoan;
            };

            //NEW CUSTOMER
            const result = customerViewController.create( _.omit(requestBody, ['loan']) );
            if(result instanceof Error) throw result;

            const { newCustomer, agent } = result;
            
            // creating customer loan.
            requestBody.loan.customer = newCustomer._id;
            requestBody.loan.loanAgent = newCustomer.loanAgent;
            const newLoan = await Loan.create(requestBody.loan);
            
            // Updating loan agent array with new loan.
            agent.loans.push(newLoan._id);

            // Updating new customer loans.
            newCustomer.loans.push(newLoan._id);
            
            await newCustomer.save();
            await agent.save();

            return newCustomer;

        }catch(exception) {
            return exception;
        };
    },

    getAllLoans: async function(user) {
        if(user.role !== 'loanAgent') {
            const loans = await Loan.find()
                                        .populate('loanAgent')
                                        .sort('_id');
            
            return loans;
        };

        const loans = await Loan.find( { loanAgent: user.id } )
                                .populate('loanAgent')
                                .sort('_id');
            
        return loans; 
    },

    get: async function(id, user) {
        try{
            if(user.role !== 'loanAgent') {
                const loan = await Loan.findById(id).populate('customer');
                if(!loan) throw new Error('Loan not found.');
    
                return loan;
            };
            const loan = await Loan.findOne( {_id: id, loanAgent:user.id })
                                   .populate('customer');
            if(!loan) throw new Error('Loan not found.');
    
            return loan;

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