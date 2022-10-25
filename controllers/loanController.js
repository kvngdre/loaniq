const _ = require('lodash');
const { calcAge, calcServiceLength } = require('../utils/loanParams');
const { DateTime } = require('luxon');
const { roles, txnStatus, loanStatus } = require('../utils/constants');
const config = require('config');
const Customer = require('../models/customerModel');
const debug = require('debug')('app:loanCtrl');
const flattenObj = require('../utils/flattenObj');
const Lender = require('../models/lenderModel');
const Loan = require('../models/loanModel');
const loanManager = require('../tools/loanManager');
const LoanValidator = require('../validators/loanValidator');
const logger = require('../utils/logger')('loanCtrl.js');
const mongoose = require('mongoose');
const PendingEdit = require('../models/pendingEditModel');
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

        const loanValidator = new LoanValidator(
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

        return loanValidator;
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
            const foundLender = await Lender.findById(user.lender).populate({
                path: 'segments.id',
                model: Segment,
            });
            if (!foundLender) return new ServerError(404, 'Tenant not found');
            if (!foundLender.active)
                return new ServerError(404, 'Tenant is yet to be activated');

            // calculate cost
            const cost = loanData.amount * config.get('charge.rate');
            if (foundLender.balance < cost)
                new ServerError(402, 'Insufficient wallet balance.');

            // getting loan validators
            if (user.role === roles.agent) loanData.agent = user.id;
            const loanValidators = await getValidator(
                foundLender,
                customerData.employer.segment
            );
            if (loanValidators instanceof ServerError) return loanValidators;

            // validating loan
            const { value, error } = loanValidators.create(loanData);
            if (error) return new ServerError(400, error.details[0].message);

            // setting customer
            const customer = await getCustomerDoc(customerData);
            if(customer instanceof Error) return customer;
            async function getCustomerDoc(data) {
                if (mongoose.isValidObjectId(data)) {
                    //
                    const foundCustomer = await Customer.findById(data);
                    if (!foundCustomer)
                        return new ServerError(404, 'Customer not found');

                    return foundCustomer;
                }

                // is not an object id
                const foundCustomer = await Customer.findOne({
                    ippis: data.ippis,
                    lender: user.lender,
                });
                if (!foundCustomer) {
                    // customer not found, create new customer
                    const newCustomer = new Customer(customerData);

                    // validate customer segment to match ippis
                    const error = await newCustomer.validateSegment();
                    if(error) return error;

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
            if (!value.agent) {
                const foundLoan = await Loan.findOne({
                    lender: customer.lender,
                    customer: customer._id,
                    active: true,
                }).populate({
                    path: 'customer',
                    model: Customer,
                });

                if (foundLoan) value.agent = foundLoan.agent;
                else {
                    // no active loan found. Pick a pseudo-random agent.
                    const randomAgent = await randomUser(
                        customer.lender,
                        roles.agent,
                        customer.employer.segment
                    );
                    if (randomAgent instanceof Error)
                        return new ServerError(404, 'Error: Failed to assign agent');
                    
                    value.agent = randomAgent;
                }
            }

            // pick credit user if not assigned one
            if (!value.creditUser) {
                const randomCreditUser = await randomUser(
                    customer.lender,
                    roles.credit,
                    customer.employer.segment
                );
                if (randomCreditUser instanceof Error)
                    return new ServerError(
                        404,
                        'Error: Failed to assign credit officer'
                    );

                value.creditUser = randomCreditUser;
            }

            // setting customer parameters on loan document
            value.customer = customer._id;
            value.params.netPay = customer.netPay;
            value.params.age = calcAge(customer.birthDate);
            value.params.serviceLen = calcServiceLength(customer.employer.hireDate);

            const newLoan = new Loan(value);

            // run new loan document validation
            const loanError = newLoan.validateSync();
            if (loanError) {
                const msg =
                    loanError.errors[Object.keys(loanError.errors)[0]].message;
                return new ServerError(400, msg);
            }

            const customerError = customer.validateSync();
            if (customerError) {
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
                balance: foundLender.balance - cost,
                paidAt: new Date(),
            });

            await customer.save();
            await newLoan.save();
            await newTransaction.save();
            await foundLender.updateOne({
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
            } else {
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
                    queryParams.recommendedAmount = { gte: filters.minA };
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

            const foundLoans = await Loan.find(queryParams)
                .populate({
                    path: 'customer',
                    model: Customer,
                })
                .sort('-createdAt');

            if (foundLoans.length == 0)
                return new ServerError(404, 'Loans not found');

            return {
                message: 'success',
                data: foundLoans,
            };
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
            if (!foundLoan) new ServerError(404, 'Loan document not found');

            return {
                message: 'success',
                data: foundLoan,
            };
        } catch (exception) {
            logger.error({
                method: 'get_one',
                message: exception.message,
                meta: exception.stack,
            });
            debug(exception);
            return new ServerError(500, 'Something went wrong');
        }
    },

    update: async (id, user, payload) => {
        try {
            const foundLender = await Lender.findById(user.lender).populate({
                path: 'segments.id',
                model: Segment,
            });
            if (!foundLender) return new ServerError(404, 'Tenant not found');
            if (!foundLender.active)
                return new ServerError(403, 'Tenant is yet to be activated');

            // initializing query object
            const queryParams =
                user.role === roles.master
                    ? { _id: id }
                    : { _id: id, 'customer.lender': user.lender };

            const foundLoan = await Loan.findOne(queryParams).populate({
                path: 'customer',
                model: Customer,
            });
            if (!foundLoan) return new ServerError(404, 'Document not found');
            
            const { liquidated, locked, matured } = loanStatus;
            if ([liquidated, locked, matured].includes(foundLoan.status))
                return new ServerError(403, 'Cannot modify loan document.');

            // get Validator
            const { customer } = foundLoan;
            const loanValidators = await getValidator(
                foundLender,
                customer.employer.segment
            );
            if (loanValidators instanceof ServerError) return loanValidators;
            
            // validating loan
            const { error } = loanValidators.update(payload);
            if (error) return new ServerError(400, error.details[0].message);

            payload = flattenObj(payload);
            const response = await loanManager.update(user, foundLoan, payload);

            // reassign agent or credit user
            if (payload?.agent || payload?.creditUser) {
                if(![roles.admin, roles.owner, roles.master].includes(user.role))
                    return new ServerError(403, 'Cannot reassign personnel');
                if (payload.creditUser)
                    foundLoan.set({ creditUser: payload.creditUser });
                if (payload.agent)
                    foundLoan.set({ agent: payload.agent });
            }

            // not a credit user, create pending edit.
            if (user.role !== roles.credit) {
                const newPendingEdit = new PendingEdit({
                    lender: user.lender,
                    docId: foundLoan._id,
                    type: 'Loan',
                    createdBy: user.id,
                    modifiedBy: user.id,
                    alteration: payload,
                });

                await newPendingEdit.save();

                return {
                    message: 'Submitted. Awaiting review.',
                    body: newPendingEdit,
                };
            }

            return response;
        } catch (exception) {
            logger.error({
                method: 'update',
                message: exception.message,
                meta: exception.stack,
            });
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
