const _ = require('lodash');
const config = require('config');
const bcrypt = require('bcrypt');
const Lender = require('../models/lenderModel');
const sendOTPMail = require('../utils/sendMail');
const debug = require('debug')('app:lenderModel');
const generateOTP = require('../utils/generateOTP');
const LenderConfig = require('../models/lenderConfigModel');
const userController = require('../controllers/userController');

const lender = {
    create: async function (requestBody) {
        try {
            const doesExist = await Lender.findOne({
                email: requestBody.email,
            });
            if (doesExist)
                return {
                    errorCode: 409,
                    message: 'Email has already been taken.',
                };

            const encryptedPassword = await bcrypt.hash(
                requestBody.password,
                config.get('salt_rounds')
            );
            requestBody.password = encryptedPassword;

            requestBody.otp = generateOTP();

            const newLender = new Lender(requestBody);
            await newLender.save();

            // Sending OTP to email.
            const mailResponse = await sendOTPMail(
                requestBody.email,
                requestBody.companyName,
                requestBody.otp.OTP
            );
            if (mailResponse instanceof Error) {
                debug(`Error sending OTP: ${mailResponse.message}`);
                return { errorCode: 502, message: 'Error sending OTP.' };
            }

            return {
                // TODO: remove otp from response
                message: 'Lender created and OTP sent to email',
                lender: _.pick(newLender, [
                    '_id',
                    'companyName',
                    'phone',
                    'email',
                    'active',
                    'emailVerified',
                    'balance',
                    'otp.OTP',
                    'adminUser',
                    'lenderURL',
                    'lastLoginTime',
                ]),
            };
        } catch (exception) {
            // TODO: handle duplicates here
            debug(exception);
            return { errorCode: 500, message: 'Something went wrong.' };
        }
    },

    getAll: async function () {
        try {
            const lenders = await Lender.find()
                .select('-password -otp')
                .sort('companyName');
            if (lenders.length === 0)
                return { errorCode: 404, message: 'No lenders found.' };

            return {
                message: 'success',
                data: lenders,
            };
        } catch (exception) {
            debug(exception);
            return { errorCode: 500, message: 'Something went wrong.' };
        }
    },

    getOne: async function (id) {
        try {
            const lender = await Lender.findById(id).select('-password -otp');
            if (!lender)
                return { errorCode: 404, message: 'Lender not found.' };

            return {
                message: 'success',
                data: lender,
            };
        } catch (exception) {
            debug(exception);
            return { errorCode: 500, message: 'Something went wrong.' };
        }
    },

    update: async function (id, alteration) {
        try {
            const lender = await Lender.findByIdAndUpdate(id, alteration, {
                new: true,
            });
            if (!lender)
                return { errorCode: 404, message: 'Lender not found.' };

            return {
                message: 'Lender Updated',
                lender,
            };
        } catch (exception) {
            debug(exception);
            return { errorCode: 500, message: 'Something went wrong.' };
        }
    },

    verifyLender: async function (requestBody) {
        try {
            const lender = await Lender.findOne({ email: requestBody.email });
            if (!lender)
                return {
                    errorCode: 404,
                    message: 'Invalid email or password.',
                };

            // Comparing passwords.
            const isValid = await bcrypt.compare(
                requestBody.password,
                lender.password
            );
            if (!isValid)
                return {
                    errorCode: 401,
                    message: 'Incorrect email or password.',
                };

            if (lender.emailVerified)
                return { errorCode: 401, message: 'Email has been verified.' };

            if (
                Date.now() > lender.otp.expires ||
                requestBody.otp !== lender.otp.OTP
            )
                return { errorCode: 401, message: 'Invalid OTP.' };

            lender._doc.token = lender.generateToken();
            await lender.updateOne({
                emailVerified: true,
                'otp.OTP': null,
                active: true,
                lastLoginTime: new Date(),
            });

            const authLender = _.omit(lender._doc, ['password', 'otp']);

            return {
                message: 'Email verified and account activated.',
                lender: authLender,
            };
        } catch (exception) {
            debug(exception);
            return { errorCode: 500, message: 'Something went wrong.' };
        }
    },

    login: async function (email, password) {
        try {
            const lender = await Lender.findOne({ email });
            if (!lender)
                return {
                    errorCode: 401,
                    message: 'Invalid email or password.',
                };

            const isValidPassword = await bcrypt.compare(
                password,
                lender.password
            );
            if (!isValidPassword)
                return {
                    errorCode: 401,
                    message: 'Invalid email or password.',
                };

            if (
                (lender.lastLoginTime === null || !lender.emailVerified) &&
                !lender.active
            ) {
                return {
                    message: 'New Lender.',
                    lender: _.omit(lender._doc, ['password', 'otp']),
                };
            }

            if (
                lender.lastLoginTime !== null &&
                lender.emailVerified &&
                !lender.active
            )
                return {
                    errorCode: 403,
                    message: 'Account inactive. Contact administrator.',
                };

            lender._doc.token = lender.generateToken();
            await lender.updateOne({ lastLoginTime: new Date() });

            const authLender = _.omit(lender._doc, ['password', 'otp']);

            return {
                message: 'Login Successful.',
                lender: authLender,
            };
        } catch (exception) {
            debug(exception);
            return { errorCode: 500, message: 'Something went wrong.' };
        }
    },

    changePassword: async function (
        email,
        newPassword,
        otp = null,
        currentPassword = null
    ) {
        try {
            const lender = await Lender.findOne({ email });
            if (!lender)
                return { errorCode: 404, message: 'Lender not found.' };

            if (
                otp &&
                (Date.now() > lender.otp.expires || otp !== lender.otp.OTP)
            )
                return { errorCode: 401, message: 'Invalid OTP.' };

            if (currentPassword) {
                const isValid = await bcrypt.compare(
                    currentPassword,
                    lender.password
                );
                if (!isValid)
                    return {
                        errorCode: 401,
                        message: 'Password is incorrect.',
                    };

                if (newPassword === currentPassword)
                    return {
                        errorCode: 400,
                        message: 'New password is too similar to old password.',
                    };
            }

            const encryptedPassword = await bcrypt.hash(
                newPassword,
                config.get('salt_rounds')
            );

            await lender.update({
                'otp.OTP': null,
                password: encryptedPassword,
            });

            return {
                message: 'Password updated.',
            };
        } catch (exception) {
            debug(exception);
            return { errorCode: 500, message: 'Something went wrong.' };
        }
    },

    createAdmin: async function (payload, user) {
        try {
            const adminUsers = await userController.getAll({
                lenderId: user.lenderId,
                role: 'Admin',
            });
            if (adminUsers.length > 0)
                return {
                    errorCode: 409,
                    message: 'Admin user already created.',
                };

            const adminUser = await userController.create(payload, user);
            if (!adminUser.hasOwnProperty('errorCode')) return adminUser;

            return {
                message: 'Admin user created.',
                data: adminUser,
            };
        } catch (exception) {
            debug(exception);
            return { errorCode: 500, message: 'Something went wrong.' };
        }
    },

    setConfig: async function (lenderId, requestBody) {
        try {
            requestBody.lenderId = lenderId;

            const lenderConfig = await LenderConfig.findOneAndUpdate(
                { lenderId },
                requestBody,
                { new: true, upsert: true }
            );

            lenderConfig.save();

            return {
                message: 'Settings have been updated.',
                configuration: lenderConfig,
            };
        } catch (exception) {
            debug(exception);
            return { errorCode: 500, message: 'Something went wrong.' };
        }
    },

    getConfig: async function (lenderId) {
        try {
            const queryParams = { lenderId };

            const configSettings = await LenderConfig.findOne(queryParams);
            if (!configSettings)
                return { errorCode: 404, message: 'No configuration settings found.' };

            return {
                message: 'Success',
                data: configSettings,
            };
        } catch (exception) {
            debug(exception);
            return { errorCode: 500, message: 'Something went wrong.' };
        }
    },

    sendOTP: async function (email, template) {
        try {
            const lender = await Lender.findOneAndUpdate(
                { email: email },
                { otp: generateOTP() },
                { new: true }
            ).select('email otp');
            if (!lender)
                return { errorCode: 404, message: 'Lender not found.' };

            const mailResponse = await sendOTPMail(
                email,
                lender.companyName,
                lender.otp.OTP
            );
            if (mailResponse instanceof Error) {
                debug(`Error sending OTP: ${mailResponse.message}`);
                return { errorCode: 502, message: 'Error sending OTP.' };
            }

            return {
                message: 'OTP has been sent to your email.',
                data: {
                    otp: lender.otp.OTP,
                    email: lender.email,
                },
            };
        } catch (exception) {
            debug(exception);
            return { errorCode: 500, message: 'Something went wrong.' };
        }
    },

    // delete: async function (requestBody) {
    //     try{
    //         const lender = await Lender.findOneAndDelete({email: requestBody.email});
    //         if (!lender) throw new Error('Lender does not exist');

    //         return lender;

    //     }catch(exception) {
    //         return { errorCode: 500, message: 'Something went wrong.' };
    //     }
    // }
};

module.exports = lender;
