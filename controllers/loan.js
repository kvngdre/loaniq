const _ = require('lodash');
const mongoose = require('mongoose');
const { DateTime } = require('luxon');
const Loan = require('../models/loan');
const debug = require('debug')('app:loanCtrl');
const Customer = require('../models/customer');
const settingsController = require('./settings');
const logger = require('../utils/logger')('loanCtrl.js');
const loanManager = require('../tools/Managers/loanManager');
const { LoanRequestValidators } = require('../validators/loan');

// Get Loan Validators.
async function getValidator(user, segmentId) {
    try {
        const settings = await settingsController.getOne(user.lenderId);
        if (settings.hasOwnProperty('errorCode')) {
            logger.error({
                message: 'Failed to find lender settings.',
                meta: {
                    lender: user.lenderId,
                    user: user.id,
                    role: user.role,
                    email: user.email,
                },
            });
            throw new Error(settings.message);
        }
        const {
            data: { loanParams, segments },
        } = settings;

        const { minLoanAmount, maxLoanAmount, minTenor, maxTenor, maxDti } =
            segments.find((segment) => segment.id === segmentId);

        // Segment specific maxDti
        loanParams.maxDti = maxDti;
        const loanReqValidator = new LoanRequestValidators(
            loanParams.minNetPay,
            minLoanAmount,
            maxLoanAmount,
            minTenor,
            maxTenor
        );

        return { loanParams, loanReqValidator };
    } catch (exception) {
        logger.error({
            message: `getValidator - ${exception.message}`,
            meta: exception.stack,
        });
        debug(exception);
        return exception;
    }
}

const loans = {
    createLoanRequest: async function (user, payload) {
        try {
            // if(request.user.role === 'guest') request.user.lenderId = request.params.id;

            if (mongoose.isValidObjectId(payload.customer)) {
                const customer = await Customer.findById(payload.customer);
                if (!customer)
                    return { errorCode: 404, message: 'Customer not found.' };

                payload.customer = customer._doc;
            }

            const validator = await getValidator(
                user,
                payload.customer.employmentInfo.segment.toString()
            );
            if (validator instanceof Error) {
                logger.error({
                    message: 'Error fetching loan and segment configurations.',
                    meta: {
                        userId: user.id || 'guest',
                        lenderId: user.lenderId,
                    },
                });
                return {
                    errorCode: 424,
                    message: 'Unable to fetch loan and segment configurations.',
                };
            }

            const { loanParams, loanReqValidator } = validator;

            const { error } = loanReqValidator.create(payload.loan);
            if (error)
                return { errorCode: 400, message: error.details[0].message };

            const response = await loanManager.createLoanRequest(
                user,
                loanParams,
                payload.customer,
                payload.loan
            );

            return response;
        } catch (exception) {
            logger.error({ message: exception.message, meta: exception.stack });
            debug(exception);
            return { errorCode: 500, message: 'Something went wrong.' };
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
                queryParams = Object.assign(
                    queryParams,
                    _.omit(filters, ['date', 'amount', 'tenor'])
                );

                // Date Filter - createdAt
                if (filters.date?.start)
                    queryParams.createdAt = {
                        $gte: DateTime.fromJSDate(new Date(filters.date.start))
                            .setZone(user.timeZone)
                            .toUTC(),
                    };
                if (filters.date?.end) {
                    const target = queryParams.createdAt
                        ? queryParams.createdAt
                        : {};
                    queryParams.createdAt = Object.assign(target, {
                        $lte: DateTime.fromJSDate(new Date(filters.date.end))
                            .setZone(user.timeZone)
                            .toUTC(),
                    });
                }

                // Number Filter - amount
                if (filters.amount?.min)
                    queryParams.recommendedAmount = {
                        $gte: filters.amount.min,
                    };
                if (filters.amount?.max) {
                    const target = queryParams.recommendedAmount
                        ? queryParams.recommendedAmount
                        : {};
                    queryParams.recommendedAmount = Object.assign(target, {
                        $lte: filters.amount.max,
                    });
                }

                //
                if (filters.tenor?.min)
                    queryParams.recommendedTenor = { $gte: filters.tenor.min };
                if (filters.tenor?.max) {
                    const target = queryParams.recommendedTenor
                        ? queryParams.recommendedTenor
                        : {};
                    queryParams.recommendedTenor = Object.assign(target, {
                        $lte: filters.tenor.max,
                    });
                }

                loans = await loanManager.getAll(queryParams);
            }

            return loans;
        } catch (exception) {
            logger.error({ message: exception.message, meta: exception.stack });
            debug(exception);
            return { errorCode: 500, message: 'Something went wrong.' };
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
