const _ = require('lodash');
const bcrypt = require('bcrypt');
const Lender = require('../models/lenderModel');
const sendOTPMail = require('../utils/sendMail');
const debug = require('debug')('app:lenderModel');
const generateOTP = require('../utils/generateOTP');
const LenderConfig = require('../models/lenderConfigModel');
const userController = require('../controllers/userController');


const lender = {
    
    createLender: async function(requestBody) {
        try{
            const doesExist = await Lender.findOne( { email: requestBody.email } );
            if(doesExist) throw new Error('Email has already been taken.');

            // Encrypting password
            const saltRounds = 10;
            const salt = await bcrypt.genSalt(saltRounds);
            const encryptedPassword = await bcrypt.hash(requestBody.password, salt);
            requestBody.password = encryptedPassword;
            
            requestBody.otp = generateOTP(); 
            
            // TODO: Uncomment this
            // // Sending OTP to user mail
            // const mailResponse = await sendOTPMail(requestBody.email, requestBody.companyName, otpObj.OTP);
            // debug(mailResponse);
            // if(mailResponse instanceof Error) {
            //     debug(`Error sending OTP: ${mailResponse.message}`);
            //     throw new Error('Error sending OTP. Try again.');
            // };
            // debug('Email sent successfully');

            const newLender = await Lender.create(requestBody);
            
            return {
                // TODO: remove otp from response
                message: 'Lender created and OTP sent to email.', 
                user: _.pick(newLender,['_id', 'companyName', 'phone', 'email', 'otp.OTP', 'lenderURL']) 
            };

        }catch(exception) {
            return exception;
        };
    },

    getAll: async function() {
        return await Lender.find()
                           .select('-password -otp')
                           .sort('companyName');
    },

    get: async function(id) {
        return await Lender.findById(id).select('-password -otp');
    },

    getSettings: async function(queryParam) {
        try{
            const lenderSettings = LenderConfig.findOne( queryParam );
            if(!lenderSettings) throw new Error('No settings for lender');
        
            return lenderSettings;

        }catch(exception) {
            return exception;
        };
    },

    createAdmin: async function(request){
        try{
            const adminUsers = await userController.getAll( { lenderId: request.user.lenderId, role: 'admin' } );
            if(adminUsers.length > 0) throw new Error('Admin user already created.')

            const adminUser = await userController.create('admin', request.body, request.user);
            if(!adminUser || adminUser instanceof Error) {
                debug(adminUser);
                throw new Error(adminUser.message);
            };

            return adminUser;

        }catch(exception) {
            return exception;
        }
    },

    verifyRegister: async function (requestBody) {
        try{
            const lender = await Lender.findOne( { email: requestBody.email,} );
            if(!lender) throw new Error('Invalid email or password.');

            const isValidPassword = await bcrypt.compare(requestBody.password, lender.password);
            if(!isValidPassword) throw new Error('Incorrect email or password.');

            if(lender.emailVerify) throw new Error('Email already verified.');

            if(requestBody?.otp !== lender.otp.OTP || Date.now() > lender.otp.expirationTime) throw new Error('Invalid OTP.');
            
            await lender.updateOne( { emailVerify: true, 'otp.OTP': null, active: true } );

            return lender.generateToken();

        }catch(exception) {
            return exception;
        };
    },

    login: async function(requestBody) {
        try{
            let lender = await Lender.findOne( { email: requestBody.email } );
            if(!lender) {
                debug(lender);
                throw new Error('Invalid email or password.');
            };
            
            const isValidPassword = await bcrypt.compare(requestBody.password, lender.password);
            if(!isValidPassword)  throw new Error('Incorrect email or password.');

            const token = lender.generateToken();

            lender.token = token;
            lender = _.pick(lender, ['_id', 'companyName', 'email', 'role', 'token']);

            return lender;

        }catch(exception) {
            return exception;
        };
    },

    forgotPassword: async function(requestBody) {
        try{
            const lender = await Lender.findOneAndUpdate( {email: requestBody.email}, {otp: generateOTP()}, {new: true} ).select('password');
            if(!lender) throw new Error('Lender not found.');

            const mailResponse = await sendOTPMail(lender.email, lender.companyName, lender.otp.OTP);
            debug(mailResponse);
            if(mailResponse instanceof Error) {
                userDebug(`Error sending OTP: ${mailResponse.message}`);
                throw new Error('Error sending OTP. Try again.');
            };
            debug('Email sent successfully');

            return lender;
            
        }catch(exception) {
            return exception;
        };
    },
    // TODO: Ensure this has been completed.
    changePassword: async function(requestBody) {
        try{
            const lender = await Lender.findOne( { email: requestBody.email } );
            if(!lender) throw new Error('Lender not found.');

            if(requestBody?.otp !== lender.otp.OTP || Date.now() > lender.otp.expirationTime) throw new Error('Invalid OTP.');

            if(requestBody.currentPassword) {
                const validPassword = await bcrypt.compare(requestBody.currentPassword, lender.password);
                if(!validPassword)  throw new Error('Password is incorrect.');
            };
            
            const isSimilar = await bcrypt.compare(requestBody.newPassword, lender.password);
            if(isSimilar)  throw new Error('Password is too similar to old password.');

            const saltRounds = 10;
            const salt = await bcrypt.genSalt(saltRounds);
            const encryptedPassword = await bcrypt.hash(requestBody.newPassword, salt);

            await lender.updateOne( { 'otp.OTP': null, password: encryptedPassword } );

            return 'Password updated.';
            
        }catch(exception) {
            return exception;
        };
    },

    update: async function(id, requestBody) {
        try{
            const lender = await Lender.findOneAndUpdate( {_id: id}, requestBody, {new: true} );
            if(!lender) throw new Error('Lender not found.');

            return lender;

        }catch(exception) {
            return exception;
        };
    },

    setConfig: async function(id, requestBody) {
        try{
            requestBody.lenderId = id;
            const lenderConfig = await LenderConfig.findOneAndUpdate( { lenderId: id }, requestBody, { new: true, upsert: true } );
            
            return lenderConfig;

        }catch(exception) {
            return exception;
        };
    },

    delete: async function(requestBody) {
        try{
            const lender = await Lender.findOneAndDelete( {email: requestBody.email} );
            if(!lender) throw new Error('Lender does not exist.');

            return lender;

        }catch(exception) {
            return exception;
        };
    }
}

module.exports = lender;
