const _ = require('lodash');
const bcrypt = require('bcrypt');
const Lender = require('../models/lenderModel');
const sendOTPMail = require('../utils/sendMail');
const debug = require('debug')('app:lenderModel');
const generateOTP = require('../utils/generateOTP');
const LenderConfig = require('../models/lenderConfigModel');
const userController = require('../controllers/userController');


const lender = {
    createLender: async function (requestBody) {
        try{
            const doesExist = await Lender.findOne({ email: requestBody.email });
            if (doesExist) throw new Error('Email has already been taken');

            // Encrypting password
            const saltRounds = 10;
            const salt = await bcrypt.genSalt(saltRounds);
            const encryptedPassword = await bcrypt.hash(requestBody.password, salt);
            requestBody.password = encryptedPassword;

            requestBody.otp = generateOTP();

            // TODO: Uncomment this
            const mailResponse = await sendOTPMail(requestBody.email, requestBody.companyName, requestBody.otp.OTP);
            debug(mailResponse);
            if(mailResponse instanceof Error) {
                debug(`Error sending OTP: ${mailResponse.message}`);
                throw new Error('Error sending OTP. Try again.');
            };
            debug('Email sent successfully');

            const newLender = await Lender.create(requestBody);

            return {
                // TODO: remove otp from response
                message: 'Lender created and OTP sent to email.',
                user: _.pick(newLender, [
                    '_id',
                    'companyName',
                    'phone',
                    'email',
                    'active',
                    'balance',
                    'otp.OTP',
                    'adminUser',
                    'lenderURL',
                    'lastLoginTIme'
                ])
            };
        } catch (exception) {
            debug(exception);
            return exception;
        }
    },

    getAll: async function () {
        try{
            const lenders = await Lender.find()
                                        .select('-password -otp')
                                        .sort('companyName');
            if(lenders.length === 0) throw new Error('No lenders found');

            return lenders;
        }catch(exception) {
            debug(exception);
            return exception;
        }
    },

    getOne: async function(user, id) {
        try{
            const lender = await Lender.findOne( { _id: id, email: user.email } ).select('-password -otp');
            if(!lender) throw new Error('Lender not found');

            return lender;

        }catch(exception) {
            debug(exception);
            return exception;
        }
    },

    getSettings: async function(queryParam) {
        try{
            const lenderSettings = LenderConfig.findOne(queryParam);
            if(!lenderSettings) throw new Error('No settings for lender');

            return lenderSettings;

        }catch(exception) {
            debug(exception);
            return exception;
        }
    },

    createAdmin: async function (request) {
        try {
            const lender = await Lender.findById({_id: request.user.lenderId});
            const adminUsers = await userController.getAll({lenderId: request.user.lenderId, role: 'Admin'});

            if (adminUsers.length > 0) throw new Error('Admin user already created.');

            const adminUser = await userController.create('Admin', request.body, request.user);
            if (!adminUser || adminUser instanceof Error) {
                debug(adminUser);
                throw new Error(adminUser.message);
            }

            return adminUser;

        }catch (exception) {
            debug(exception);
            return exception;
        }
    },

    verifyLender: async function (requestBody) {
        try {
            const lender = await Lender.findOne({ email: requestBody.email });
            if(!lender) throw new Error('Invalid email or password.');

            const isValidPassword = await bcrypt.compare(requestBody.password, lender.password);
            if(!isValidPassword) throw new Error('Incorrect email or password.');

            if(lender.emailVerified) throw new Error('Email already verified.');

            if(requestBody?.otp !== lender.otp.OTP || Date.now() > lender.otp.expirationTime) throw new Error('Invalid OTP.');

            await lender.updateOne({ emailVerified: true, 'otp.OTP': null, active: true });

            return lender.generateToken();

        } catch (exception) {
            debug(exception);
            return exception;
        }
    },

    login: async function (requestBody) {
        try {
            let lender = await Lender.findOne({ email: requestBody.email });
            if(!lender) {
            debug(lender);
            throw new Error('Invalid email or password.');
            };

            const isValidPassword = await bcrypt.compare(requestBody.password, lender.password);
            if (!isValidPassword) throw new Error('Incorrect email or password.');

            const token = lender.generateToken();

            lender.token = token;
            lender = _.pick(lender, ['_id', 'companyName', 'email', 'role', 'token']);

            return lender;

        }catch (exception) {
            debug(exception);
            return exception;
        }
    },

    changePassword: async function (requestBody) {
        try{
            const lender = await Lender.findOne( { email: requestBody.email } );
            if(!lender) throw new Error('Lender not found');

            if(requestBody?.otp) {
                const isValid = lender.otp.OTP === requestBody.otp;
                if(!isValid) throw new Error('Invalid OTP');
            }

            if(requestBody.currentPassword) {
                const validPassword = await bcrypt.compare(requestBody.currentPassword, lender.password);
                if(!validPassword) throw new Error('Password is incorrect');
            };
            
            const isSimilar = await bcrypt.compare(requestBody.newPassword, lender.password);
            if(isSimilar) throw new Error('Password is too similar to old password');

            const saltRounds = 10;
            const salt = await bcrypt.genSalt(saltRounds);
            const encryptedPassword = await bcrypt.hash(requestBody.newPassword, salt);

            await lender.update( { 'otp.OTP': null, password: encryptedPassword } );

            return 'Password updated';
            
        }catch(exception) {
            debug(exception);
            return exception;
        };
    },

    update: async function (id, requestBody) {
        try{
            const lender = await Lender.findOneAndUpdate({ _id: id }, requestBody, {new: true});
            if(!lender) throw new Error('Lender not found.');

            return lender;

        }catch(exception) {
            debug(exception);
            return exception;
        }
    },

    setConfig: async function (id, requestBody) {
        try{
            requestBody.lenderId = id;

            const lenderConfig = await LenderConfig.findOneAndUpdate( { lenderId: id }, requestBody, { new: true, upsert: true });
            
            return {
                message: 'Settings have been updated',
                configuration: lenderConfig
            };

        }catch(exception) {
            debug(exception);
            return exception;
        }
    },

    sendOTP: async function(email, template) {
        try {
            const lender = await Lender.findOneAndUpdate( { email: email }, { otp: generateOTP() }, {new: true} )
                                     .select('otp')
            if(!lender) throw new Error('Lender not found');

            const mailResponse = await sendOTPMail(email, lender.companyName, lender.otp.OTP);
                debug(mailResponse);
                if(mailResponse instanceof Error) {
                    debug(`Error sending OTP: ${mailResponse.message}`);
                    throw new Error('Error sending OTP. Try again.');
                };
                debug('Email sent successfully');
            
            return {
                message: 'OTP sent to email',
                otp: lender.otp.OTP
            };

        }catch(exception) {
            debug(exception);
            return exception;
        };
    },

    delete: async function (requestBody) {
        try{
            const lender = await Lender.findOneAndDelete({email: requestBody.email});
            if (!lender) throw new Error('Lender does not exist');

            return lender;

        }catch(exception) {
            return exception;
        }
    }
};

module.exports = lender;