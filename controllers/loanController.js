const _ = require('lodash');
const { calcAge, calcServiceLength } = require('../utils/LoanParams');
const { DateTime } = require('luxon');
const { LoanRequestValidator } = require('../validators/loanValidator');
const { roles, txnStatus } = require('../utils/constants');
const Customer = require('../models/customerModel');
const debug = require('debug')('app:loanCtrl');
const Lender = require('../models/lenderModel');
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

            // picking agent
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

            // picking credit officer
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

    getAll: async function (user, filters) {
        try {
            const queryParams = {};

            // initialising query object
            if (user.role === roles.master) {
                if (filters?.lender) queryParams.lender = filters.lender;
            }else{
                if (user.role === roles.agent) queryParams.agent = user.id;
                else queryParams['customer.lender'] = user.lender;
            }


            
            
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
                queryParams.recommendedAmount = {
                    $gte: filters.minA,
                };
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

            const foundLoans = await Loan.find(queryParams).populate({
                path: 'customer',
                model: Customer,
            }).sort('-createdAt');

            if(foundLoans.length == 0) return new ServerError(404, 'Loans not found');

            return {
                message: '',
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

    getOne: async function (user, id) {
        try {
            let loan = null;
            const queryParams = { _id: id, lender: user.lender };

            if (user.role === 'Loan Agent') {
                queryParams.loanAgent = user.id;
                loan = await loanManager.getOne(queryParams);
            } else loan = await loanManager.getOne(queryParams);

            return loan;
        } catch (exception) {
            logger.error({ message: exception.message, meta: exception.stack });
            debug(exception);
            return { errorCode: 500, message: 'Something went wrong.' };
        }
    },

    update: async function (id, user, payload) {
        try {
            const queryParams = {
                _id: id,
                lenderId: user.lenderId,
            };

            const loan = await Loan.findOne(queryParams).populate({
                path: 'customer',
                model: Customer,
            });
            if (!loan)
                return { errorCode: 404, message: 'Loan document not found.' };

            if (['Matured', 'Liquidated'].includes(loan.status))
                return {
                    errorCode: 403,
                    message: 'Cannot edit a matured or liquidated loan.',
                };

            // Get Validator
            const {
                customer: {
                    employmentInfo: {
                        segment: { _id },
                    },
                },
            } = loan;
            const { loanReqValidator } = await getValidator(
                user,
                _id.toString()
            );

            const { error } = loanReqValidator.update(payload);
            if (error)
                return { errorCode: 400, message: error.details[0].message };

            const response = await loanManager.update(user, loan, payload);

            return response;
        } catch (exception) {
            logger.error({ message: exception.message, meta: exception.stack });
            debug(exception);
            return { errorCode: 500, message: 'Something went wrong.' };
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
