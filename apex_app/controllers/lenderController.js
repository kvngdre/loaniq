const _ = require('lodash');
const bcrypt = require('bcrypt');
const Lender = require('../models/lenderModel');
const debug = require('debug')('app:lenderModel');
const sendOTPMail = require('../utils/sendOTPMail');
const generateOTP = require('../utils/generateOTP');
const expireOTP = require('../utils/expireOTP');
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
            
            const OTP = generateOTP();
            const expiry = expireOTP();
           
            requestBody.otpValidTime.otp = OTP; 
            requestBody.otp.expiration_time = expiry;
                     
            // // Sending OTP to user mail
            // const mailResponse = await sendOTPMail(requestBody.email, requestBody.companyName, OTP);
            // debug(mailResponse);
            // if(mailResponse instanceof Error) {
            //     debug(`Error sending OTP: ${mailResponse.message}`);
            //     throw new Error('Error sending OTP. Try again.');
            // };
            // debug('Email sent successfully');

            const newLender = await Lender.create(requestBody);
            
            return {
                message: 'Lender created and OTP sent to email.', 
                user: _.pick(newLender,['_id', 'companyName', 'phone', 'email', 'otp', 'lenderURL','expireIn']) 
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
        const lender = await Lender.findById(id)
                                   .select('-password -otp');
        if(!lender) debug(lender);

        return lender;
    },

    getSettings: async function(queryParam) {
        try{
            const lenderSettings = LenderConfig.findOne( queryParam );
            if(!lenderSettings) throw new Error('No settings for lender.');
        
            return lenderSettings;
        }catch(exception) {
            return exception;
        };
    },

    createAdmin: async function(request){
        try{
            const adminUsers = await userController.getAll( { lenderId: request.user.id, role: 'admin' } );
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
            console.log(lender)
            if(!lender) throw new Error('Invalid email or password.');

            // Confirm password
            const isValidPassword = await bcrypt.compare(requestBody.password, lender.password);
            if(!isValidPassword) throw new Error('Incorrect email or password.');

            // Check if lender already verified.
            if(lender.emailVerify) throw new Error('Email already verified.');

            //check if otp has expired
            const expiry = lender.expiration_time
            console.log(expiry)
            let currentTime = Date.now();
            const diff = expiry - currentTime;
            if(expiry < currentTime) throw new Error ('token expire');
            
            const isOTPValid = requestBody.otp === lender.otp
            if(!isOTPValid) throw new Error('Invalid OTP.');

            await lender.updateOne( {emailVerify: true, otp: null, active: true} );

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
            const lender = await Lender.findOne( {email: requestBody.email} );
            if(!lender) throw new Error('Account does not exist.');

            return lender;
            
        }catch(exception) {
            return exception;
        };
    },
    // TODO: Ensure this has been completed.
    changePassword: async function(requestBody) {
        try{
            const lender = await Lender.findOne( {email: requestBody.email} );
            if(!lender) throw new Error('Account does not exist.');
            
            // 
            const isSimilar = await bcrypt.compare(requestBody.newPassword, lender.password);
            if(isSimilar)  throw new Error('Password is too similar to old password.');

            // Encrypting password
            const saltRounds = 10;
            const salt = await bcrypt.genSalt(saltRounds);
            const encryptedPassword = await bcrypt.hash(requestBody.newPassword, salt);

            // Updating password
            await lender.updateOne( {password: encryptedPassword} );

            return 'Password updated.';
            
        }catch(exception) {
            return exception;
        };
    },

    update: async function(id, requestBody) {
        try{
            const lender = await Lender.findOneAndUpdate(
                 {_id: id}, requestBody, options={new: true}
                );
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
