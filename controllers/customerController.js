const _ = require('lodash');
const { DateTime } = require('luxon');
const { roles } = require('../utils/constants');
const convertToDotNotation = require('../utils/convertToDotNotation');
const Customer = require('../models/customerModel');
const debug = require('debug')('app:customerCtrl');
const Loan = require('../models/loan');
const logger = require('../utils/logger')('customerCtrl.js');
const mongoose = require('mongoose');
const originController = require('./origin');
const PendingEditController = require('./pendingEditController');
const ServerError = require('../errors/serverError');

module.exports = {
    create: async function (user, payload) {
        try {
            // TODO: uncomment this later
            // payload.passport.path = request.file.passport[0].path;
            // payload.passport.originalName = request.file.passport[0].originalname;

            // payload.idCard.path = request.file.idCard[0].path;
            // payload.passport.originalName = request.file.idCard[0].originalname;

            const queryParams = {
                'employmentInfo.ippis': payload.employmentInfo.ippis,
                lenders: user.lenderId,
            };

            let customer = await Customer.findOne(queryParams);

            // Customer found for lender.
            if (customer !== null)
                return new ServerError(
                    409,
                    'Customer with this IPPIS already exist.'
                );
            else customer = new Customer(payload);
            // else {
            //     // Update info
            //     // TODO: do a redirect
            //     customer.set({
            //         contactInfo: payload.contactInfo,
            //         residentialAddress: payload.residentialAddress,
            //         maritalStatus: payload.maritalStatus,
            //         'employmentInfo.companyLocation':
            //             payload.employmentInfo.companyLocation,
            //         nok: payload.nok
            //     });
            // }
            customer.addLender(user.lenderId);

            // TODO: uncomment this later
            // TODO: api call to deduct
            // const originCopy = await originController.getOne({ippis: payload.employmentInfo.ippis});
            // if(originCopy.hasOwnProperty('errorCode')) return { errorCode: 404, message: 'Could not find Origin copy.'};
            // customer.netPay = originCopy.netPays[0];

            await customer.save();

            return {
                message: 'Customer Created.',
                data: customer,
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
                field = field.replace('employmentInfo.', '');
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

    getAll: async function (user, filters) {
        try {
            let customers = [];

            // if loan agent
            if (user.role === roles.agent) {
                result = await Loan.aggregate([
                    {
                        $match: {
                            lenderId: mongoose.Types.ObjectId(user.lenderId),
                            loanAgent: mongoose.Types.ObjectId(user.id),
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
                            as: 'customers',
                        },
                    },
                    {
                        $sort: {
                            _id: -1,
                        },
                    },
                    {
                        $project: {
                            _id: 0,
                        },
                    },
                ]).exec();

                // Flatten result
                for (customer of result) {
                    customers.push(customer.customers[0]);
                }
            } else {
                // user not a loan agent
                const queryParams = Object.assign(
                    { lenders: user.lenderId },
                    _.omit(filters, [
                        'date',
                        'segments',
                        'netPay',
                        'name',
                        'states',
                    ])
                );
                console.log(queryParams);
                // String Filter - displayName
                if (filters.name)
                    queryParams.displayName = new RegExp(filters.name, 'i');

                // String Filter - state
                if (filters.states)
                    queryParams['residentialAddress.state'] = filters.states;

                // Number Filter - Net Pay
                if (filters.netPay?.min)
                    queryParams.netPay = {
                        $gte: filters.netPay.min,
                    };
                if (filters.netPay?.max) {
                    const target = queryParams.netPay ? queryParams.netPay : {};

                    queryParams.netPay = Object.assign(target, {
                        $lte: filters.netPay.max,
                    });
                }

                // String Filter - segment
                if (filters.segments)
                    queryParams['employmentInfo.segment'] = filters.segments;

                // Date Filter - createdAt
                if (filters.date?.start)
                    queryParams.createdAt = {
                        $gte: DateTime.fromISO(filters.date.start)
                            .setZone(user.timeZone)
                            .toUTC(),
                    };
                if (filters.date?.end) {
                    const target = queryParams.createdAt
                        ? queryParams.createdAt
                        : {};
                    queryParams.createdAt = Object.assign(target, {
                        $lte: DateTime.fromISO(filters.date.end)
                            .setZone(user.timeZone)
                            .toUTC(),
                    });
                }
                console.log(queryParams);
                customers = await Customer.find(queryParams, { lenders: 0 })
                    .populate('employmentInfo.segment')
                    .sort('-createdAt'); // descending order
            }

            if (customers.length == 0)
                return new ServerError(404, 'No customers found');

            return {
                message: 'success',
                data: customers,
            };
        } catch (exception) {
            logger.error({
                method: 'getAll',
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
                ? { _id: id, lenders: user.lenderId }
                : { 'employmentInfo.ippis': id, lenders: user.lenderId };

            const foundCustomer = await Customer.findOne(queryParams);
            if (!foundCustomer)
                return new ServerError(404, 'Customer not found');

            return {
                message: 'Success',
                data: foundCustomer,
            };
        } catch (exception) {
            logger.error({
                method: 'getOne',
                message: exception.message,
                meta: exception.stack,
            });
            debug(exception);
            return new ServerError(500, 'Something went wrong');
        }
    },

    update: async function (id, user, alteration) {
        try {
            alteration = convertToDotNotation(alteration);

            const queryParams = { _id: id, lenders: user.lenderId };

            const customer = await Customer.findOne(queryParams);
            if (!customer) return new ServerError(404, 'Customer not found');

            // If not operations, submit pending
            if (user.role !== roles.operations) {
                const newPendingEdit = await PendingEditController.create(
                    user,
                    { docId: id, type: 'Customer', alteration }
                );
                if (newPendingEdit instanceof ServerError) {
                    debug(newPendingEdit);
                    return new ServerError(
                        500,
                        'Failed to create change request'
                    );
                }

                return {
                    message: 'Submitted. Awaiting Review.',
                    data: newPendingEdit,
                };
            }

            customer.set(alteration);
            await customer.save();

            return {
                message: 'Customer profile updated.',
                data: customer,
            };
        } catch (exception) {
            logger.error({ message: exception.message, meta: exception.stack });
            debug(exception);

            // Duplicate field error
            if (exception.name === 'MongoServerError') {
                let field = Object.keys(exception.keyPattern)[0];
                field = field.replace('employmentInfo.', '');
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

    delete: async function (user, id) {
        try {
            const queryParams = mongoose.isValidObjectId(id)
                ? { _id: id, lenders: user.lenderId }
                : { 'employmentInfo.ippis': id, lenders: user.lenderId };

            const deletedCustomer = await Customer.findOne(queryParams);
            if (!deletedCustomer)
                return new ServerError(404, 'Customer not found');

            deletedCustomer.removeLender(user.lenderId);

            await deletedCustomer.save();

            return {
                message: 'Customer has been deleted.',
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
