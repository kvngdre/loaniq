const _ = require('lodash');
const mongoose = require('mongoose');
const { DateTime } = require('luxon');
const Origin = require('../models/origin');
const debug = require('debug')('app:OriginCtrl');
const logger = require('../utils/logger')('originCtrl.js');

const origin = {
    create: async function (payload) {
        try {
            const staff = new Origin(payload);

            await staff.save();

            return {
                message: 'Staff record created.',
                data: staff,
            };
        } catch (exception) {
            logger.error({ message: exception.message, meta: exception.stack });
            debug(exception);
            if (exception.name === 'MongoServerError') {
                let field = Object.keys(exception.keyPattern)[0];
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

            return { errorCode: 500, message: exception.message };
        }
    },

    update: async function (id, alteration) {
        try {
            const queryParams = mongoose.isValidObjectId(id)
                ? { _id: id }
                : { ippis: id };

            const staff = await Origin.findOne(queryParams);
            if (!staff) return { errorCode: 404, message: 'Staff not found.' };

            staff.set(alteration);

            await staff.save();

            return {
                message: 'Staff record updated.',
                data: staff,
            };
        } catch (exception) {
            logger.error({ message: exception.message, meta: exception.stack });
            debug(exception);
            if (exception.name === 'MongoServerError') {
                let field = Object.keys(exception.keyPattern)[0];
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

            return { errorCode: 500, message: exception.message };
        }
    },

    getOne: async function (id) {
        try {
            const queryParams = mongoose.isValidObjectId(id)
                ? { _id: id }
                : { ippis: id };

            const staff = await Origin.findOne(queryParams);
            if (!staff) return { errorCode: 404, message: 'Staff not found.' };

            return {
                message: 'Success',
                data: staff,
            };
        } catch (exception) {
            logger.error({ message: exception.message, meta: exception.stack });
            debug(exception);
            return { errorCode: 500, message: exception.message };
        }
    },

    getAll: async function (filters) {
        try {
            const queryParams = Object.assign(
                {},
                _.omit(filters, ['age', 'yearsServed', 'netPay', 'name'])
            );

            // Name filter
            if (filters.name) queryParams.name = new RegExp(filters.name, 'gi');

            // Amount Filter - Net Pay
            if (filters.netPay?.min)
                queryParams['netPays.0'] = {
                    $gte: filters.netPay.min,
                };
            if (filters.netPay?.max) {
                const target = queryParams['netPays.0']
                    ? queryParams['netPays.0']
                    : {};

                queryParams['netPays.0'] = Object.assign(target, {
                    $lte: filters.netPay.max,
                });
            }

            // Date Filter - Date of Birth
            if (filters.age?.min)
                queryParams['dateOfBirth'] = {
                    $lte: DateTime.now()
                        .minus({ years: filters.age.min })
                        .toFormat('yyyy'),
                };
            console.log(queryParams);
            if (filters.age?.max) {
                const target = queryParams['dateOfBirth']
                    ? queryParams['dateOfBirth']
                    : {};
                console.log(target);
                queryParams['dateOfBirth'] = Object.assign(target, {
                    $gte: DateTime.now()
                        .minus({ years: filters.age.max })
                        .toFormat('yyyy'),
                });
            }

            // Date Filter - Date of Enlistment
            if (filters.yearsServed?.min)
                queryParams['dateOfEnlistment'] = {
                    $lte: DateTime.now()
                        .minus({ years: filters.yearsServed.min })
                        .toFormat('yyyy'),
                };
            if (filters.yearsServed?.max) {
                const target = queryParams['dateOfEnlistment']
                    ? queryParams['dateOfEnlistment']
                    : {};
                queryParams['dateOfEnlistment'] = Object.assign(target, {
                    $gte: DateTime.now()
                        .minus({ years: filters.yearsServed.max })
                        .toFormat('yyyy'),
                });
            }

            const staff = await Origin.find(queryParams);
            if (staff.length === 0)
                return {
                    errorCode: 404,
                    message: 'No staff found/match filter.',
                };

            return {
                message: 'Success',
                data: staff,
            };
        } catch (exception) {
            logger.error({ message: exception.message, meta: exception.stack });
            debug(exception);
            return { errorCode: 500, message: exception.message };
        }
    },

    delete: async function (id) {
        try {
            const queryParams = mongoose.isValidObjectId(id)
                ? { _id: id }
                : { ippis: id };

            const staff = await Origin.findOne(queryParams);
            if (!staff)
                return {
                    errorCode: 404,
                    message: 'Customer not found in origin.',
                };

            await staff.delete();

            return {
                message: 'Staff record Deleted.',
            };
        } catch (exception) {
            logger.error({ message: exception.message, meta: exception.stack });
            debug(exception);
            return { errorCode: 500, message: exception.message };
        }
    },
};

// const foundOrigin = await Origin.findOne({ ippis: ippis, bvn: foundCustomer.bvn });
//             if(foundOrigin) {
//                 const { accountNumber, bank, command, dateOfBirth, dateOfEnlistment, netPays } = foundOrigin;
//                 if(accountNumber !== null && accountNumber.length == 10) foundCustomer.accountInfo.accountNumber = accountNumber;
//                 if(bank !== null) foundCustomer.accountInfo.bank = bank;
//                 if(command !== null) foundCustomer.employmentInfo.command = command;
//                 // if(dateOfBirth !== null) foundCustomer.dateOfBirth = dateOfBirth;
//                 // if(dateOfEnlistment !== null) foundCustomer.employmentInfo.dateOfEnlistment = dateOfEnlistment;
//                 if(netPays.at(-1) !== null) foundCustomer.netPay = netPays.at(-1);
//             }else{
//                 logger.info({
//                     method: 'create',
//                     message: 'customer not found in origin',
//                     meta: foundCustomer
//                 });
//                 debug('Failed to find origin');
//             }
//             const foundOrigin = await Origin.findOne({ ippis: ippis, bvn: foundCustomer.bvn });
//             if(foundOrigin) {
//                 const { accountNumber, bank, command, dateOfBirth, dateOfEnlistment, netPays } = foundOrigin;
//                 if(accountNumber !== null && accountNumber.length == 10) foundCustomer.accountInfo.accountNumber = accountNumber;
//                 if(bank !== null) foundCustomer.accountInfo.bank = bank;
//                 if(command !== null) foundCustomer.employmentInfo.command = command;
//                 // if(dateOfBirth !== null) foundCustomer.dateOfBirth = dateOfBirth;
//                 // if(dateOfEnlistment !== null) foundCustomer.employmentInfo.dateOfEnlistment = dateOfEnlistment;
//                 if(netPays.at(-1) !== null) foundCustomer.netPay = netPays.at(-1);
//             }else{
//                 logger.info({
//                     method: 'create',
//                     message: 'customer not found in origin',
//                     meta: foundCustomer
//                 });
//                 debug('Failed to find origin');
//             }

module.exports = origin;
