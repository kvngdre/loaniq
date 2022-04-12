const _ = require('lodash');
const debug = require('debug')('app:loanMgr')
const Loan = require('../../models/loanModel');
const ObjectId = require('mongoose').Types.ObjectId;
const Metrics = require('../../tools/Managers/loanMetricsEval');
const pickRandomUser = require('../../utils/pickRandomAgent');
const userViewController = require('../../controllers/userController');
const customerViewController = require('../../controllers/customerController');

const metrics = new Metrics();

const manager = {
    createLoan: async function(request) {
        try{
            const customer = await customerViewController.get( request.user, ObjectId.isValid(request.body.customer) ? { _id: request.body.customer } : {'employmentInfo.ippis': request.body.customer} );
            if(customer instanceof Error) throw customer;

            // Find the loan agent
            const loan = await Loan.find( { customer: customer._id, lenderId: request.user.lenderId } )
                                   .sort( { createdAt: -1 } )
                                   .limit(1);
            
            let agent
            if(loan.length === 0) {
                agent = await pickRandomUser(request.user.lenderId, 'loanAgent', customer.employmentInfo.segment)
            }else{
                agent = await userViewController.get(loan.loanAgent);
            };
            
            if(!agent) {
                debug(agent);
                throw new Error('Invalid loan agent.');
            };

            const creditOfficer = await pickRandomUser(request.user.lenderId, 'credit', customer.employmentInfo.segment);
            if(!creditOfficer){
                debug(creditOfficer);
                throw new Error('Could not assign credit officer.');
            };

            request.body.lenderId = request.user.lenderId;
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

    // TODO: write func for validating ippis 
    createLoanRequest: async function(request) {
        try{
            const customer = await customerViewController.get( request.body.employmentInfo.ippis, request.user );   
            // If customer exists  
            if(!customer.message && !customer.stack) {
                const loan = await Loan.find( { customer: customer._id, lenderId: request.user.lenderId } )
                                       .sort( { createdAt: -1 } )
                                       .limit(1);
                
                let agent;
                if(loan.length === 0) {
                    agent = await pickRandomUser(request.user.lenderId, 'loanAgent', customer.employmentInfo.segment)
                }else{
                    agent = await userViewController.get(loan.loanAgent);
                };
                
                if(!agent) {
                    debug(agent);
                    throw new Error('Invalid loan agent.');
                };

                // Picking credit officer
                let creditOfficer = await pickRandomUser(request.user.lenderId, 'credit', customer.employmentInfo.segment);
                if(!creditOfficer){
                    debug(creditOfficer);
                    throw new Error('Could not assign credit officer.');
                };

                // TODO: Make this a transaction
                request.body.lenderId = request.user.lenderId;
                request.body.loan.customer = customer._id;
                request.body.loan.loanAgent = agent._id;
                request.body.loan.creditOfficer = creditOfficer._id;
                const newLoan = new Loan(request.body.loan);
                
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

                await newLoan.save();
                
                return newLoan;
            };

            //NEW CUSTOMER
            const newCustomer = await customerViewController.create( _.omit(request, ['body.loan']) );
            if(newCustomer instanceof Error) throw newCustomer;

            // Picking credit officer
            creditOfficer = await pickRandomUser('credit', request.body.employmentInfo.segment);
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
