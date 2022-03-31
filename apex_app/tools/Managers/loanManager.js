const _ = require('lodash');
const debug = require('debug')('app:loanMgr')
const Loan = require('../../models/loanModel');
const Customer = require('../../models/customerModel');
const userViewController = require('../../controllers/userController');
const customerViewController = require('../../controllers/customerController');

const manager = {
    createLoan: async function(request) {
        try{
            const customer = await customerViewController.get(request.body.customer, request.user);
            if(customer instanceof Error) throw new Error('Customer not found');

            // Find the loan agent
            const agent = await userViewController.get( { _id: customer.loanAgent.id, active: true, segments: customer.employmentInfo.segment } );
            if(agent instanceof Error) {
                debug(agent);
                throw new Error('Invalid loan agent.');
            };

            request.body.loanAgent = agent._id;
            const newLoan =  new Loan(request.body);

            
            // Updating customer loans
            customer.loans.push(newLoan._id);
            
            // Updating loanAgent's customers and loans.
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
    createLoanRequest: async function(request) {
        try{          
            const customerExists = await Customer.findOne( { ippis: request.body.employmentInfo.ippis } );
            if(customerExists) {
                let agent = await userViewController.get( {_id: customerExists.loanAgent.id, active: true, segments: request.body.employmentInfo.segment} );
                if(!agent && request.body.loanAgent) agent = await userViewController.get( { _id: request.body.loanAgent, active: true, segments: request.body.employmentInfo.segment } );
                if (!agent) throw new Error ('Invalid loan Agent');
                            
                // TODO: Make this a transaction
                request.body.loan.customer = customerExists._id;
                request.body.loan.loanAgent = agent._id;
                const newLoan = await Loan.create(request.body.loan);
                
                // Updating loanAgent's customers and loans array.
                agent.loans.push(newLoan._id);
                if (!agent.customers.includes(customerExists._id)) agent.customers.push(customerExists._id);
                
                // Updating the customer loans and loan agent.
                customerExists.loans.push(newLoan._id);
                if (!customerExists.loanAgent.id !== agent._id) {
                    customerExists.loanAgent.id = agent._id;
                    customerExists.loanAgent.firstName = agent.firstName;
                    customerExists.loanAgent.lastName = agent.lastName;
                };

                await agent.save();
                await customerExists.save();
                
                return newLoan;
            };

            //NEW CUSTOMER
            const result = await customerViewController.create( _.omit(request, ['body.loan']) );
            if(result instanceof Error) throw result;

            const { newCustomer, agent } = result;
            
            // creating customer loan.
            request.body.loan.customer = newCustomer._id;
            request.body.loan.loanAgent = newCustomer.loanAgent;
            const newLoan = await Loan.create(request.body.loan);
            
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

    getAllLoans: async function(user, queryParams) {
        if(user.role !== 'loanAgent') {
            const loans = await Loan.find(queryParams)
                                        // .populate('loanAgent')
                                        .select( { _id: 1, amount: 1, createdAt: 1, loanAgent: 1 } )
                                        .sort( { createdAt: -1 } );
            
            return loans;
        };

        const loans = await Loan.find( { loanAgent: user.id } )
                                .populate('loanAgent')
                                .sort('_id');
            
        return loans; 
    },

    get: async function(id, user) {
        if(user.role !== 'loanAgent') {
            const loan = await Loan.findById(id).populate('customer');

            return loan;
        };

        const loan = await Loan.findOne( {_id: id, loanAgent:user.id })
                                .populate('customer');

        return loan;
    },

    edit: async function(request) {
        try{
            let loan;
            if(request.user.role === 'loanAgent'){
                console.log('the boy here')
                loan = await Loan.findOneAndUpdate({ _id: request.params.id, loanAgent: request.user.id },
                    request.body, {new: true});
                // await loan.updateOne(request.body, {new: true});
                if('amount' in request.body) loan.set('recommendedAmount', request.body.amount);
                if('tenor' in request.body) loan.set('recommendedTenor', request.body.tenor);
                
                await loan.save();

            }else{
                    loan = await Loan.findByIdAndUpdate( 
                    request.params.id, request.body, {new: true} );
            };
            
            if(!loan) {
                debug(loan);
                throw new Error('loan not found.');
            };

            return loan;

        }catch(exception) {
            return exception;
        };
    }

};

module.exports = manager;
