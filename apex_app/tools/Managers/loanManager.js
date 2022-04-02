const _ = require('lodash');
const debug = require('debug')('app:loanMgr')
const Loan = require('../../models/loanModel');
const userViewController = require('../../controllers/userController');
const customerViewController = require('../../controllers/customerController');
const pickRandomCreditUser = require('../../utils/pickRandomAgent');

const manager = {
    createLoan: async function(request) {
        try{
            const customer = await customerViewController.get(request.body.customer, request.user);
            if(customer instanceof Error) throw customer;

            // Find the loan agent
            const agent = await userViewController.get( { _id: customer.loanAgent.id, active: true, segments: customer.employmentInfo.segment } );
            if(!agent) {
                debug(agent);
                throw new Error('Invalid loan agent.');
            };

            const creditOfficer = await pickRandomCreditUser('credit', customer.employmentInfo.segment);
            if(!creditOfficer){
                debug(creditOfficer);
                throw new Error('Could not assign credit officer.');
            };

            request.body.loanAgent = agent._id;
            request.body.creditOfficer = creditOfficer._id;
            const newLoan =  new Loan(request.body);
            
            // await customer.save();
            await newLoan.save();

            return newLoan;

        }catch(exception) {
            return exception;
        };
    },

    // TODO: Come back to loan manager
    createLoanRequest: async function(request) {
        try{          
            const customerExists = await customerViewController.get( request.body.employmentInfo.ippis, request.user );   
            if(!customerExists.message && !customerExists.stack) {
                let agent = await userViewController.get( { _id: customerExists.loanAgent.id, active: true, segments: request.body.employmentInfo.segment } );
                if(!agent && request.body.loanAgent) agent = await userViewController.get( { _id: request.body.loanAgent, active: true, segments: request.body.employmentInfo.segment } );
                if(!agent) throw new Error ('Invalid loan agent.');

                // Picking credit officer
                let creditOfficer = await pickRandomCreditUser('credit', customerExists.employmentInfo.segment);
                if(!creditOfficer){
                    debug(creditOfficer);
                    throw new Error('Could not assign credit officer.');
                };

                // TODO: Make this a transaction
                request.body.loan.customer = customerExists._id;
                request.body.loan.loanAgent = agent._id;
                request.body.loan.creditOfficer = creditOfficer._id;
                const newLoan = await Loan.create(request.body.loan);
                
                // Updating the customer loans and loan agent.
                if(!customerExists.loanAgent.id !== agent._id) {
                    customerExists.loanAgent.id = agent._id;
                    customerExists.loanAgent.firstName = agent.name.firstName;
                    customerExists.loanAgent.lastName = agent.name.lastName;
                    customerExists.loanAgent.phone = agent.phone;
                };

                await customerExists.save();
                
                return newLoan;
            };

            //NEW CUSTOMER
            const newCustomer = await customerViewController.create( _.omit(request, ['body.loan']) );
            if(newCustomer instanceof Error) throw newCustomer;

            // Picking credit officer
            creditOfficer = await pickRandomCreditUser('credit', request.body.employmentInfo.segment);
            if(!creditOfficer){
                debug(creditOfficer);
                throw new Error('Could not assign credit officer.');
            };

            // creating customer loan.
            request.body.loan.customer = newCustomer._id;
            request.body.loan.loanAgent = newCustomer.loanAgent.id;
            request.body.creditOfficer = creditOfficer._id;
            await Loan.create(request.body.loan);
            
            await newCustomer.save();

            return Loan;

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
                loan = await Loan.findOneAndUpdate({ _id: request.params.id, loanAgent: request.user.id },
                    request.body, {new: true});
                // await loan.updateOne(request.body, {new: true});
                if('amount' in request.body) loan.set('recommendedAmount', request.body.amount);
                if('tenor' in request.body) loan.set('recommendedTenor', request.body.tenor);
                
                await loan.save();

            }else{
                    loan = await Loan.findByIdAndUpdate( 
                    request.params.id, request.body, {new: true} );
                    if('amount' in request.body) loan.set('recommendedAmount', request.body.amount);
                    if('tenor' in request.body) loan.set('recommendedTenor', request.body.tenor);
                    
                    await loan.save();
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
