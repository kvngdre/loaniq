const _ = require('lodash');
const bcrypt = require('bcrypt');
const User = require('../models/userModel');
const debug = require('debug')('app:email');
const sendOTPMail = require('../utils/sendOTPMail');
const generateOTP = require('../utils/generateOTP');



const user = {
    getAll: async function() {
        const users = await User.find().select('-password').sort('firstName');

        return users;
    },

    register: async function(requestBody) {
        try {
            // Check if user email has been registered.
            const user = await User.findOne( {email: requestBody.email} );
            if(user) throw new Error('Email has already been taken.');
            
            // Encrypting password
            const saltRounds = 10;
            const salt = await bcrypt.genSalt(saltRounds);
            const encryptedPassword = await bcrypt.hash(requestBody.password, salt);
            
            const OTP = generateOTP();

            // create new user
            const newUser = new User({
                firstName: requestBody.firstName,
                lastName: requestBody.lastName,
                middleName: requestBody.middleName,
                email: requestBody.email,
                password: encryptedPassword,
                otp: OTP
            });
                        
            // Sending OTP to user mail
            const mailResponse = await sendOTPMail(requestBody.email, requestBody.firstName, OTP);

            if(mailResponse instanceof Error) {
                debug(`Error sending OTP: ${mailResponse.message}`);
                throw new Error('Error sending OTP. Try again.');
            };

            debug('Email sent successfully');
            await newUser.save();

            return {
                message: 'User created and OTP sent to email.', 
                user: _.pick(newUser,['_id', 'firstName', 'lastName', 'email']) 
                };

        }catch(exception) {
            return exception;
        };
    },

    verifyRegister: async function (requestBody) {
        try{
            // Check if user exists
            const user = await User.findOne( {email: requestBody.email} );
            if(!user) throw new Error('Invalid email or password.');

            // Confirm password
            const isValidPassword = await bcrypt.compare(requestBody.password, user.password);
            if(isValidPassword instanceof Error) throw new Error(isValidPassword.message);

            // confirm OTP
            const isOTPValid = requestBody.otp === user.otp
            console.log(requestBody.otp);
            if(!isOTPValid) throw new Error('Invalid OTP.');

            await user.updateOne( {emailVerify: true} );

            return user.generateToken();

        }catch(exception) {
            return exception;
        };
    },

    login: async function(requestBody) {
        try{
            const user = await User.findOne( {email: requestBody.email} );
            if(!user) throw new Error('Invalid email or password.');

            const isValidPassword = await bcrypt.compare(requestBody.password, user.password);
            if(isValidPassword instanceof Error) {

                throw new Error(isValidPassword.message);
            };



        }catch(exception) {
            return exception;
        };
    },

    forgotPassword: async function(requestBody) {
        try{
            // Check if user exists
            const user = await User.findOne( {email: requestBody.email} );
            if(!user) throw new Error('Account does not exist.');

            return user;
            
        }catch(exception) {
            return exception;
        };
    },

    changePassword: async function(requestBody) {
        try{
            // Check if user exists
            const user = await User.findOne( {email: requestBody.email} );
            if(!user) throw new Error('Account does not exist.');

            
            // Encrypting password
            const saltRounds = 10;
            const salt = await bcrypt.genSalt(saltRounds);
            const encryptedPassword = await bcrypt.hash(requestBody.password, salt);
            
            // Updating password
            await user.updateOne( {password: encryptedPassword} );

            return 'Password updated.';
            
        }catch(exception) {
            return exception;
        };
    },
}

module.exports = user;
