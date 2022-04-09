const _ = require('lodash');
const debug = require('debug')('app:loanMgr')
const Loan = require('../../models/loanModel');
const Metrics = require('../../tools/Managers/loanMetricsEval');
const pickRandomCreditUser = require('../../utils/pickRandomAgent');
const userViewController = require('../../controllers/userController');
const customerViewController = require('../../controllers/customerController');

const metrics = new Metrics();

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

            // setting loan metrics
            newLoan.upfrontFee = metrics.calcUpfrontFee(newLoan.recommendedAmount, newLoan.upfrontFeePercentage);
            newLoan.repayment = metrics.calcRepayment(newLoan.recommendedAmount, newLoan.interestRate, newLoan.recommendedTenor);
            newLoan.totalRepayment = metrics.calcTotalRepayment(newLoan.repayment, newLoan.recommendedTenor);
            newLoan.netValue = metrics.calcNetValue(newLoan.recommendedAmount, newLoan.upfrontFee, newLoan.transferFee);

            // setting validation metics
            newLoan.metrics.ageValid = metrics.ageValidator(customer.dateOfBirth);
            newLoan.metrics.serviceLengthValid = metrics.serviceLengthValidator(customer.employmentInfo.dateOfEnlistment);
            newLoan.metrics.netPayValid = metrics.netPayValidator(customer.netPay);
            newLoan.metrics.debtToIncomeRatio = metrics.dtiRatioCalculator(newLoan.repayment, customer.netPay);
                        
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
            // If customer exists  
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
                const newLoan = new Loan(request.body.loan);
                
                // setting loan metrics
                newLoan.upfrontFee = metrics.calcUpfrontFee(newLoan.recommendedAmount, newLoan.upfrontFeePercentage);
                newLoan.repayment = metrics.calcRepayment(newLoan.recommendedAmount, newLoan.interestRate, newLoan.recommendedTenor);
                newLoan.totalRepayment = metrics.calcTotalRepayment(newLoan.repayment, newLoan.recommendedTenor);
                newLoan.netValue = metrics.calcNetValue(newLoan.recommendedAmount, newLoan.upfrontFee, newLoan.transferFee);

                // setting validation metics
                newLoan.metrics.ageValid = metrics.ageValidator(customerExists.dateOfBirth);
                newLoan.metrics.serviceLengthValid = metrics.serviceLengthValidator(customerExists.employmentInfo.dateOfEnlistment);
                newLoan.metrics.netPayValid = metrics.netPayValidator(customerExists.netPay);
                newLoan.metrics.debtToIncomeRatio = metrics.dtiRatioCalculator(newLoan.repayment, customerExists.netPay);
                        
                // Updating the customer loans and loan agent.
                if(!customerExists.loanAgent.id !== agent._id) {
                    customerExists.loanAgent.id = agent._id;
                    customerExists.loanAgent.firstName = agent.name.firstName;
                    customerExists.loanAgent.lastName = agent.name.lastName;
                    customerExists.loanAgent.phone = agent.phone;
                };

                await newLoan.save();
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
            request.body.loan.creditOfficer = creditOfficer._id;
            const newLoan = new Loan(request.body.loan);

            // setting loan metrics
            newLoan.upfrontFee = metrics.calcUpfrontFee(newLoan.recommendedAmount, newLoan.upfrontFeePercentage);
            newLoan.repayment = metrics.calcRepayment(newLoan.recommendedAmount, newLoan.interestRate, newLoan.recommendedTenor);
            newLoan.totalRepayment = metrics.calcTotalRepayment(newLoan.repayment, newLoan.recommendedTenor);
            newLoan.netValue = metrics.calcNetValue(newLoan.recommendedAmount, newLoan.upfrontFee, newLoan.transferFee);

            // setting validation metics
            newLoan.metrics.ageValid = metrics.ageValidator(newCustomer.dateOfBirth);
            newLoan.metrics.serviceLengthValid = metrics.serviceLengthValidator(newCustomer.employmentInfo.dateOfEnlistment);
            newLoan.metrics.netPayValid = metrics.netPayValidator(newCustomer.netPay);
            newLoan.metrics.debtToIncomeRatio = metrics.dtiRatioCalculator(newLoan.repayment, newCustomer.netPay);
            
            await newLoan.save();
            await newCustomer.save();

            newCustomer.loan = newLoan;
            
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
                loan = await Loan.findOneAndUpdate({ _id: request.params.id, loanAgent: request.user.id },
                    request.body, {new: true});
                if(!loan) {
                    debug(loan);
                    throw new Error('loan not found.');
                };

                if('amount' in request.body) loan.set('recommendedAmount', request.body.amount);
                if('tenor' in request.body) loan.set('recommendedTenor', request.body.tenor);
                
                await loan.save();

            } else {
                loan = await Loan.findByIdAndUpdate( 
                request.params.id, request.body, {new: true} );
                if(!loan) {
                    debug(loan);
                    throw new Error('loan not found.');
                };

                if('amount' in request.body) loan.set('recommendedAmount', request.body.amount);
                if('tenor' in request.body) loan.set('recommendedTenor', request.body.tenor);
                
                if(request.body.status && ['approved', 'declined'].includes(request.body.status)) {
                    loan.set('dateAppOrDec', Date.now());
                };
                
                await loan.save();
            };
            
            return loan;

        }catch(exception) {
            return exception;
        };
    }

};

module.exports = manager;
