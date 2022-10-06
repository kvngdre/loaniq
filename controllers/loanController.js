const _ = require('lodash');
const mongoose = require('mongoose');
const { DateTime } = require('luxon');
const Loan = require('../models/loanModel');
const debug = require('debug')('app:loanCtrl');
const Customer = require('../models/customerModel');
const Segment = require('../models/segmentModel');
const Lender = require('../models/lenderModel');
const logger = require('../utils/logger')('loanCtrl.js');
const loanManager = require('../tools/loanManager');
const { LoanRequestValidator } = require('../validators/loanValidator');
const ServerError = require('../errors/serverError');

// get loan validator
async function getValidator(lender, code) {
    try {
        const { segments } = lender;

        const foundSegment = segments.find(
            (segment) => segment.id.code === code
        );
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

const loans = {
    create: async function (user, payload) {
        try {
            const lender = await Lender.findOne({
                _id: user.lenderId,
                active: true,
            }).populate({
                path: 'segments.id',
                model: Segment,
            });
            // tenant inactive
            if (!lender)
                return new ServerError(403, 'Tenant is yet to be activated');

            // getting loan validators
            const loanValidators = await getValidator(lender,payload.customer.employer.segment);
            if (loanValidators instanceof ServerError) return loanValidators;

            // validating loan
            const { value, error } = loanValidators.create(payload.loan);
            if (error) return new ServerError(400, error.details[0].message);
            
            // setting customer
            payload.customer.lenderId = user.lenderId;
            const customer = await getCustomerDoc(payload.customer);

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
                    lenderId: data.lenderId,
                });
                if (!foundCustomer) {
                    // customer not found, create new customer
                    const newCustomer = new Customer(payload.customer);

                    // run new customer document validation
                    const error = newCustomer.validateSync();
                    if (error) {
                        const msg =
                            error.errors[Object.keys(error.errors)[0]].message;
                        return new ServerError(400, msg);
                    }

                    return newCustomer;
                }

                // customer found
                return foundCustomer;
            }

            const response = await loanManager.createLoanRequest(
                user,
                loanParams,
                payload.customer,
                payload.loan
            );

            return response;
        } catch (exception) {
            logger.error({
                method: 'createLoanReq',
                message: exception.message,
                meta: exception.stack,
            });
            debug(exception);
            return new ServerError(500, 'Something went wrong');
        }
    },

    getAll: async function (user, filters) {
        try {
            let loans = [];
            let queryParams = { lenderId: user.lenderId };

            if (user.role === 'Loan Agent') {
                queryParams.loanAgent = user.id;
                loans = await loanManager.getAll(queryParams);
            } else {
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

                loans = await loanManager.getAll(queryParams);
            }

            return loans;
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
            const queryParams = { _id: id, lenderId: user.lenderId };

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

module.exports = loans;
