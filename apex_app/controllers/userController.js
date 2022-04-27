require('dotenv').config();
const _ = require('lodash');
const bcrypt = require('bcrypt');
const User = require('../models/userModel');
const Segment = require('../models/segmentModel');
const sendOTPMail = require('../utils/sendOTPMail');
const generateOTP = require('../utils/generateOTP');
const userDebug = require('debug')('app:userContr');
const ObjectId = require('mongoose').Types.ObjectId;
const generateRandomPassword = require('../utils/generatePassword');


const user = {
    getAll: async function(queryParam={}) {
        return await User.find(queryParam)
                          .select('-password -otp')
                          .sort('name.firstName');
    },

    get: async function(queryParam) {
        const user = await User.findOne( queryParam ).select('-password -otp');
        if(!user) userDebug(user);

        return user;
    },

    /**
     *  function creates a user.
     * @param {object} requestBody 
     * @param {object} user 
     * @returns new user
     */
    create: async function(role, requestBody, user) {
        try {
            // let role = requestBody.role;
            const allSegments = await Segment.find().select('_id')

            switch(role) {
                case "admin":
                    if(user.role !== 'lender') return 401;

                    var adminDoesExist = await User.findOne( { lenderId: user.lenderId, email: requestBody.email } );
                    if(adminDoesExist) throw new Error('Admin user has been created.');
                    
                    // Encrypting password
                    var temporaryPassword = generateRandomPassword();
                    var saltRounds = 10;
                    var salt = await bcrypt.genSalt(saltRounds);
                    var encryptedPassword = await bcrypt.hash(requestBody.password, salt);
                    
                    var OTP = generateOTP();
                    // TODO: gen random password.

                    var newUser = new User({
                        name: requestBody.name,
                        phone: requestBody.phone,
                        email: requestBody.email,
                        password: encryptedPassword,
                        otp: OTP,
                        role,
                        active: requestBody.active,
                        lenderId: user.lenderId
                    });
                    break;

                case "credit":
                    var doesExist = await User.findOne( { lenderId: user.lenderId, email: requestBody.email } );
                    if(doesExist) throw new Error('Email has already been taken.');
                    
                    // Encrypting password
                    var temporaryPassword = generateRandomPassword();
                    var saltRounds = 10;
                    var salt = await bcrypt.genSalt(saltRounds);
                    var encryptedPassword = await bcrypt.hash(temporaryPassword, salt);
                    
                    var OTP = generateOTP();

                    var newUser = new User({
                        name: requestBody.name,
                        phone: requestBody.phone,
                        email: requestBody.email,
                        password: encryptedPassword,
                        otp: OTP,
                        role,
                        active: requestBody.active,
                        segments: !requestBody.segments ? allSegments : requestBody.segments,
                        lenderId: user.lenderId
                    });
                    break;

                case "operations":
                    var doesExist = await User.findOne( { lenderId: user.lenderId, email: requestBody.email } );
                    if(doesExist) throw new Error('Email has already been taken.');
                    
                    // Encrypting password
                    var temporaryPassword = generateRandomPassword();
                    var saltRounds = 10;
                    var salt = await bcrypt.genSalt(saltRounds);
                    var encryptedPassword = await bcrypt.hash(requestBody.password, salt);
                    
                    var OTP = generateOTP();

                    var newUser = new User({
                        name: requestBody.name,
                        phone: requestBody.phone,
                        email: requestBody.email,
                        password: encryptedPassword,
                        otp: OTP,
                        role,
                        active: requestBody.active,
                        lenderId: user.lenderId
                    });
                    break;
                
                case "loanAgent":
                    // Check if admin email has been registered.
                    var doesExist = await User.findOne( { lenderId: user.lenderId, email: requestBody.email } );
                    if(doesExist) throw new Error('Email has already been taken.');
                    
                    // Encrypting password
                    var temporaryPassword = generateRandomPassword();
                    var saltRounds = 10;
                    var salt = await bcrypt.genSalt(saltRounds);
                    var encryptedPassword = await bcrypt.hash(requestBody.password, salt);
                    
                    var OTP = generateOTP();

                    var newUser = new User({
                        name: requestBody.name,
                        phone: requestBody.phone,
                        email: requestBody.email,
                        password: encryptedPassword,
                        otp: OTP,
                        role,
                        active: requestBody.active,
                        segments: requestBody.segments === 'all' ? allSegments : requestBody.segments,
                        target: requestBody.target,
                        lenderId: user.lenderId
                    });
                    break;
            };

            // await newUser.save();
            newUser.password = temporaryPassword;
                       
            // Sending OTP to user mail
            // const mailResponse = await sendOTPMail(requestBody.email, requestBody.name.firstName, OTP);
            // userDebug(mailResponse);
            // if(mailResponse instanceof Error) {
            //     userDebug(`Error sending OTP: ${mailResponse.message}`);
            //     throw new Error('Error sending OTP. Try again.');
            // };
            // userDebug('Email sent successfully');
            
            // OTP will expire after two minutes
            // TODO: Implement OTP in user model.
            setTimeout(() => {
                newUser.otp = null;
                newUser.save();
            }, 120_000);

            return {
                message: 'User created and OTP sent to email.', 
                // user: _.pick(newUser,['_id', 'name.firstName', 'name.lastName', 'password', 'email', 'role']) 
                user: newUser
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
            if(!isValidPassword) throw new Error('Incorrect email or password.');

            // Check if user already verified.
            if(user.emailVerify) throw new Error('Email already verified.');

            // confirm OTP
            const isOTPValid = requestBody.otp === user.otp
            if(!isOTPValid) throw new Error('Invalid OTP.');

            await user.updateOne( {emailVerify: true, otp: null, active: true} );

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
            if(!isValidPassword)  throw new Error('Incorrect email or password.');

            if(!user.lastLoginTime) console.log(user.lastLoginTime)

            const token = user.generateToken();

            user.token = token;
            authUser = _.pick(user, ['_id', 'firstName', 'lastName', 'email', 'role', 'lastLoginTime', 'token']);

            await user.update({lastLoginTime: Date.now()});

            return authUser;

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
            await user.updateOne({password: encryptedPassword});

            return 'Password updated.';
            
        }catch(exception) {
            return exception;
        };
    },

    
    update: async function(id, requestUser, requestBody) {
        try{
            const user = await User.findByIdAndUpdate( { _id: id, lenderId: requestUser.lenderId  }, requestBody, {new: true});
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

            // if(user.customers.length > 0) {
            //     return 'Are you sure you want to delete?';
            // };

            user.deleteOne();
    
            return user;
    
        }catch(exception) {
            // userDebug(exception.message, exception.stack);
            return exception;
        }
    },
}

module.exports = user;
