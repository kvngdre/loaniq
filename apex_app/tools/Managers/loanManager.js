const _ = require('lodash');
const debug = require('debug')('app:loanMgr');
const Bank = require('../../models/bankModel');
const Loan = require('../../models/loanModel');
const Origin = require('../../models/originModel');
const Customer = require('../../models/customerModel');
const pickRandomUser = require('../../utils/pickRandomAgent');
const userController = require('../../controllers/userController');
const convertToDotNotation = require('../../utils/convertToDotNotation');
const customerController = require('../../controllers/customerController');
const PendingEditController = require('../../controllers/pendingEditController');


const manager = {
  createLoan: async function (customer, loanMetricsObj, request) {
    try{
        const customerOrigin = await Origin.findOne( { ippis: customer.employmentInfo.ippis } );
        if(customerOrigin) {
            customer.set({
            'netPay.value': customerOrigin.netPays[0] || request.body.netPay,
            'netPay.updatedAt': new Date().toISOString()
            });
            request.body.netPay = customer.netPay.value;
        }

        const loans = await Loan.find( { customer: customer._id, lenderId: request.user.lenderId, active: true } )
                                .sort({ createdAt: -1 })
                                .limit(1);
        if(loans.length > 0) request.body.loanType = 'topUp';

        let agent;
        if(request.user.role === 'Loan Agent') {
            agent = await userController.get({
                _id: request.user.id,
                lenderId: request.user.lenderId,
                segments: customer.employmentInfo.segment
            });
        }

        if(loans.length === 0) {
            agent = await pickRandomUser(request.user.lenderId, 'Loan Agent', customer.employmentInfo.segment);
        }else{ agent = await userController.get( { _id: loans[0].loanAgent } ) }

        if(!agent || agent instanceof Error) throw new Error('Invalid loan agent');

        const creditOfficer = await pickRandomUser(request.user.lenderId, 'Credit', customer.employmentInfo.segment);
        if(!creditOfficer) throw new Error('Could not assign credit officer');

        request.body.loanAgent = agent._id;
        request.body.netPay = customer.netPay.value;
        request.body.lenderId = request.user.lenderId;
        request.body.creditOfficer = creditOfficer._id;
        request.body.transferFee = loanMetricsObj.transferFee;
        request.body.interestRate = loanMetricsObj.interestRate;
        request.body.validationParams = { dob: customer.dateOfBirth };
        request.body.validationParams.minNetPay = loanMetricsObj.minNetPay;
        request.body.upfrontFeePercentage = loanMetricsObj.upfrontFeePercentage;
        request.body.validationParams.dtiThreshold = loanMetricsObj.dtiThreshold;
        request.body.validationParams.doe = customer.employmentInfo.dateOfEnlistment;

        const newLoan = await Loan.create(request.body);
        await customer.save();

        return newLoan;

    }catch(exception) {
        debug(exception);
        return exception;
    }
  },

  createLoanRequest: async function (loanMetricsObj, request) {
    try{
        let customer = await customerController.getOne( { 'employmentInfo.ippis': request.body.employmentInfo.ippis } );
        if(customer instanceof Error) {
            // If customer is an error obj i.e. not found, create new customer
            customer = new Customer(_.omit(request.body, ['loan']));
            customer.validateSegment();
        }

        const customerInOrigin = await Origin.findOne( { ippis: customer.employmentInfo.ippis } );
        if(customerInOrigin) {
            customer.set({
                'netPay.value': customerInOrigin.netPays[0] || request.body.netPay,
                'netPay.updatedAt': new Date().toISOString()
            });
            request.body.loan.netPay = customer.netPay.value;
        }

        const loans = await Loan.find( { customer: customer._id, lenderId: request.user.lenderId } )
                                .sort({ createdAt: -1 })
                                .limit(1);

        if (loans.length > 0) request.body.loanType = 'topUp';

        let agent;
        if (request.user.role === 'Loan Agent') {
            agent = await userController.get({
                _id: request.user.id,
                lenderId: request.user.lenderId,
                segments: customer.employmentInfo.segment
            });
        }

        if(!agent && loans.length === 0) {
            agent = await pickRandomUser(request.user.lenderId, 'Loan Agent', customer.employmentInfo.segment);
        }else if(!agent) { agent = await userController.get( { _id: loans[0].loanAgent } ) }

        if(!agent) throw new Error('Invalid loan agent');

        let creditOfficer = await pickRandomUser(
            request.user.lenderId,
            'Credit',
            customer.employmentInfo.segment
        );
        if (!creditOfficer) {
            debug(creditOfficer);
            throw new Error('Could not assign credit officer');
        }

        // TODO: Make this a transaction
        request.body.loan.loanAgent = agent._id;
        request.body.loan.customer = customer._id;
        request.body.loan.lenderId = request.user.lenderId;
        request.body.loan.creditOfficer = creditOfficer._id;
        request.body.loan.transferFee = loanMetricsObj.transferFee;
        request.body.loan.interestRate = loanMetricsObj.interestRate;
        request.body.loan.validationParams = {dob: customer.dateOfBirth};
        request.body.loan.validationParams.minNetPay = loanMetricsObj.minNetPay;
        request.body.loan.upfrontFeePercentage = loanMetricsObj.upfrontFeePercentage;
        request.body.loan.validationParams.dtiThreshold = loanMetricsObj.dtiThreshold;
        request.body.loan.validationParams.doe = customer.employmentInfo.dateOfEnlistment;
    
        await customer.save();
        const newLoan = await Loan.create(request.body.loan);

        return { customer, loan: newLoan };

    } catch (exception) {
        if(exception.code===11000) {
            const baseString = "Duplicate ";
            const field = Object.keys(exception.keyPattern)[0];

            return baseString + field;
        }

        return exception;
    }
  },
  getAll: async function (user, queryParams={}) {
    try{
        queryParams.lenderId = user.lenderId;
        
        let loans = [];
        if (user.role !== 'Loan Agent') {
            loans = await Loan.find( queryParams )
                              .populate({ path: 'customer',model: Customer, select: 'name employmentInfo.ippis' })
                              .sort('-_id');
        }else{
            queryParam.loanAgent = user.id;
            loans = await Loan.find( queryParams ).sort('-_id');
        };

        if(loans.length === 0) throw new Error('No loans found');

        return loans;

    }catch(exception) {
        debug(exception);
        return exception;
    }
  },

  getOne: async function (user, queryParams) {
    try{
        queryParams.lenderId = user.lenderId;

        let loan;
        if (user.role !== 'Loan Agent') {
            loan = await Loan.findOne( queryParams )
                             .populate({
                                path: 'customer',
                                model: Customer
                            });
        }else{
            queryParams.loanAgent = user.id;
            loan = await Loan.findOne(queryParams).populate({
                path: 'customer',
                model: Customer
            });
        }

        if(!loan) throw new Error('Loan not found');

        return loan;

    }catch(exception) {
        debug(exception);
        return exception;
    };
  },

  getDisbursement: async function (user, queryParam) {
    try{        
        let loans = [];
        if(user.role !== 'Loan Agent') {
            loans = await Loan.find(queryParam)
                              .select('_id customer recommendedAmount recommendedTenor interestRate repayment netPay upfrontFee transferFee netValue totalRepayment metrics.debtToIncomeRatio.value status createdAt dateAppOrDec lenderId')
                              .populate({
                                path: 'customer',
                                 model: Customer, 
                                 populate: [{ 
                                    path: 'accountInfo.bank', 
                                    model: Bank, 
                                    select: '-_id name' 
                                }], 
                                select: '-_id bvn employmentInfo.ippis accountInfo'
                            })
                              .sort({ createdAt: -1 });
        }else{
            queryParam.loanAgent = user.id;
            loans = await Loan.find(queryParam).sort('_id');
        };

        if(loans.length === 0) throw new Error("You have no pending disbursements");
    
        return loans;

    }catch(exception) {
        debug(exception);
        return exception;
    };
  },

  getLoanBooking: async function(queryParam) {
    try{
        const loans = await Loans.find(queryParam)
                                 .select([
                                    'dateAppOrDec',
                                    'status',
                                    'loanType',
                                    'recommendedAmount',
                                    'recommendedTenor',
                                    'interestRate',
                                    'Loan Agent'
                                    // 'bank', 'account number'
                                ]);
        if (loans.length === 0) throw new Error('No loans found');

        return loans;

    }catch(exception) {
        debug(exception);
        return exception;
    }
  },

  edit: async function(user, id, requestBody) {
    try{
        requestBody = convertToDotNotation(requestBody);

        if (user.role !== 'Credit') {
            const result = await Loan.findOne( { _id: id, lenderId: user.lenderId } );
            if(!result) throw new Error('Loan not found');

            const newPendingEdit = await PendingEditController.create(user, id, 'loan', requestBody);
            if(!newPendingEdit || newPendingEdit instanceof Error) {
                debug(newPendingEdit);
                throw newPendingEdit;
            };

            return {
                message: 'Submitted. Awaiting Review.',
                body: newPendingEdit
            };
        }

        //   TODO: Should the credit user be able to edit every type of loan?
        const loan = await Loan.findOne( { _id: id, lenderId: user.lenderId } );
        if(!loan) throw new Error('loan not found.');

        if(['approved', 'declined'].includes(requestBody?.status)) {
            loan.set('dateAppOrDec', Date.now());
        }

        loan.set(requestBody);
        await loan.save();

        return loan;

    }catch(exception) {
        debug(exception);
        return exception;
    }
  },

  closeExpiringLoans: async function () {
    try{
        const today = new Date().toLocaleDateString();
        // const loans = await Loan.find( { active: true, expectedEndDate: {$gt: today} } );
        const loans = await Loan.updateMany(
          { active: true, expectedEndDate: { $gte: today } },
          { status: 'completed', active: false }
        );
    
        return loans;
    }catch(exception) {
        debug(exception);
        return exception;
    }
  }
};

module.exports = manager;