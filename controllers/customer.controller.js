const _ = require('lodash');
const { DateTime } = require('luxon');
const { roles } = require('../utils/constants');
const concatErrorMsg = require('../utils/concatMsg');
const Customer = require('../models/customerModel');
const customerValidators = require('../validators/customer.validator');
const debug = require('debug')('app:customerCtrl');
const filterValidator = require('../validators/filter.validator');
const flattenObject = require('../utils/flattenObj');
const Lender = require('../models/lenderModel');
const Loan = require('../models/loanModel');
const logger = require('../utils/logger')('customerCtrl.js');
const mongoose = require('mongoose');
const Origin = require('../models/origin');
const PendingEdit = require('../models/pendingEditModel');
const ServerResponse = require('../utils/ServerResponse');

const MONGO_DUPLICATE_ERROR_CODE = 11000;

class CustomerController {
    async create(user, payload) {
        const session = await mongoose.startSession();
        try {
            // Start transaction
            session.startTransaction();

            const { value: customerDto, error } =
                customerValidators.validateCreateCustomer(user, payload);
            if (error) {
                console.log(error.details[0].context);
                const errors = {};
                error.details[0].context.details.slice(1).forEach((item) => {
                    errors[item.path[0]] = this.#formatMsg(item.message);
                });
                const errorResponse = this.#concatErrorMsg(
                    error.details[0].context.message
                );
                return new ServerResponse(400, errors);
            }

            const foundLender = await Lender.findById(user.lender);
            if (!foundLender)
                return new ServerResponse(404, 'Tenant not found');
            if (!foundLender.active)
                return new ServerResponse(403, 'Tenant is yet to be activated');

            // Create new customer
            const newCustomer = new Customer(customerDto);
            await newCustomer.save();

            // Commit changes and end transaction.
            await session.commitTransaction();
            session.endSession();

            return new ServerResponse(201, 'Customer Created', newCustomer);
        } catch (exception) {
            // Abort changes and end transaction.
            await session.abortTransaction();
            session.endSession();

            logger.error({
                method: 'create',
                message: exception.message,
                meta: exception.stack,
            });
            debug(exception);
            // Duplicate field error handling
            if (exception.code === MONGO_DUPLICATE_ERROR_CODE) {
                let field = Object.keys(exception.keyPattern)[0].toUpperCase();
                field = field.replace('ACCOUNTNO', 'Account Number');
                return new ServerResponse(409, `${field} already in use.`);
            }
            // Validation error handling
            if (exception.name === 'ValidationError') {
                console.log(exception.code);
                const field = Object.keys(exception.errors)[0];
                return new ServerResponse(
                    400,
                    exception.errors[field].message.replace('Path', '')
                );
            }
            return new ServerResponse(500, 'Something went wrong');
        }
    }

    async getCustomers(user, filters) {
        try {
            const { value: validatedFilters, error } = await filterValidator(
                filters
            );
            if (error)
                return new ServerResponse(
                    400,
                    this.#formatMsg(error.details[0].message)
                );

            const queryFilter = getQueryFilter(validatedFilters);
            function getQueryFilter(filters) {
                const filter = { lender: user.lender };

                // string filter - full name
                if (filters?.name) {
                    filter.fullName = new RegExp(filters.name, 'i');
                }

                if (filters?.state)
                    filter['residentialAddress.state'] = filters.state;

                console.log();
                if (filters.segment)
                    filter['employer.segment'] = filters.segment;

                // date filter - dateOfBirth
                if (filters?.minAge) {
                    const minAge = parseInt(filters.minAge);
                    filter.dateOfBirth = {
                        $gte: DateTime.now()
                            .minus({ years: minAge })
                            .toFormat('yyyy-MM-dd'),
                    };
                }
                if (filters?.maxAge) {
                    const maxAge = parseInt(filters.maxAge);
                    const target = filter.dateOfBirth ? filter.dateOfBirth : {};
                    filter.dateOfBirth = Object.assign(target, {
                        $lte: DateTime.now()
                            .minus({ years: maxAge })
                            .toFormat('yyyy-MM-dd'),
                    });
                }

                // number filter - net pay
                if (filters?.minPay) {
                    const minNetPay = parseInt(filters.minPay);
                    filter.netPay = { $gte: minNetPay };
                }

                if (filters?.maxPay) {
                    const maxNetPay = parseInt(filters.maxPay);
                    const target = filter.netPay ? filter.netPay : {};
                    filter.netPay = Object.assign(target, {
                        $lte: maxNetPay,
                    });
                }

                return filter;
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
                        $match: queryFilter,
                    },
                    {
                        $sort: { 'name.first': 1 },
                    },
                ]);
            } else {
                foundCustomers = await Customer.find(queryFilter)
                    .select([])
                    .sort('name.first');
            }

            if (foundCustomers.length == 0)
                return new ServerResponse(404, 'No customers found');

            return new ServerResponse(200, 'Success', foundCustomers);
        } catch (exception) {
            logger.error({
                method: 'getCustomers',
                message: exception.message,
                meta: exception.stack,
            });
            debug(exception);
            return new ServerResponse(500, 'Something went wrong');
        }
    }

    async getCustomer(customerId) {
        try {
            const foundCustomer = await Customer.findById(customerId);
            if (!foundCustomer)
                return new ServerResponse(404, 'Customer not found');

            return new ServerResponse(200, 'Success', foundCustomer);
        } catch (exception) {
            logger.error({
                method: 'getCustomer',
                message: exception.message,
                meta: exception.stack,
            });
            debug(exception);
            return new ServerResponse(500, 'Something went wrong');
        }
    }

    async updateCustomer(customerId, user, alteration) {
        try {
            const { error } =
                customerValidators.validateUpdateCustomer(alteration);
            if (error)
                return new ServerResponse(
                    400,
                    this.#formatMsg(error.details[0].message)
                );

            const foundLender = await Lender.findById(user.lender);
            if (!foundLender)
                return new ServerResponse(404, 'Tenant not found');
            if (!foundLender.active)
                return new ServerResponse(403, 'Tenant is yet to be activated');

            // Flatten request body
            alteration = flattenObject(alteration);

            const foundCustomer = await Customer.findById(customerId);
            if (!foundCustomer)
                return new ServerResponse(404, 'Customer not found');

            if (user.role === roles.operations) {
                // User role is 'Operations', perform customer document update.
                foundCustomer.set(alteration);
                await foundCustomer.save();

                return new ServerResponse(
                    200,
                    'Customer data updated',
                    foundCustomer
                );
            }

            /**
             * User role is NOT 'Operations',
             * create a pending edit for the requested update.
             */
            const newPendingEdit = new PendingEdit({
                lender: user.lender,
                docId: foundCustomer._id,
                type: 'Customer',
                createdBy: user.id,
                modifiedBy: user.id,
                alteration,
            });
            await newPendingEdit.save();

            return new ServerResponse(
                200,
                'Edit request submitted. Awaiting review.'
            );
        } catch (exception) {
            logger.error({
                method: 'updateCustomer',
                message: exception.message,
                meta: exception.stack,
            });
            debug(exception);
            // Duplicate field error handling
            if (exception.code === MONGO_DUPLICATE_ERROR_CODE) {
                let field = Object.keys(exception.keyPattern)[0].toUpperCase();
                field = field.replace('ACCOUNTNO', 'Account Number');
                return new ServerResponse(409, `${field} already in use.`);
            }
            // Validation error handling
            if (exception.name === 'ValidationError') {
                console.log(exception.code);
                const field = Object.keys(exception.errors)[0];
                return new ServerResponse(
                    400,
                    exception.errors[field].message.replace('Path', '')
                );
            }

            return new ServerResponse(500, 'Something went wrong');
        }
    }

    async fetchCustomerCreation(user, fromDate) {
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
                            employer: 1,
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
    }

    async deleteCustomer(customerId) {
        try {
            const foundCustomer = await Customer.findById(customerId);
            if (!foundCustomer)
                return new ServerResponse(404, 'Customer not found');

            await foundCustomer.delete();

            return new ServerResponse(200, 'Customer profile deleted');
        } catch (exception) {
            logger.error({
                method: 'deleteCustomer',
                message: exception.message,
                meta: exception.stack,
            });
            debug(exception);
            return new ServerResponse(500, 'Something went wrong');
        }
    }

    #formatMsg(errorMsg) {
        console.log(errorMsg);
        const regex = /\B(?=(\d{3})+(?!\d))/g;
        let msg = `${errorMsg.replaceAll('"', '')}.`; // remove quotation marks.
        msg = msg.replace(regex, ','); // add comma to numbers if present in error msg.
        return msg;
    }

    #concatErrorMsg(errorMessage) {
        const unwantedTexts = [
            '"value" does not match any of the allowed types. ',
        ];
        let newErrorMsg = '';

        if (Array.isArray(errorMessage)) {
            errorMessage.forEach(
                (obj) => (newErrorMsg = newErrorMsg.concat(obj.message, '\n'))
            );
        } else {
            // Remove unwanted text
            unwantedTexts.forEach(
                (text) => (errorMessage = errorMessage.replace(text, ''))
            );

            // Split error messages.
            errorMessage = errorMessage.split('. ');

            return errorMessage.map((text) => this.#formatMsg(text));
        }
    }
}

module.exports = new CustomerController();
