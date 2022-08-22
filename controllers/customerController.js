const _ = require('lodash');
const mongoose = require('mongoose');
const { DateTime } = require('luxon');
const Loan = require('../models/loanModel');
const State = require('../models/stateModel');
const Segment = require('../models/segmentModel');
const debug = require('debug')('app:customerCtrl');
const Customer = require('../models/customerModel');
const convertToDotNotation = require('../utils/convertToDotNotation');
const PendingEditController = require('../controllers/pendingEditController');

const customerCtrlFuncs = {
    create: async function (request) {
        try {
            // TODO: should the net pay be read at time of creation?
            const customerExists = await Customer.findOne({
                'employmentInfo.ippis': request.body.employmentInfo.ippis,
            });
            if (customerExists)
                return {
                    errorCode: 409,
                    message: 'Duplicate Staff ID. Customer already exists',
                };

            // TODO: uncomment this later
            // request.body.passport.path = request.file.passport[0].path;
            // request.body.passport.originalName = request.file.passport[0].originalname;

            // request.body.idCard.path = request.file.idCard[0].path;
            // request.body.passport.originalName = request.file.idCard[0].originalname;

            const newCustomer = new Customer(request.body);

            await newCustomer.save();

            return {
                message: 'Customer created',
                data: newCustomer,
            };
        } catch (exception) {
            debug(exception.message);
            if (exception.code === 11000) {
                const baseString = 'Duplicate ';
                let field = Object.keys(exception.keyPattern)[0];
                if (field === 'phone') field = 'phone number';

                return { errorCode: 409, message: baseString + field };
            }
            if (exception.name === 'ValidationError') {
                exception.message = exception.message.split('>>')[1];

                return { errorCode: 400, message: exception.message };
            }
            return exception;
        }
    },

    getAll: async function (user, filters) {
        try {
            let customers = [];

            if (user.role === 'Loan Agent') {
                //TODO: What should be done here?
                // customers = await Loan.find({ loanAgent: user.id })
                //     .populate({
                //         path: 'customer',
                //         model: Customer,
                //         populate: [
                //             {
                //                 path: 'employmentInfo.segment',
                //                 model: Segment,
                //                 select: '-_id code',
                //             },
                //         ],
                //         // select: [
                //         //     'name',
                //         //     'dateOfBirth',
                //         //     'netPay',
                //         //     'employmentInfo.ippis',
                //         //     'employmentInfo.segment',
                //         //     'employmentInfo.dateOfEnlistment',
                //         // ],
                //     })
                //     .select('-_id customer')
                //     .distinct('customer');

                customers = await Loan.aggregate([
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
                            as: 'customerData',
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
            } else {
                let queryParams = _.omit(filters, [
                    'date',
                    'segments',
                    'netPay',
                    'name',
                    'states'
                ]);

                // Name filter
                if (filters.name)
                    queryParams.displayName = new RegExp(filters.name, 'i');

                // State Filter
                if (filters.states)
                    queryParams['residentialAddress.state'] = filters.states;

                // Net Pay Filter
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

                // Date Filter - CreatedAt
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
                console.log(queryParams)
                customers = await Customer.find(queryParams)
                    .select('-__v')
                    .populate('employmentInfo.segment')
                    .sort('-createdAt'); // descending order
            }

            if (customers.length == 0)
                return { errorCode: 404, message: 'No customers found' };

            return customers;
        } catch (exception) {
            debug(exception);
            return exception;
        }
    },

    getOne: async function (id) {
        try {
            const queryParams = mongoose.isValidObjectId(id)
                ? { _id: id }
                : { 'employmentInfo.ippis': id };

            const customer = await Customer.findOne(queryParams);

            if (!customer)
                return { errorCode: 404, message: 'Customer not found' };

            return customer;
        } catch (exception) {
            debug(exception);
            return exception;
        }
    },

    update: async function (customerId, user, alteration) {
        try {
            alteration = convertToDotNotation(alteration);

            const customer = await Customer.findById(customerId);
            if (!customer)
                return { errorCode: 404, message: 'Customer not found' };

            if (user.role !== 'Admin') {
                const newPendingEdit = await PendingEditController.create(
                    user,
                    customerId,
                    'Customer',
                    alteration
                );
                if (!newPendingEdit || newPendingEdit instanceof Error) {
                    debug(newPendingEdit);
                    return {
                        errorCode: 500,
                        message: 'Failed to create pending edit',
                    };
                }

                return {
                    message: 'Submitted. Awaiting Review',
                    data: newPendingEdit,
                };
            }

            customer.set(alteration);
            await customer.save();

            return {
                message: 'Customer profile updated',
                data: customer,
            };
        } catch (exception) {
            debug(exception);
            return exception;
        }
    },

    fetchCustomerCreation: async function (user, fromDate) {
        try {
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
                        customerData: {
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
            if (result.length == 0)
                return { errorCode: 404, message: 'No match for filters' };
            // TODO: improved on this message.

            return result;
        } catch (exception) {
            debug(exception);
            return exception;
        }
    },
};

module.exports = customerCtrlFuncs;
