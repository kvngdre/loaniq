require('dotenv').config();
const _ = require('lodash');
const debug = require('debug')('app:loanMgr')
const Bank = require('../../models/bankModel');
const Loan = require('../../models/loanModel');
const Customer = require('../../models/customerModel');
const pickRandomUser = require('../../utils/pickRandomAgent');
const userViewController = require('../../controllers/userController');
const convertToDotNotation = require('../../utils/convertToDotNotation');
const customerViewController = require('../../controllers/customerController');


const manager = {
    createLoan: async function(customer, loanMetricsObj, request) {
        try{
            const loan = await Loan.find( { customer: customer._id, lenderId: request.user.lenderId, active: true } )
                                   .sort( { createdAt: -1 } )
                                   .limit(1);
            
            let agent
            if(loan.length === 0) {
                agent = await pickRandomUser(request.user.lenderId, 'loanAgent', customer.employmentInfo.segment);
            }else{
                agent = await userViewController.get( { _id: loan[0].loanAgent } );
                request.body.loanType = "topUp";
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
            request.body.interestRate = loanMetricsObj.interestRate;
            request.body.upfrontFeePercentage = loanMetricsObj.upfrontFeePercentage;
            request.body.transferFee = loanMetricsObj.transferFee;
            request.body.validationParams = {dob: customer.dateOfBirth};
            request.body.validationParams.doe = customer.employmentInfo.dateOfEnlistment;
            request.body.validationParams.minNetPay = loanMetricsObj.minNetPay;
            request.body.validationParams.dtiThreshold = loanMetricsObj.dtiThreshold;
            
            const newLoan = await Loan.create(request.body);

            return newLoan;

        }catch(exception) {
            return exception;
        };
    },

    // TODO: write func for validating ippis 
    createLoanRequest: async function(loanMetricsObj, request) {
        try{
            if(request.user.role === 'guest') {
                const lender = await Lender.findOne( {slug: request.body.slug} );
                request.user.lenderId = lender._id;
            };

            let customer;
            customer = await customerViewController.get(request.user, { 'employmentInfo.ippis': request.body.employmentInfo.ippis } );   
            if(customer.message && customer.stack) {
                // if customer does not exist.
                customer = await customerViewController.create( _.omit(request, ['body.loan']) );
                if(customer instanceof Error) throw customer;
            };

            const loan = await Loan.find( { customer: customer._id, lenderId: request.user.lenderId } )
                                    .sort( { createdAt: -1 } )
                                    .limit(1);
            
            let agent;
            if(loan.length === 0) {
                agent = await pickRandomUser(request.user.lenderId, 'loanAgent', customer.employmentInfo.segment)
            }else{
                agent = await userViewController.get( { _id: loan[0].loanAgent } );
                request.body.loan.loanType = "topUp";
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
            request.body.loan.lenderId = request.user.lenderId;
            request.body.loan.customer = customer._id;
            request.body.loan.loanAgent = agent._id;
            request.body.loan.creditOfficer = creditOfficer._id;
            request.body.loan.interestRate = loanMetricsObj.interestRate;
            request.body.loan.upfrontFeePercentage = loanMetricsObj.upfrontFeePercentage;
            request.body.loan.transferFee = loanMetricsObj.transferFee;
            request.body.loan.validationParams = {dob: customer.dateOfBirth};
            request.body.loan.validationParams.doe = customer.employmentInfo.dateOfEnlistment;
            request.body.loan.validationParams.minNetPay = loanMetricsObj.minNetPay;
            request.body.loan.validationParams.dtiThreshold = loanMetricsObj.dtiThreshold;            
            
            const newLoan = await Loan.create(request.body.loan);
            
            await newLoan.save();
            
            return {customer, loan: newLoan};

        }catch(exception) {
            return exception;
        };
    },

    getAll: async function(user, queryParam={}) {
        console.log(user.lenderId)
        queryParam.lenderId = user.lenderId;

        if(user.role !== 'loanAgent') {
            const loans = await Loan.find( queryParam )
                                    .select('_id status amount recommendedAmount tenor recommendedTenor customer createdAt netPay dateAppOrDec lenderId')
                                    .select('-lenderId')
                                    .populate({path: 'customer', model: Customer, select: 'name employmentInfo.ippis'})
                                    .sort( { createdAt: -1 } );
            
            return loans;
        };

        queryParam.loanAgent = user.id
        const loans = await Loan.find( queryParam )
                                .sort('_id');
            
        return loans; 
    },

    getDisbursement: async function(user, queryParam={}) {
        queryParam.lenderId = user.lenderId;

        if(user.role !== 'loanAgent') {
            const loans = await Loan.find( queryParam )
                                    .select('_id customer recommendedAmount recommendedTenor interestRate repayment netPay upfrontFee transferFee netValue totalRepayment metrics.debtToIncomeRatio.value status createdAt dateAppOrDec lenderId')
                                    .populate({path: 'customer', model: Customer, populate:[{path:'accountInfo.bank', model: Bank, select: '-_id name'}], select: '-_id bvn employmentInfo.ippis accountInfo'})                                    
                                    .sort({createdAt: -1});
            
            return loans;
        };

        queryParam.loanAgent = user.id
        const loans = await Loan.find( queryParam )
                                .sort('_id');
            
        return loans; 
    },

    getOne: async function(user, queryParam) {
        queryParam.lenderId = user.lenderId;
        console.log('manager=======', queryParam);
        if(user.role !== 'loanAgent') {
            const loan = await Loan.findOne( queryParam )
                                   .populate({path: 'customer', model: Customer});

            return loan;
        };

        queryParam.loanAgent = user.id;
        const loan = await Loan.findOne( queryParam )
                               .populate({path: 'customer', model: Customer});

        return loan;
    },

    edit: async function(request) {
        try{ 
            request.body = convertToDotNotation(request.body);

            let loan;
            if(request.user.role === 'loanAgent'){

                loan = await Loan.findOne( { 
                    _id: request.params.id, 
                    loanAgent: request.user.id, 
                    lenderId: request.user.lenderId 
                } );

                if(!loan) {
                    debug(loan);
                    throw new Error('loan not found.');
                };

                loan.set(request.body);
                if('amount' in request.body) loan.set('recommendedAmount', request.body.amount);
                if('tenor' in request.body) loan.set('recommendedTenor', request.body.tenor);
                
                await loan.save();

            } else {

                loan = await Loan.findOne( { 
                    _id: request.params.id, 
                    lenderId: request.user.lenderId 
                } );

                if(!loan) {
                    debug(loan);
                    throw new Error('loan not found.');
                };

                loan.set(request.body);
                if('amount' in request.body) loan.set('recommendedAmount', request.body.amount);
                if('tenor' in request.body) loan.set('recommendedTenor', request.body.tenor);
                
                if(request.body.status && ['approved', 'declined'].includes(request.body.status)) {
                    loan.set('dateAppOrDec', Date.now());
                };
                
                await loan.save();
            };
            return loan;

        }catch(exception) {
            debug(exception);
            return exception;
        };
    }
};

module.exports = manager;
