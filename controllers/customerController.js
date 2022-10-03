const _ = require('lodash');
const { DateTime } = require('luxon');
const { roles, sort_fields } = require('../utils/constants');
const flattenObject = require('../utils/flattenObj');
const Customer = require('../models/customerModel');
const debug = require('debug')('app:customerCtrl');
const Loan = require('../models/loanModel');
const Lender = require('../models/lenderModel');
const Origin = require('../models/origin');
const logger = require('../utils/logger')('customerCtrl.js');
const mongoose = require('mongoose');
const PendingEdit = require('../models/pendingEditModel');
const ServerError = require('../errors/serverError');

module.exports = {
    create: async (user, payload) => {
        try {
            const lender = await Lender.findOne({
                _id: user.lenderId,
                active: true,
            });
            // tenant inactive
            if (!lender)
                return new ServerError(403, 'Tenant is yet to be activated');

            const foundCustomer = await Customer.findOne({
                lenderId: user.lenderId,
                ippis: payload.ippis,
            });
            if (foundCustomer)
                new ServerError(400, 'IPPIS number already in use');

            const newCustomer = new Customer(payload);
            newCustomer.lenderId = user.lenderId;

            // run validations
            newCustomer.validateSegment();
            const error = newCustomer.validateSync();
            if (error) {
                const msg = error.errors[Object.keys(error.errors)[0]].message;
                return new ServerError(400, msg);
            }

            await foundCustomer.save();

            return {
                message: 'Customer Created.',
                data: foundCustomer,
            };
        } catch (exception) {
            logger.error({
                method: 'create',
                message: exception.message,
                meta: exception.stack,
            });
            debug(exception);
            if (exception.name === 'MongoServerError') {
                let field = Object.keys(exception.keyPattern)[0];
                field = field.replace('employer.', '');
                field = field.charAt(0).toUpperCase() + field.slice(1);
                if (field === 'Phone') field = 'Phone number';

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
            switch (filters.sort) {
                case 'asc':
                    var sortBy = sort_fields.asc;
                    break;
                case 'desc':
                    var sortBy = sort_fields.desc;
                    break;
                case 'first':
                    var sortBy = sort_fields.first;
                    break;
                case 'last':
                    var sortBy = sort_fields.last;
                    break;
                default:
                    var sortBy = sort_fields.first;
            }

            const queryParams = { lenderId: user.lenderId };
            // filter for agent id if role is agent
            if (user.role === roles.agent) queryParams.agent = user.id;

            // String Filter - fullName
            if (filters?.name)
                queryParams.fullName = new RegExp(filters.name, 'i');

            // Number Filter - Net Pay
            if (filters?.min) queryParams.netPay = { $gte: filters.min };
            if (filters?.max) {
                const target = queryParams.netPay ? queryParams.netPay : {};
                queryParams.netPay = Object.assign(target, {
                    $lte: filters.max,
                });
            }

            // String Filter - state
            if (filters?.states)
                queryParams['residentialAddress.state'] = filters.states;

            // String Filter - segment
            if (filters.segments)
                queryParams['employmentInfo.segment'] = filters.segments;

            // Date Filter - dateOfBirth
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
            console.log(queryParams);
            const foundCustomers = await Customer.find(queryParams, {
                lenders: 0,
            }).sort(sortBy);

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

    getOne: async function (id, user) {
        try {
            const queryParams = mongoose.isValidObjectId(id)
                ? { _id: id, lenderId: user.lenderId }
                : { ippis: id, lenderId: user.lenderId };
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

    update: async function (id, user, alteration) {
        try {
            alteration = flattenObject(alteration);
            const queryParams = { _id: id, lenderId: user.lenderId };
            if (user.role === roles.agent) queryParams.agent = user.id;

            const foundCustomer = await Customer.findOne(queryParams);
            if (!foundCustomer)
                return new ServerError(404, 'Customer not found');

            // user role is not operations, create edit request
            if (user.role !== roles.operations) {
                const newPendingEdit = new PendingEdit({
                    lenderId: user.lenderId,
                    createdBy: user.id,
                    docId: foundCustomer._id,
                    type: 'Customer',
                    modifiedBy: user.id,
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
                    data: newPendingEdit,
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
            logger.error({method: 'update',
             message: exception.message, meta: exception.stack });
            debug(exception);

            // Duplicate field error
            if (exception.name === 'MongoServerError') {
                let field = Object.keys(exception.keyPattern)[0];
                field = field.replace('employer.', '');
                field = field.charAt(0).toUpperCase() + field.slice(1);
                if (field === 'Phone') field = 'Phone number';

                new ServerError(409, field + ' already in use');
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

    fetchCustomerCreation: async function (user, fromDate) {
        try {
            const customers = [];

            const result = await Loan.aggregate([
                {
                    $match: {
                        lenderId: mongoose.Types.ObjectId(user.lenderId),
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

    delete: async function (id, user) {
        try {
            const queryParams = mongoose.isValidObjectId(id)
                ? { _id: id, lenderId: user.lenderId }
                : { ippis: id, lenderId: user.lenderId };

            const foundCustomer = await Customer.findOne(queryParams);
            if (!foundCustomer)
                return new ServerError(404, 'Customer not found');

            await foundCustomer.delete();

            return {
                message: 'Customer profile deleted',
                data: foundCustomer
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
