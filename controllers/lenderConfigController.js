const Lender = require('../models/lenderModel');
const debug = require('debug')('app:configCtrl');
const Segment = require('../models/segmentModel');
const logger = require('../utils/logger')('configCtrl.js');
const LenderConfig = require('../models/lenderConfigModel');

const ctrlFuncs = {
    create: async function (user, payload) {
        try {
            const settings = new LenderConfig({});

            settings.lenderId = user.lenderId;
            settings.segments = payload.segments;
            settings.loanParams = {
                interestRate: payload.loanParams.interestRate,
                upfrontFeePercent: payload.loanParams.upfrontFeePercent,
                transferFee: payload.loanParams.transferFee,
                minNetPay: payload.loanParams.minNetPay,
                maxDti: payload.loanParams.maxDti,
            };

            await settings.save();

            return {
                message: 'Settings updated.',
                data: settings,
            };
        } catch (exception) {
            logger.error({ message: exception.message, meta: exception.stack });
            debug(exception);
            if (exception.name === 'MongoServerError')
                return {
                    errorCode: 409,
                    message: '',
                };

            if (exception.name === 'ValidationError') {
                const field = Object.keys(exception.errors)[0];
                return {
                    errorCode: 400,
                    message: exception.errors[field].message.replace(
                        'Path',
                        ''
                    ),
                };
            }

            return { errorCode: 500, message: 'Something went wrong.' };
        }
    },

    getOne: async function (id) {
        try {
            const queryParams = { lenderId: id };

            const settings = await LenderConfig.findOne(queryParams);
            if (!settings)
                return {
                    errorCode: 404,
                    message: 'No configuration settings found.',
                };

            return {
                message: 'Success',
                data: settings,
            };
        } catch (exception) {
            logger.error({ message: exception.message, meta: exception.stack });
            debug(exception);
            return { errorCode: 500, message: 'Something went wrong.' };
        }
    },

    getAll: async function () {
        try {
            const settings = await LenderConfig.find({})
                .populate({
                    path: 'lenderId',
                    model: Lender,
                })
                .sort('-createdAt');
            if (settings.length === 0)
                return {
                    errorCode: 404,
                    message: 'No lender configuration settings.',
                };
            return {
                message: 'Success',
                data: settings,
            };
        } catch (exception) {
            logger.error({ message: exception.message, meta: exception.stack });
            debug(exception);
            return { errorCode: 500, message: 'Something went wrong.' };
        }
    },

    update: async function (id, payload) {
        try {
            const settings = await LenderConfig.findOne({ lenderId: id });
            if (!settings)
                return {
                    errorCode: 404,
                    message: 'Configuration settings not found.',
                };

            if (payload.segment) {
                const isMatch = (segment) => segment.id === payload.segment.id;

                const index = settings.segments.findIndex(isMatch);
                console.log(index);

                if (index < 0) {
                    const segment = await Segment.findById(payload.segment.id);
                    if (!segment)
                        return {
                            errorCode: 400,
                            message: 'Invalid segment id.',
                        };

                    payload.maxDti
                        ? (payload.useDefault = false)
                        : (payload.useDefault = true);
                    settings.segments.push(payload.segment);
                } else {
                    Object.keys(payload.segment).forEach((key) => {
                        if (key === 'maxDti')
                            settings.segments[index]['useDefault'] = false;
                        settings.segments[index][key] = payload.segment[key];
                    });
                }
            }

            if (payload.loanParams) {
                Object.keys(payload.loanParams).forEach((key) => {
                    settings.loanParams[key] = payload.loanParams[key];
                });
            }

            await settings.save();

            return {
                message: 'Settings Updated.',
                data: settings,
            };
        } catch (exception) {
            logger.error({ message: exception.message, meta: exception.stack });
            debug(exception);
            return { errorCode: 500, message: 'Something went wrong.' };
        }
    },
};

module.exports = ctrlFuncs;
