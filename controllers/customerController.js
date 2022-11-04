const _ = require('lodash');
const { DateTime } = require('luxon');
const { roles, sort_fields } = require('../utils/constants');
const Customer = require('../models/customerModel');
const debug = require('debug')('app:customerCtrl');
const flattenObject = require('../utils/flattenObj');
const Lender = require('../models/lenderModel');
const Loan = require('../models/loanModel');
const logger = require('../utils/logger')('customerCtrl.js');
const mongoose = require('mongoose');
const Origin = require('../models/origin');
const PendingEdit = require('../models/pendingEditModel');
const ServerError = require('../errors/serverError');

module.exports = {
    create: async (user, payload) => {
        try {
            const foundLender = await Lender.findById(user.lender);
            if (!foundLender) return new ServerError(404, 'Tenant not found');
            if (!foundLender.active)
                return new ServerError(403, 'Tenant is yet to be activated');

            const newCustomer = new Customer(payload);

            // run new customer document validation
            const error = newCustomer.validateSync();
            if (error) {
                const msg = error.errors[Object.keys(error.errors)[0]].message;
                return new ServerError(400, msg);
            }

            await newCustomer.save();

            return {
                message: 'Customer Created.',
                data: newCustomer,
            };
        } catch (exception) {
            logger.error({
                method: 'create',
                message: exception.message,
                meta: exception.stack,
            });
            debug(exception);
            // duplicate field error
            if (exception.name === 'MongoServerError') {
                let field = Object.keys(exception.keyPattern)[0].toUpperCase();
                field = field.replace('ACCOUNTNO', 'Account Number');
                return new ServerError(409, field + ' already in use');
            }

            if (exception.name === 'ValidationError') {
                const field = Object.keys(exception.errors)[0];
                return new ServerError(
                    400,
                    exception.errors[field].message.replace('Path', '')
                );
            }

            return new ServerError(500, 'Something went wrong');
        }
    },

    getAll: async (user, filters) => {
        try {
            const queryParams = { lender: user.lender };

            applyFilters(filters);
            function applyFilters(filters) {
                // string filter - full name
                if (filters?.name) {
                    queryParams.fullName = new RegExp(filters.name, 'i');
                }

                // number filter - net pay
                if (filters?.min) queryParams.netPay = { $gte: filters.min };
                if (filters?.max) {
                    const target = queryParams.netPay ? queryParams.netPay : {};
                    queryParams.netPay = Object.assign(target, {
                        $lte: filters.max,
                    });
                }

                if (filters?.states)
                    queryParams['residentialAddress.state'] = filters.states;

                if (filters.segments)
                    queryParams['employmentInfo.segment'] = filters.segments;

                // date filter - dateOfBirth
                if (filters?.minAge)
                    queryParams.dateOfBirth = {
                        $gte: DateTime.now()
                            .minus({ years: filters.minAge })
                            .toFormat('yyyy-MM-dd'),
                    };
                if (filters?.maxAge) {
                    const target = queryParams.dateOfBirth
                        ? queryParams.dateOfBirth
                        : {};
                    queryParams.dateOfBirth = Object.assign(target, {
                        $lte: DateTime.now()
                            .minus({ years: filters.maxAge })
                            .toFormat('yyyy-MM-dd'),
                    });
                }

                // number filter - net pay
                if (filters?.minPay)
                    queryParams.netPay = filters.minPay;
                if (filters?.maxPay) {
                    const target = queryParams.netPay
                        ? queryParams.netPay
                        : {};
                    queryParams.netPay = Object.assign(target, filters.maxPay);
                }
            }

            let foundCustomers = [];

            if (user.role === roles.agent) {
                foundCustomers = await Loan.aggregate([
                    {
                        $match: {
                            agent: mongoose.Types.ObjectId(user.id),
                        },
                    },
                    {
                        $group: {
                            _id: '$customer',
                        },
                    },
                    {
                        $lookup: {
                            from: 'customers',
                            localField: '_id',
                            foreignField: '_id',
                            as: 'customer',
                        },
                    },
                    {
                        $unwind: '$customer',
                    },
                    {
                        $replaceRoot: {
                            newRoot: '$customer',
                        },
                    },
                    {
                        $unset: 'customer',
                    },
                    {
                        $match: queryParams,
                    },
                    {
                        $sort: { 'name.first': 1 },
                    },
                ]);
            } else {
                foundCustomers = await Customer.find(queryParams, {
                    lenders: 0,
                }).sort('name.first');
            }

            if (foundCustomers.length == 0)
                return new ServerError(404, 'No customers found');

            return {
                message: 'success',
                data: foundCustomers,
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
            const queryParams = mongoose.isValidObjectId(id)
                ? { _id: id, lender: user.lender }
                : { ippis: id, lender: user.lender };
            if (user.role === roles.agent) queryParams.agent = user.id;

            const foundCustomer = await Customer.findOne(queryParams);
            if (!foundCustomer)
                return new ServerError(404, 'Customer not found');

            return {
                message: 'success',
                data: foundCustomer,
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

    update: async (id, user, alteration) => {
        try {
            const foundLender = await Lender.findById(user.lender);
            if (!foundLender) return new ServerError(404, 'Tenant not found');
            if (!foundLender.active)
                return new ServerError(403, 'Tenant is yet to be activated');

            // flatten request body
            alteration = flattenObject(alteration);

            const queryParams = { _id: id, lender: user.lender };
            if (user.role === roles.agent) queryParams.agent = user.id;

            const foundCustomer = await Customer.findOne(queryParams);
            if (!foundCustomer)
                return new ServerError(404, 'Customer not found');

            if (user.role !== roles.operations) {
                // user role is not operations, create edit request
                const newPendingEdit = new PendingEdit({
                    lender: user.lender,
                    createdBy: user.id,
                    docId: foundCustomer._id,
                    type: 'Customer',
                    modifiedBy: user.id,
                    alteration,
                });

                const error = newPendingEdit.validateSync();
                if (error) {
                    const msg =
                        error.errors[Object.keys(error.errors)[0]].message;
                    return new ServerError(400, msg);
                }

                await newPendingEdit.save();

                return {
                    message: 'Edit request submitted. Awaiting review.',
                    // data: newPendingEdit,
                };
            }

            // user role is operations, perform update
            foundCustomer.set(alteration);
            await foundCustomer.save();

            return {
                message: 'Customer profile updated',
                data: foundCustomer,
            };
        } catch (exception) {
            logger.error({
                method: 'update',
                message: exception.message,
                meta: exception.stack,
            });
            debug(exception);

            // Duplicate field error
            if (exception.name === 'MongoServerError') {
                let field = Object.keys(exception.keyPattern)[0].toUpperCase();
                field = field.replace('ACCOUNTNO', 'Account Number');
                return new ServerError(409, field + ' already in use');
            }

            if (exception.name === 'ValidationError') {
                const field = Object.keys(exception.errors)[0];
                return new ServerError(
                    400,
                    exception.errors[field].message.replace('Path', '')
                );
            }

            return new ServerError(500, 'Something went wrong');
        }
    },

    fetchCustomerCreation: async (user, fromDate) => {
        try {
            const customers = [];

            const result = await Loan.aggregate([
                {
                    $match: {
                        lender: mongoose.Types.ObjectId(user.lender),
                        status: 'Approved',
                        createdAt: { $gte: new Date(fromDate) },
                    },
                },
                {
                    $group: {
                        _id: '$customer',
                    },
                },
                {
                    $lookup: {
                        from: 'customers',
                        localField: '_id',
                        foreignField: '_id',
                        as: 'customerData',
                    },
                },
                {
                    $project: {
                        customers: {
                            name: 1,
                            gender: 1,
                            dateOfBirth: 1,
                            'residentialAddress.street': 1,
                            maritalStatus: 1,
                            'contact.phone': 1,
                            bvn: 1,
                            idCardInfo: 1,
                            employmentInfo: 1,
                            nok: 1,
                            accountInfo: 1,
                        },
                    },
                },
            ]).exec();
            // Flatten result
            for (customer of result) {
                customers.push(customer.customers[0]);
            }
            if (customers.length === 0)
                return { errorCode: 404, message: 'No match for filters.' };

            return {
                message: 'success',
                data: result,
            };
        } catch (exception) {
            logger.error({ message: exception.message, meta: exception.stack });
            debug(exception);
            return { errorCode: 500, message: 'Something went wrong.' };
        }
    },

    delete: async (id, user) => {
        try {
            const queryParams = mongoose.isValidObjectId(id)
                ? { _id: id, lender: user.lender }
                : { ippis: id, lender: user.lender };

            const foundCustomer = await Customer.findOne(queryParams);
            if (!foundCustomer)
                return new ServerError(404, 'Customer not found');

            await foundCustomer.delete();

            return {
                message: 'Customer profile deleted',
                data: foundCustomer,
            };
        } catch (exception) {
            logger.error({
                method: 'delete',
                message: exception.message,
                meta: exception.stack,
            });
            debug(exception);
            return new ServerError(500, 'Something went wrong');
        }
    },
};
