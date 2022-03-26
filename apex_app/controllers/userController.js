const _ = require('lodash');
const bcrypt = require('bcrypt');
const User = require('../models/userModel');
const sendOTPMail = require('../utils/sendOTPMail');
const generateOTP = require('../utils/generateOTP');
const userDebug = require('debug')('app:userContr');
const emailDebug = require('debug')('app:userEmailContr');


const user = {
    getAll: async function() {
        return await User.find().select('-password -otp').sort('firstName');
    },

    get: async function(id) {
        return await User.findById(id).select('-password -otp');
    },

    create: async function(requestBody) {
        try {
            let role = requestBody.role;

            const users = await User.find()
            if (users.length === 0) role = "admin";

            switch(role) {
                case "admin":
                    var doesExist = await User.findOne( {email: requestBody.email} );
                    if(doesExist) throw new Error('Email has already been taken.');
                    
                    // Encrypting password
                    var saltRounds = 10;
                    var salt = await bcrypt.genSalt(saltRounds);
                    var encryptedPassword = await bcrypt.hash(requestBody.password, salt);
                    
                    var OTP = generateOTP();

                    var newUser = new User({
                        firstName: requestBody.firstName,
                        lastName: requestBody.lastName,
                        middleName: requestBody.middleName,
                        email: requestBody.email,
                        password: encryptedPassword,
                        otp: OTP,
                        role
                    });
                    break;

                case "credit":
                    var doesExist = await User.findOne( {email: requestBody.email} );
                    if(doesExist) throw new Error('Email has already been taken.');
                    
                    // Encrypting password
                    var saltRounds = 10;
                    var salt = await bcrypt.genSalt(saltRounds);
                    var encryptedPassword = await bcrypt.hash(requestBody.password, salt);
                    
                    var OTP = generateOTP();

                    var newUser = new User({
                        firstName: requestBody.firstName,
                        lastName: requestBody.lastName,
                        middleName: requestBody.middleName,
                        email: requestBody.email,
                        password: encryptedPassword,
                        otp: OTP,
                        role
                    });
                    break;

                case "operations":
                    var doesExist = await User.findOne( {email: requestBody.email} );
                    if(doesExist) throw new Error('Email has already been taken.');
                    
                    // Encrypting password
                    var saltRounds = 10;
                    var salt = await bcrypt.genSalt(saltRounds);
                    var encryptedPassword = await bcrypt.hash(requestBody.password, salt);
                    
                    var OTP = generateOTP();

                    var newUser = new User({
                        firstName: requestBody.firstName,
                        lastName: requestBody.lastName,
                        middleName: requestBody.middleName,
                        email: requestBody.email,
                        password: encryptedPassword,
                        otp: OTP,
                        role
                    });
                    break;
                
                case "loanAgent":
                        // Check if admin email has been registered.
                    var doesExist = await User.findOne( {email: requestBody.email} );
                    if(doesExist) throw new Error('Email has already been taken.');
                    
                    // Encrypting password
                    var saltRounds = 10;
                    var salt = await bcrypt.genSalt(saltRounds);
                    var encryptedPassword = await bcrypt.hash(requestBody.password, salt);
                    
                    var OTP = generateOTP();

                    var newUser = new User({
                        firstName: requestBody.firstName,
                        lastName: requestBody.lastName,
                        middleName: requestBody.middleName,
                        email: requestBody.email,
                        password: encryptedPassword,
                        otp: OTP,
                        role,
                        segments: requestBody.segments
                    });
                    break;

            };
                       
            // Sending OTP to user mail
            const mailResponse = await sendOTPMail(requestBody.email, requestBody.firstName, OTP);
            console.log(mailResponse)
            if(mailResponse instanceof Error) {
                emailDebug(`Error sending OTP: ${mailResponse.message}`);
                throw new Error('Error sending OTP. Try again.');
            };
            emailDebug('Email sent successfully');
            
            await newUser.save();

            // OTP will expire after two minutes
            // TODO: Implement OTP in user model.
            setTimeout(() => {
                newUser.otp = null;
                newUser.save();
            }, 120_000);

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
            const user = await User.findOne( {email: requestBody.email} );
            if(!user) throw new Error('Invalid email or password.');

            // Confirm password
            const isValidPassword = await bcrypt.compare(requestBody.password, user.password);
            if(isValidPassword instanceof Error) throw new Error(isValidPassword.message);

            // Check if user already verified.
            if(user.emailVerify) throw new Error('Email already verified.');

            // confirm OTP
            const isOTPValid = requestBody.otp === user.otp
            if(!isOTPValid) throw new Error('Invalid OTP.');

            await user.updateOne( {emailVerify: true, otp: null} );

            return user.generateToken();

        }catch(exception) {
            return exception;
        };
    },

    login: async function(requestBody) {
        try{
            let user = await User.findOne( {email: requestBody.email} );
            console.log(user);
            if(!user) throw new Error('Invalid email or password.');
            

            const isValidPassword = await bcrypt.compare(requestBody.password, user.password);
            if(isValidPassword instanceof Error)  throw new Error(isValidPassword.message);

            const token = user.generateToken();

            user.token = token;
            user = _.pick(user, ['_id', 'firstName', 'lastName', 'email', 'role', 'token']);

            return user;

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
    // TODO: Ensure this has been completed.
    changePassword: async function(requestBody) {
        try{
            // Check if user exists
            const user = await User.findOne( {email: requestBody.email} );
            if(!user) throw new Error('Account does not exist.');
            
            // 
            const isSimilar = await bcrypt.compare(requestBody.newPassword, user.password);
            if(isSimilar)  throw new Error('Password is too similar to old password.');

            // Encrypting password
            const saltRounds = 10;
            const salt = await bcrypt.genSalt(saltRounds);
            const encryptedPassword = await bcrypt.hash(requestBody.newPassword, salt);

            // Updating password
            await user.updateOne( {password: encryptedPassword} );

            return 'Password updated.';
            
        }catch(exception) {
            return exception;
        };
    },

    
    update: async function(id, requestBody) {
        try{
            const user = await User.findByIdAndUpdate( {_id: id}, requestBody, {new: true});
            if(!user) {
                userDebug(user);
                throw new Error('User not found.');
            };

            // TODO: how to specify if it's a delete or ADD??
            // if(requestBody.segments || requestBody.customers) {
            //     segments
            // }
            
            return user;
            
        }catch(exception) {
            return exception;
        }
    },
    
    delete: async function(id) {
        try{
            const user = await User.findById(id);
            if(!user) throw new Error('User not found.');

            if(user.customers.length > 0) {
                return 'Are you sure you want to delete?';
            };

            user.delete();
    
            return user;
    
        }catch(exception) {
            // userDebug(exception.message, exception.stack);
            return exception;
        }
    },
}

module.exports = user;
