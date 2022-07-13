const _ = require('lodash');
const bcrypt = require('bcrypt');
const User = require('../models/userModel');
const debug = require('debug')('app:userCtrl');
const sendOTPMail = require('../utils/sendMail');
const Segment = require('../models/segmentModel');
const generateOTP = require('../utils/generateOTP');
const generateRandomPassword = require('../utils/generatePassword');


const userFuncs = {
    getAll: async function(queryParam={}) {
        try{
            return await User.find(queryParam)
                              .select('-password -otp')
                              .sort('name.firstName');
        }catch(exception) {
            debug(exception);
            return exception;
        }
    },

    get: async function(queryParam) {
        try{
            const user = await User.findOne( queryParam )
                                   .select('-password -otp');
            if(!user) throw new Error('User not found')
    
            return user;

        }catch(exception) {
            debug(exception);
            return exception;
        }
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
                case 'Admin':
                    if(user.role !== 'Lender') return 401;

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

                case 'Credit':
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

                case 'Operations':
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
                
                case 'Loan Agent':
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
            debug(mailResponse);
            if(mailResponse instanceof Error) {
                debug(`Error sending OTP: ${mailResponse.message}`);
                throw new Error('Error sending OTP. Try again.');
            };
            debug('Email sent successfully');

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
            const user = await User.findOne( {email: requestBody.email} );
            if(!user) throw new Error('Invalid email or password');

            const isValidPassword = await bcrypt.compare(requestBody.password, user.password);
            if(!isValidPassword) throw new Error('Incorrect email or password');

            if(user.emailVerified) throw new Error('User already verified');
            
            if(requestBody?.otp !== user.otp.OTP || Date.now() > user.otp.expirationTime) throw new Error('Invalid OTP');
             
            await user.updateOne( { emailVerified: true, 'otp.OTP': null, active: true, lastLoginTime: Date.now() } );

            return {
                message: "Email has been verified and account activated",
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

            if((user.lastLoginTime === null || !user.emailVerified) && !user.active) {
                return {
                    message: 'New User',
                    user: _.omit(user._doc, ['password', 'otp', 'displayName'])
                }
            }

            if(user.lastLoginTime !== null && user.emailVerified && !user.active) throw new Error('Account inactive. Contact administrator');

            user.token = user.generateToken();

            authUser = _.pick(user, ['_id', 'firstName', 'lastName', 'email', 'role', 'lastLoginTime', 'token']);

            await user.updateOne( { lastLoginTime: Date.now() } );

            return {
                message: 'Login Successful',
                user: authUser
            }

        }catch(exception) {
            return exception;
        };
    },

    changePassword: async function(requestBody) {
        try{
            const user = await User.findOne( { email: requestBody.email } );
            if(!user) throw new Error('User not found');

            // TODO: Check for OTP expire
            if(requestBody?.otp) {
                const isValid = user.otp.OTP === requestBody.otp;
                if(!isValid) throw new Error('Invalid OTP');
            }

            // TODO: should I change to invalid email or password?
            if(requestBody.currentPassword) {
                const validPassword = await bcrypt.compare(requestBody.currentPassword, user.password);
                if(!validPassword) throw new Error('Password is incorrect');
            };
            
            const isSimilar = await bcrypt.compare(requestBody.newPassword, user.password);
            if(isSimilar) throw new Error('Password is too similar to old password');

            const saltRounds = 10;
            const salt = await bcrypt.genSalt(saltRounds);
            const encryptedPassword = await bcrypt.hash(requestBody.newPassword, salt);

            await user.update( { 'otp.OTP': null, password: encryptedPassword } );

            return 'Password updated';
            
        }catch(exception) {
            debug(exception);
            return exception;
        };
    },

    update: async function(id, requestUser, requestBody) {
        try{
            const user = await User.findByIdAndUpdate( { _id: id, lenderId: requestUser.lenderId  }, requestBody, {new: true}).select('-password');
            if(!user) {
                debug(user);
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
            const user = await User.findOneAndUpdate( { email: email }, { otp: generateOTP() }, {new: true} )
                                   .select('otp');
            if(!user) throw new Error('User not found');

            const mailResponse = await sendOTPMail(email, user.name.firstName, user.otp.OTP);
                debug(mailResponse);
                if(mailResponse instanceof Error) {
                    debug(`Error sending OTP: ${mailResponse.message}`);
                    throw new Error('Error sending OTP. Try again.');
                };
                debug('Email sent successfully');
            
            return {
                message: 'OTP sent successfully',
                otp: user.otp.OTP
            };

        }catch(exception) {
            debug(exception);
            return exception;
        };
    }
}

module.exports = userFuncs;