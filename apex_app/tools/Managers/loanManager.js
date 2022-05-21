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
    try {
      const customerOrigin = await Origin.findOne({
        ippis: customer.employmentInfo.ippis
      });
      if (customerOrigin) {
        customer.set({
          'netPay.value': customerOrigin.netPays[0] || request.body.netPay,
          'netPay.updatedAt': new Date().toISOString()
        });
        request.body.netPay = customer.netPay.value;
      }

      const loans = await Loan.find({
        customer: customer._id,
        lenderId: request.user.lenderId,
        active: true
      })
        .sort({ createdAt: -1 })
        .limit(1);
      if (loans.length > 0) request.body.loanType = 'topUp';

      let agent;
      if (request.user.role === 'loanAgent') {
        agent = await userController.get({
          _id: request.user.id,
          lenderId: request.user.lenderId,
          segments: customer.employmentInfo.segment
        });
      }

      if (loans.length === 0) {
        agent = await pickRandomUser(
          request.user.lenderId,
          'loanAgent',
          customer.employmentInfo.segment
        );
      } else {
        agent = await userController.get({ _id: loans[0].loanAgent });
      }

      if (!agent) {
        debug(agent);
        throw new Error('Invalid loan agent');
      }

      const creditOfficer = await pickRandomUser(
        request.user.lenderId,
        'credit',
        customer.employmentInfo.segment
      );
      if (!creditOfficer) {
        debug(creditOfficer);
        throw new Error('Could not assign credit officer');
      }

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
      request.body.validationParams.doe =
        customer.employmentInfo.dateOfEnlistment;

      const newLoan = await Loan.create(request.body);
      await customer.save();

      return newLoan;
    } catch (exception) {
      return exception;
    }
  },

  createLoanRequest: async function (loanMetricsObj, request) {
    try {
      // TODO: speak to victor about slug and guest user
      if (request.user.role === 'guest') {
        const lender = await Lender.findOne({ slug: request.body.slug });
        if (!lender) throw new Error('Error retrieving lender information');

        request.user.lenderId = lender._id;
      }

      let customer;
      customer = await customerController.get({
        'employmentInfo.ippis': request.body.employmentInfo.ippis
      });
      if (customer.message && customer.stack) {
        customer = new Customer(_.omit(request.body, ['loan']));
        customer.validateSegment();
      }

      const customerOrigin = await Origin.findOne({
        ippis: customer.employmentInfo.ippis
      });
      if (customerOrigin) {
        customer.set({
          'netPay.value': customerOrigin.netPays[0] || request.body.netPay,
          'netPay.updatedAt': new Date().toISOString()
        });
        request.body.loan.netPay = customer.netPay.value;
      }

      const loans = await Loan.find({
        customer: customer._id,
        lenderId: request.user.lenderId
      })
        .sort({ createdAt: -1 })
        .limit(1);

      if (loans.length > 0) request.body.loanType = 'topUp';

      let agent;
      if (request.user.role === 'loanAgent') {
        agent = await userController.get({
          _id: request.user.id,
          lenderId: request.user.lenderId,
          segments: customer.employmentInfo.segment
        });
      }

      if (!agent && loans.length === 0) {
        agent = await pickRandomUser(
          request.user.lenderId,
          'loanAgent',
          customer.employmentInfo.segment
        );
      } else {
        agent = await userController.get({ _id: loans[0].loanAgent });
      }

      if (!agent) {
        debug(agent);
        throw new Error('Invalid loan agent');
      }

      let creditOfficer = await pickRandomUser(
        request.user.lenderId,
        'credit',
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
      request.body.loan.validationParams = { dob: customer.dateOfBirth };
      request.body.loan.validationParams.minNetPay = loanMetricsObj.minNetPay;
      request.body.loan.upfrontFeePercentage =
        loanMetricsObj.upfrontFeePercentage;
      request.body.loan.validationParams.dtiThreshold =
        loanMetricsObj.dtiThreshold;
      request.body.loan.validationParams.doe =
        customer.employmentInfo.dateOfEnlistment;

      const newLoan = await Loan.create(request.body.loan);
      await customer.save();

      return { customer, loan: newLoan };
    } catch (exception) {
      console.log(exception);
      return exception;
    }
  },

  getAll: async function (user, queryParam = {}) {
    queryParam.lenderId = user.lenderId;

    if (user.role !== 'loanAgent') {
      const loans = await Loan.find(queryParam)
        .select(
          '_id status amount recommendedAmount tenor recommendedTenor customer createdAt netPay dateAppOrDec lenderId'
        )
        .select('-lenderId')
        .populate({
          path: 'customer',
          model: Customer,
          select: 'name employmentInfo.ippis'
        })
        .sort({ createdAt: -1 });

      return loans;
    }

    queryParam.loanAgent = user.id;
    const loans = await Loan.find(queryParam).sort('_id');

    return loans;
  },

  getOne: async function (user, queryParam) {
    queryParam.lenderId = user.lenderId;
    console.log('manager=======', queryParam);
    if (user.role !== 'loanAgent') {
      const loan = await Loan.findOne(queryParam).populate({
        path: 'customer',
        model: Customer
      });

      return loan;
    }

    queryParam.loanAgent = user.id;
    const loan = await Loan.findOne(queryParam).populate({
      path: 'customer',
      model: Customer
    });

    return loan;
  },

  getDisbursement: async function (user, queryParam = {}) {
    queryParam.lenderId = user.lenderId;

    if (user.role !== 'loanAgent') {
      const loans = await Loan.find(queryParam)
        .select(
          '_id customer recommendedAmount recommendedTenor interestRate repayment netPay upfrontFee transferFee netValue totalRepayment metrics.debtToIncomeRatio.value status createdAt dateAppOrDec lenderId'
        )
        .populate({
          path: 'customer',
          model: Customer,
          populate: [
            { path: 'accountInfo.bank', model: Bank, select: '-_id name' }
          ],
          select: '-_id bvn employmentInfo.ippis accountInfo'
        })
        .sort({ createdAt: -1 });

      return loans;
    }

    queryParam.loanAgent = user.id;
    const loans = await Loan.find(queryParam).sort('_id');

    return loans;
  },

  getLoanBooking: async function (queryParam) {
    try {
      const loans = await Loans.find(queryParam).select([
        'dateAppOrDec',
        'status',
        'loanType',
        'recommendedAmount',
        'recommendedTenor',
        'interestRate',
        'loanAgent'
        //  'bank', 'account number'
      ]);
      if (loans.length === 0) throw new Error('No loans found');

      return loans;
    } catch (exception) {
      return exception;
    }
  },

  edit: async function (request) {
    try {
      request.body = convertToDotNotation(request.body);

      if (request.user.role === 'loanAgent') {
        const result = await Loan.findOne({
          _id: request.params.id,
          loanAgent: request.user.id,
          lenderId: request.user.lenderId
        });
        if (!result) throw new Error('loan not found.');

        const newPendingEdit = await PendingEditController.create(
          request.user,
          request.params.id,
          'loan',
          request.body
        );
        if (!newPendingEdit || newPendingEdit instanceof Error) {
          debug(newPendingEdit);
          throw newPendingEdit;
        }

        return {
          message: 'Submitted. Awaiting Review.',
          alteration: newPendingEdit
        };
      }

      const loan = await Loan.findOne({
        _id: request.params.id,
        lenderId: request.user.lenderId
      });
      if (!loan) throw new Error('loan not found.');

      if (['approved', 'declined'].includes(request.body?.status)) {
        loan.set('dateAppOrDec', Date.now());
      }

      loan.set(request.body);
      await loan.save();

      return loan;
    } catch (exception) {
      debug(exception);
      return exception;
    }
  },

  closeExpiringLoans: async function () {
    const today = new Date().toLocaleDateString();
    // const loans = await Loan.find( { active: true, expectedEndDate: {$gt: today} } );
    const loans = await Loan.updateMany(
      { active: true, expectedEndDate: { $gte: today } },
      { status: 'completed', active: false }
    );

    return loans;
  }
};

module.exports = manager;
