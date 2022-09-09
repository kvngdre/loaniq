const _ = require('lodash');
const mongoose = require('mongoose');
const { DateTime } = require('luxon');
const Loan = require('../models/loan');
const State = require('../models/state');
const Segment = require('../models/segment');
const debug = require('debug')('app:customerCtrl');
const Customer = require('../models/customer');
const logger = require('../utils/logger')('customerCtrl.js');
const originController = require('../controllers/originController');
const convertToDotNotation = require('../utils/convertToDotNotation');
const PendingEditController = require('../controllers/pendingEditController');

const ctrlFuncs = {
    create: async function (user, payload) {
        try {
            // TODO: uncomment this later
            // payload.passport.path = request.file.passport[0].path;
            // payload.passport.originalName = request.file.passport[0].originalname;

            // payload.idCard.path = request.file.idCard[0].path;
            // payload.passport.originalName = request.file.idCard[0].originalname;

            const queryParams = {
                'employmentInfo.ippis': payload.employmentInfo.ippis,
            };

            let customer = await Customer.findOne(queryParams);

            if (!customer) customer = new Customer(payload);
            else {
                // Update info
                customer.set({
                    contactInfo: payload.contactInfo,
                    residentialAddress: payload.residentialAddress,
                    maritalStatus: payload.maritalStatus,
                    'employmentInfo.companyLocation':
                        payload.employmentInfo.companyLocation,
                });
            }
            customer.addLender(user.lenderId);

            // TODO: uncomment this later
            // const originCopy = await originController.getOne({ippis: payload.employmentInfo.ippis});
            // if(originCopy.hasOwnProperty('errorCode')) return { errorCode: 404, message: 'Could not find Origin copy.'};
            // customer.netPay.value = originCopy.netPays[0];

            await customer.save();

            return {
                message: 'Customer Created.',
                data: customer,
            };
        } catch (exception) {
            logger.error({ message: exception.message, meta: exception.stack });
            debug(exception);
            if (exception.name === 'MongoServerError') {
                let field = Object.keys(exception.keyPattern)[0];
                field = field.replace('employmentInfo.', '');
                field = field.charAt(0).toUpperCase() + field.slice(1);
                if (field === 'Phone') field = 'Phone number';

                return {
                    errorCode: 409,
                    message: field + ' has already been taken.',
                };
            }

            if (exception.name === 'ValidationError') {
                const field = Object.keys(exception.errors)[0];
                return {
                    errorCode: 400,
                    message: exception.errors[field].message,
                };
            }

            return { errorCode: 500, message: 'Something went wrong.' };
        }
    },

    getAll: async function (user, filters) {
        try {
            let customers = [];

            if (user.role === 'Loan Agent') {
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

                // Name filter
                if (filters.name)
                    queryParams.displayName = new RegExp(filters.name, 'i');

                // State Filter
                if (filters.states)
                    queryParams['residentialAddress.state'] = filters.states;

                // Amount Filter - Net Pay
                if (filters.netPay?.start)
                    queryParams['netPay.value'] = {
                        $gte: filters.netPay.start,
                    };
                if (filters.netPay?.end) {
                    const target = queryParams['netPay.value']
                        ? queryParams['netPay.value']
                        : {};

                    queryParams['netPay.value'] = Object.assign(target, {
                        $lte: filters.netPay.end,
                    });
                }

                // Segment Filter
                if (filters.segments)
                    queryParams['employmentInfo.segment'] = filters.segments;

                // Date Filter - createdAt
                const dateField = 'createdAt';
                if (filters.date?.start)
                    queryParams[dateField] = {
                        $gte: DateTime.fromISO(filters.start)
                            .setZone(user.timeZone)
                            .toUTC(),
                    };
                if (filters.date?.end) {
                    const target = queryParams[dateField]
                        ? queryParams[dateField]
                        : {};
                    queryParams[dateField] = Object.assign(target, {
                        $lte: DateTime.fromISO(filters.end)
                            .setZone(user.timeZone)
                            .toUTC(),
                    });
                }

                customers = await Customer.find(queryParams)
                    .populate('employmentInfo.segment')
                    .sort('-createdAt'); // descending order
            }

            if (customers.length == 0)
                return { errorCode: 404, message: 'No customers found.' };

            return {
                message: 'Success',
                data: customers,
            };
        } catch (exception) {
            logger.error({ message: exception.message, meta: exception.stack });
            debug(exception);
            return { errorCode: 500, message: 'Something went wrong.' };
        }
    },

    getOne: async function (id, user) {
        try {
            const queryParams = mongoose.isValidObjectId(id)
                ? { _id: id, lenders: user.lenderId }
                : { 'employmentInfo.ippis': id, lenders: user.lenderId };

            const customer = await Customer.findOne(queryParams);
            if (!customer)
                return { errorCode: 404, message: 'Customer not found.' };

            return {
                message: 'success',
                data: customer,
            };
        } catch (exception) {
            logger.error({ message: exception.message, meta: exception.stack });
            debug(exception);
            return { errorCode: 500, message: 'Something went wrong.' };
        }
    },

    update: async function (id, user, alteration) {
        try {
            alteration = convertToDotNotation(alteration);

            const queryParams = { _id: id, lenders: user.lenderId };

            const customer = await Customer.findOne(queryParams);
            if (!customer)
                return { errorCode: 404, message: 'Customer not found.' };

            if (user.role !== 'Admin') {
                const newPendingEdit = await PendingEditController.create(
                    user,
                    id,
                    'Customer',
                    alteration
                );
                if (newPendingEdit.errorCode) {
                    debug(newPendingEdit);
                    return {
                        errorCode: 500,
                        message: 'Failed to create pending edit.',
                    };
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
            return { errorCode: 500, message: 'Something went wrong.' };
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

            const customer = await Customer.findOne(queryParams);
            if (!customer)
                return { errorCode: 404, message: 'Customer not found.' };

            customer.removeLender(user.lenderId);

            await customer.save();

            return {
                message: 'Customer has been deleted.',
            };
        } catch (exception) {
            logger.error({ message: exception.message, meta: exception.stack });
            debug(exception);
            return { errorCode: 500, message: 'Something went wrong.' };
        }
    },
};

module.exports = ctrlFuncs;
