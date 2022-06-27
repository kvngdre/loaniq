const _ = require('lodash');
const bcrypt = require('bcrypt');
const User = require('../models/userModel');
const sendOTPMail = require('../utils/sendMail');
const Segment = require('../models/segmentModel');
const userDebug = require('debug')('app:userCtrl');
const generateOTP = require('../utils/generateOTP');
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
     * @param {string} role
     * @param {object} requestBody 
     * @param {object} user 
     * @returns new user
     */
    create: async function(role, requestBody, user) {
        try {
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
                    var encryptedTempPassword = await bcrypt.hash(temporaryPassword, salt);

                    var newUser = new User({
                        name: requestBody.name,
                        displayName: requestBody?.displayName,
                        phone: requestBody.phone,
                        email: requestBody.email,
                        password: encryptedTempPassword,
                        otp: generateOTP(),
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

                    var newUser = new User({
                        name: requestBody.name,
                        displayName: requestBody?.displayName,
                        phone: requestBody.phone,
                        email: requestBody.email,
                        password: encryptedPassword,
                        otp: generateOTP(),
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
                    var encryptedPassword = await bcrypt.hash(temporaryPassword, salt);
                    
                    var newUser = new User({
                        name: requestBody.name,
                        displayName: requestBody?.displayName,
                        phone: requestBody.phone,
                        email: requestBody.email,
                        password: encryptedPassword,
                        otp: generateOTP(),
                        role,
                        active: requestBody.active,
                        lenderId: user.lenderId
                    });
                    break;
                
                case "loanAgent":
                    var doesExist = await User.findOne( { lenderId: user.lenderId, email: requestBody.email } );
                    if(doesExist) throw new Error('Email has already been taken.');
                    
                    // Encrypting password
                    var temporaryPassword = generateRandomPassword();
                    var saltRounds = 10;
                    var salt = await bcrypt.genSalt(saltRounds);
                    var encryptedPassword = await bcrypt.hash(temporaryPassword, salt);
                    
                    var newUser = new User({
                        name: requestBody.name,
                        displayName: requestBody?.displayName,
                        phone: requestBody.phone,
                        email: requestBody.email,
                        password: encryptedPassword,
                        otp: generateOTP(),
                        role,
                        active: requestBody.active,
                        segments: requestBody.segments === 'all' ? allSegments : requestBody.segments,
                        target: requestBody.target,
                        lenderId: user.lenderId
                    });
                    break;
            };

            // Sending OTP to user mail
            const mailResponse = await sendOTPMail(requestBody.email, requestBody.name.firstName, newUser.otp.OTP, temporaryPassword);
            userDebug(mailResponse);
            if(mailResponse instanceof Error) {
                userDebug(`Error sending OTP: ${mailResponse.message}`);
                throw new Error('Error sending OTP. Try again.');
            };
            userDebug('Email sent successfully');

            await newUser.save();

            newUser.password = temporaryPassword;
            
            return {
                message: 'User created and OTP sent to email.', 
                user: _.pick(newUser,['_id', 'fullName', 'displayName', 'password', 'email', 'otp.OTP', 'role', 'segments']) 
            };

        }catch(exception) {
            return exception;
        };
    },

    verifyRegister: async function (requestBody) {
        try{
            // TODO: Ask victor if I should implement change password func directly?
            const user = await User.findOne( {email: requestBody.email} );
            if(!user) throw new Error('Invalid email or password.');

            const isValidPassword = await bcrypt.compare(requestBody.password, user.password);
            if(!isValidPassword) throw new Error('Incorrect email or password.');

            if(user.emailVerify) throw new Error('User already verified.');
            
            if(requestBody?.otp !== user.otp.OTP || Date.now() > user.otp.expirationTime) throw new Error('Invalid OTP');
             
            await user.updateOne( { emailVerify: true, 'otp.OTP': null, active: true, lastLoginTime: Date.now() } );

            return {
                message: "Email has been verified and account activated.",
                token: user.generateToken()
            }

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

            const token = user.generateToken();

            user.token = token;
            authUser = _.pick(user, ['_id', 'firstName', 'lastName', 'email', 'role', 'lastLoginTime', 'token']);

            await user.updateOne( { lastLoginTime: Date.now() } );

            return authUser;

        }catch(exception) {
            return exception;
        };
    },

    forgotPassword: async function(requestBody) {
        try{
            let user = await User.findOneAndUpdate( { email: requestBody.email }, { otp: generateOTP() }, {new: true}  ).select('-password');
            if(!user) throw new Error('User not found.');

            const mailResponse = await sendOTPMail(user.email, user.name.firstName, user.otp.OTP);
            userDebug(mailResponse);
            if(mailResponse instanceof Error) {
                userDebug(`Error sending OTP: ${mailResponse.message}`);
                throw new Error('Error sending OTP. Try again.');
            };
            userDebug('Email sent successfully');
            
            return user;
            
        }catch(exception) {
            return exception;
        };
    },

    // TODO: Ensure this has been completed.
    changePassword: async function(requestBody) {
        try{
            const user = await User.findOne( { email: requestBody.email } );
            if(!user) throw new Error('User not found.');

            if(requestBody.currentPassword) {
                const validPassword = await bcrypt.compare(requestBody.currentPassword, user.password);
                if(!validPassword)  throw new Error('Password is incorrect.');
            };
            
            const isSimilar = await bcrypt.compare(requestBody.newPassword, user.password);
            if(isSimilar)  throw new Error('Password is too similar to old password.');

            const saltRounds = 10;
            const salt = await bcrypt.genSalt(saltRounds);
            const encryptedPassword = await bcrypt.hash(requestBody.newPassword, salt);

            await user.update( { 'otp.OTP': null, password: encryptedPassword } );

            return 'Password updated.';
            
        }catch(exception) {
            return exception;
        };
    },

    update: async function(id, requestUser, requestBody) {
        try{
            const user = await User.findByIdAndUpdate( { _id: id, lenderId: requestUser.lenderId  }, requestBody, {new: true}).select('-password');
            if(!user) {
                userDebug(user);
                throw new Error('User not found.');
            };

            // TODO: how to specify if it's a delete or ADD??
            // TODO: ask front end if the can build the array.
            
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

    sendOTP: async function(email, template) {
        try {
            const user = await User.findOneAndUpdate( { email: email }, { otp: generateOTP() }, {new: true}  ).select('otp');
            if(!user) throw new Error('User not found');

            const mailResponse = await sendOTPMail(email, user.name.firstName, user.otp.OTP);
                userDebug(mailResponse);
                if(mailResponse instanceof Error) {
                    userDebug(`Error sending OTP: ${mailResponse.message}`);
                    throw new Error('Error sending OTP. Try again.');
                };
                userDebug('Email sent successfully');
            
            return {
                message: 'OTP sent successfully',
                otp: user.otp.OTP
            };

        }catch(exception) {
            userDebug(exception)
            return exception;
        };
    }
}

module.exports = user;
