const _ = require('lodash')
const config = require('config')
const bcrypt = require('bcrypt');
const Lender = require('../models/lenderModel');
const sendOTPMail = require('../utils/sendMail');
const debug = require('debug')('app:lenderModel');
const generateOTP = require('../utils/generateOTP');
const LenderConfig = require('../models/lenderConfigModel');
const userController = require('../controllers/userController');


const lender = {
    create: async function(requestBody) {
        try{
            const doesExist = await Lender.findOne({ email: requestBody.email });
            if(doesExist) throw new Error('Email has already been taken');

            const encryptedPassword = await bcrypt.hash(requestBody.password, config.get('salt_rounds'));
            requestBody.password = encryptedPassword;

            requestBody.otp = generateOTP();
            
            const newLender = new Lender(requestBody);
            await newLender.save();

            // const mailResponse = await sendOTPMail(requestBody.email, requestBody.companyName, requestBody.otp.OTP);
            // if(mailResponse instanceof Error) {
            //     debug(`Error sending OTP: ${mailResponse.message}`);
            //     throw new Error('Error sending OTP. Try again.');
            // };

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
                    'lastLoginTImeTZAdjusted'
                ])
            };
        }catch(exception) {
            // TODO: handle duplicates here
            debug(exception);
            return exception;
        }
    },

    getAll: async function() {
        try{
            const lenders = await Lender.find()
                                        .select('-password -otp')
                                        .sort('companyName');
            if(lenders.length === 0) throw new Error('No lenders found');

            return lenders;

        }catch(exception) {
            debug(exception)
            return exception;
        };
    },

    getOne: async function(id) {
        try{
            const lender = await Lender.findById(id)
                                       .select('-password -otp')
            if(!lender) throw new Error('Lender not found');

            return lender;

        }catch(exception) {
            debug(exception)
            return exception;
        };
    },

    update: async function (id, alteration) {
        try{
            const lender = await Lender.findByIdAndUpdate(id, alteration, {new: true})
            if(!lender) throw new Error('Lender not found.');

            return {
                message: 'Lender Updated',
                lender
            };

        }catch(exception) {
            debug(exception)
            return exception;
        };
    },

    verifyLender: async function (requestBody) {
        try {
            const lender = await Lender.findOne({ email: requestBody.email });
            if(!lender) throw new Error('Invalid email or password');

            const isValidPassword = await bcrypt.compare(requestBody.password, lender.password);
            if(!isValidPassword) throw new Error('Incorrect email or password');

            if(lender.emailVerified) throw new Error('Email has been verified');

            if( (Date.now() > lender.otp.expirationTime) || (requestBody.otp !== lender.otp.OTP) ) throw new Error('Invalid OTP');

            lender._doc.token = lender.generateToken()
            await lender.updateOne({ emailVerified: true, 'otp.OTP': null, active: true, lastLoginTime: new Date() })

            const authLender = _.omit(lender._doc, ['password', 'otp'])

            return {
                message: 'Email verified and account activated',
                lender: authLender
            };

        } catch (exception) {
            debug(exception)
            return exception;
        }
    },

    login: async function (email, password) {
        try {
            const lender = await Lender.findOne({ email })
            if(!lender) throw new Error('Invalid email or password.');

            const isValidPassword = await bcrypt.compare(password, lender.password)
            if (!isValidPassword) throw new Error('Invalid email or password.');

            if((lender.lastLoginTime === null || !lender.emailVerified) && !lender.active) {
                return {
                    message: 'New Lender',
                    lender: _.omit(lender._doc, ['password', 'otp'])
                };
            };

            if(lender.lastLoginTime !== null && lender.emailVerified && !lender.active) throw new Error('Account inactive. Contact administrator');

            lender._doc.token = lender.generateToken();
            await lender.updateOne( { lastLoginTime: new Date() } )


            const authLender = _.omit(lender._doc, ['password', 'otp'])

            return {
                message: 'Login Successful',
                lender: authLender
            };

        }catch (exception) {
            debug(exception)
            return exception;
        }
    },

    changePassword: async function(email, newPassword, otp=null, currentPassword=null) {
        try{
            const lender = await Lender.findOne( { email } )
            if(!lender) throw new Error('Lender not found');

            if(otp && ( (Date.now() > user.otp.expirationTime) || (otp !== user.otp.OTP) ) ) throw new Error('Invalid OTP');

            if(currentPassword) {
                const isValid = await bcrypt.compare(currentPassword, lender.password);
                if(!isValid) throw new Error('Password is incorrect');

                if(newPassword === currentPassword) throw new Error('New password is too similar to old password');
            };
            
            const encryptedPassword = await bcrypt.hash(newPassword, config.get('salt_rounds'));

            await lender.update( { 'otp.OTP': null, password: encryptedPassword } );

            return 'Password updated';
            
        }catch(exception) {
            debug(exception)
            return exception;
        };
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

    sendOTP: async function(email, template) {
        try{
            const lender = await Lender.findOneAndUpdate( { email: email }, { otp: generateOTP() }, {new: true} )
                                       .select('email otp')
            if(!lender) throw new Error('Lender not found');

            const mailResponse = await sendOTPMail(email, lender.companyName, lender.otp.OTP);
            if(mailResponse instanceof Error) {
                debug(`Error sending OTP: ${mailResponse.message}`);
                throw new Error('Error sending OTP. Try again.');
            };

            return {
                message: 'OTP sent to email',
                otp: lender.otp.OTP,
                email: lender.email
            };

        }catch(exception) {
            debug(exception)
            return exception;
        };
    },

    // delete: async function (requestBody) {
    //     try{
    //         const lender = await Lender.findOneAndDelete({email: requestBody.email});
    //         if (!lender) throw new Error('Lender does not exist');

    //         return lender;

    //     }catch(exception) {
    //         return exception;
    //     }
    // }
};

module.exports = lender;