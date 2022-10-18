const _ = require('lodash');
const { calcAge, calcServiceLength } = require('../utils/loanParams');
const { DateTime } = require('luxon');
const { LoanRequestValidator } = require('../validators/loanValidator');
const { roles, txnStatus, loanStatus } = require('../utils/constants');
const Customer = require('../models/customerModel');
const debug = require('debug')('app:loanCtrl');
const Lender = require('../models/lenderModel');
const flattenObj = require('../utils/flattenObj');
const Loan = require('../models/loanModel');
const loanManager = require('../tools/loanManager');
const logger = require('../utils/logger')('loanCtrl.js');
const mongoose = require('mongoose');
const randomUser = require('../utils/pickRandomUser');
const Segment = require('../models/segmentModel');
const ServerError = require('../errors/serverError');
const Transaction = require('../models/transactionModel');

// get loan validator
async function getValidator(lender, segment) {
    try {
        const { segments } = lender;

        const isMatch = (seg) => seg.id._id.toString() === segment;
        const foundSegment = segments.find(isMatch);
        if (!foundSegment)
            return new ServerError(404, 'Segment configuration not found');

        const isNull = (key) => foundSegment[key] === null;
        if (Object.keys(foundSegment).some(isNull))
            return new ServerError(424, 'Missing some segment parameters.');

        const loanValidators = new LoanRequestValidator(
            foundSegment.minNetPay,
            foundSegment.minLoanAmount,
            foundSegment.maxLoanAmount,
            foundSegment.minTenor,
            foundSegment.maxTenor,
            foundSegment.interestRate,
            foundSegment.upfrontFeePercent,
            foundSegment.transferFee,
            foundSegment.maxDti
        );

        return { loanValidators };
    } catch (exception) {
        logger.error({
            method: 'get_validator',
            message: exception.message,
            meta: exception.stack,
        });
        debug(exception);
        return new ServerError(500, 'Error fetching segment parameters.');
    }
}

module.exports = {
    create: async (user, customerData, loanData) => {
        try {
            // is tenant active
            const lender = await Lender.findOne({
                _id: user.lender,
                active: true,
            }).populate({
                path: 'segments.id',
                model: Segment,
            });
            if (!lender)
                return new ServerError(403, 'Tenant is yet to be activated');

            //
            const cost = loanData.amount * config.get('charge.rate');
            if (lender.balance < cost)
                new ServerError(402, 'Insufficient wallet balance.');

            // getting loan validators
            if (user.role === roles.agent) loanData.agent = user.id;
            const loanValidators = await getValidator(
                lender,
                customerData.employer.segment
            );
            if (loanValidators instanceof ServerError) return loanValidators;

            // validating loan
            const { value, error } = loanValidators.create(loanData);
            if (error) return new ServerError(400, error.details[0].message);

            // setting customer
            const customer = await getCustomerDoc(customerData);
            async function getCustomerDoc(data) {
                if (mongoose.isValidObjectId(data)) {
                    //
                    const foundCustomer = await Customer.findById(data);
                    if (!foundCustomer)
                        return new ServerError(404, 'Customer not found');

                    return foundCustomer;
                }
                //
                const foundCustomer = await Customer.findOne({
                    ippis: data.ippis,
                    lender: data.lender,
                });
                if (!foundCustomer) {
                    // customer not found, create new customer
                    const newCustomer = new Customer(payload.customer);

                    // run new customer document validation
                    const customerError = newCustomer.validateSync();
                    if (customerError) {
                        const msg =
                            customerError.errors[
                                Object.keys(customerError.errors)[0]
                            ].message;
                        return new ServerError(400, msg);
                    }
                    return newCustomer;
                }
                // customer found
                return foundCustomer;
            }

            // pick agent if not assigned one
            if (!value.agent) value.agent = await pickAgent(customer);
            async function pickAgent(customer) {
                const foundLoan = await Loan.findOne({
                    lender: customer.lender,
                    customer: customer._id,
                    active: true,
                });
                if (!foundLoan) {
                    // no active loan found. Pick a pseudo-random agent.
                    const pickedUser = await randomUser(
                        customer.lender,
                        roles.agent,
                        customer.segment
                    );
                    if (pickedUser instanceof Error)
                        return new ServerError(404, 'Failed to assign agent');
                    return pickedUser;
                }

                return foundLoan.agent;
            }
            console.log(value.agent);

            // pick credit officer if not assigned one
            if (!value.creditUser) {
                const pickedUser = await randomUser(
                    customer.segment,
                    roles.credit,
                    customer.segment
                );
                if (pickedUser instanceof Error)
                    return new ServerError(
                        404,
                        'Failed to assign credit officer.'
                    );

                value.creditUser = pickedUser;
            }
            console.log(value.creditUser);

            // setting customer parameters
            value.customer = customer._id;
            value.params.netPay = customer.netPay;
            value.params.age = calcAge(customer.birthDate);
            value.params.serviceLen = calcServiceLength(customer.hireDate);

            const newLoan = new Loan(value);

            // run new loan document validation
            const loanError = newLoan.validateSync();
            if (loanError) {
                const msg =
                    loanError.errors[Object.keys(loanError.errors)[0]].message;
                return new ServerError(400, msg);
            }

            const newTransaction = new Transaction({
                lender: customer.lender,
                status: txnStatus.success,
                category: 'Debit',
                desc: 'billed for loan submission',
                channel: 'app wallet',
                amount: cost,
                balance: lender.balance - cost,
                paidAt: new Date(),
            });

            await customer.save();
            await newLoan.save();
            await newTransaction.save();
            await lender.updateOne({
                $inc: { balance: -cost, requestCount: 1, totalCost: cost },
                lastReqDate: new Date(),
            });

            return {
                message: 'Loan created.',
                data: {
                    loan: newLoan,
                    customer: customer,
                },
            };
        } catch (exception) {
            logger.error({
                method: 'create_loan',
                message: exception.message,
                meta: exception.stack,
            });
            debug(exception);
            return new ServerError(500, 'Something went wrong');
        }
    },

    getAll: async (user, filters) => {
        try {
            // initializing query object
            const queryParams = {};
            if (user.role === roles.master) {
                if (filters?.lender) queryParams.lender = filters.lender;
            }else{
                if (user.role === roles.agent) queryParams.agent = user.id;
                else queryParams['customer.lender'] = user.lender;
            }

            applyFilters();
            function applyFilters(filters) {
                // date filter - createdAt
                if (filters?.start)
                    queryParams.createdAt = {
                        $gte: DateTime.fromJSDate(new Date(filters.start))
                            .setZone(user.timeZone)
                            .toUTC(),
                    };
                if (filters?.end) {
                    const target = queryParams.createdAt
                        ? queryParams.createdAt
                        : {};
                    queryParams.createdAt = Object.assign(target, {
                        $lte: DateTime.fromJSDate(new Date(filters.end))
                            .setZone(user.timeZone)
                            .toUTC(),
                    });
                }
    
                // number filter - recommended amount
                if (filters?.minA)
                    queryParams.recommendedAmount = { gte: filters.minA  };
                if (filters?.maxA) {
                    const target = queryParams.recommendedAmount
                        ? queryParams.recommendedAmount
                        : {};
                    queryParams.recommendedAmount = Object.assign(target, {
                        $lte: filters.maxA,
                    });
                }
    
                // number filter - recommended tenor
                if (filters?.minT)
                    queryParams.recommendedTenor = { $gte: filters.minT };
                if (filters?.maxT) {
                    const target = queryParams.recommendedTenor
                        ? queryParams.recommendedTenor
                        : {};
                    queryParams.recommendedTenor = Object.assign(target, {
                        $lte: filters.maxT,
                    });
                }

            }

            const foundLoans = await Loan.find(queryParams).populate({
                path: 'customer',
                model: Customer,
            }).sort('-createdAt');

            if(foundLoans.length == 0) return new ServerError(404, 'Loans not found');

            return {
                message: 'success',
                data: foundLoans,
            }

        } catch (exception) {
            logger.error({
                method: 'get_all',
                message: exception.message,
                meta: exception.stack,
            });
            debug(exception);
            return new ServerError(500, 'Something went wrong');
        }
    },

    getOne: async (id, user) => {
        try {
            const foundLoan = await Loan.findById(id).populate({
                path: 'customer',
                model: Customer,
            });
            if(!foundLoan) new ServerError(404, 'Loan document not found');

            return {
                message: 'success',
                data: foundLoan,
            };
        } catch (exception) {
            logger.error({method: 'get_one', message: exception.message, meta: exception.stack });
            debug(exception);
            return new ServerError(500, 'Something went wrong');
        }
    },

    update: async (id, user, payload) => {
        try {
            // is tenant active
            const lender = await Lender.findOne({
                _id: user.lender,
                active: true,
            }).populate({
                path: 'segments.id',
                model: Segment,
            });
            if (!lender)
                return new ServerError(403, 'Tenant is yet to be activated');

            // initializing query object
            const queryParams = { _id: id };
            if(user.role !== roles.master) queryParams['customer.lender'] = user.lender;

            const loan = await Loan.findOne(queryParams).populate({
                path: 'customer',
                model: Customer,
            });
            if (!loan) return new ServerError(404, 'Loan document not found');
            if ([loanStatus.matured, loanStatus.liq].includes(loan.status))
                return new ServerError(403, 'Cannot modify a matured or liquidated loan.');

            // get Validator
            const {customer: {employer: { segment }}} = loan;
            const { loanValidators } = await getValidator(lender, segment);

            const { error } = loanValidators.update(payload);
            if (error) return new ServerError(400, error.details[0].message);

            payload = flattenObj(payload);
            const response = await loanManager.update(user, loan, payload);

            return response;
        } catch (exception) {
            logger.error({method: 'update', message: exception.message, meta: exception.stack });
            debug(exception);
            return new ServerError(500, 'Something went wrong');
        }
    },

    getDisbursement: async function (user, requestBody) {
        try {
            // TODO: handle end date on the controller function
            let queryParams = {
                lenderId: user.lenderId,
                active: true,
                disbursed: false,
                status: 'Approved',
            };

            queryParams = Object.assign(
                queryParams,
                _.omit(requestBody, ['start', 'end'])
            );
            if (requestBody.start)
                queryParams.createdAt = {
                    $gte: requestBody.start,
                    $lt: requestBody.end ? requestBody.end : '2122-01-01',
                };

            const response = await loanManager.getDisbursement(
                user,
                queryParams
            );
            return {
                message: 'Success',
                data: response,
            };
        } catch (exception) {
            logger.error({ message: exception.message, meta: exception.stack });
            debug(exception);
            return { errorCode: 500, message: 'Something went wrong.' };
        }
    },

    getLoanBooking: async function (request) {
        try {
            request.body.active = true;
            request.body.booked = false;
            request.body.status = 'Approved';
            request.body.lenderId = request.user.lenderId;
            request.body.createdAt = { $gte: new Date(request.body.fromDate) };

            return await loanManager.getLoanBooking(request.body);
        } catch (exception) {
            logger.error({ message: exception.message, meta: exception.stack });
            debug(exception);
            return { errorCode: 500, message: 'Something went wrong.' };
        }
    },

    expiring: async function () {
        return await loanManager.closeExpiringLoans();
    },
};
