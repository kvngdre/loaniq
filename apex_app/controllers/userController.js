const _ = require('lodash');
const bcrypt = require('bcrypt');
const config = require('config');
const User = require('../models/userModel');
const debug = require('debug')('app:userCtrl');
const sendOTPMail = require('../utils/sendMail');
const Segment = require('../models/segmentModel');
const generateOTP = require('../utils/generateOTP');
const generateRandomPassword = require('../utils/generatePassword');


const userCtrlFuncs = {
    /**
     *  function creates a user.
     * @param {string} role
     * @param {object} requestBody 
     * @param {object} user 
     * @returns A new user.
     */
    create: async function(requestBody, user) {
        try {
            const rounds = config.get('salt_rounds');
            const allSegments = await Segment.find()
                                             .select('_id')

            switch(requestBody.role) {
                case 'Admin':
                    if(user.role !== 'Lender') return 401;

                    // Encrypting password
                    var temporaryPassword = generateRandomPassword();
                    var encryptedTempPassword = await bcrypt.hash(temporaryPassword, rounds);

                    var newUser = new User({
                        name: requestBody.name,
                        displayName: requestBody?.displayName,
                        phone: requestBody.phone,
                        email: requestBody.email,
                        password: encryptedTempPassword,
                        otp: generateOTP(),
                        role: requestBody.role,
                        active: requestBody.active,
                        lenderId: user.id
                    })
                    break;

                case 'Credit':
                    // Encrypting password
                    var temporaryPassword = generateRandomPassword();
                    var encryptedPassword = await bcrypt.hash(temporaryPassword, rounds);

                    var newUser = new User({
                        name: requestBody.name,
                        displayName: requestBody?.displayName,
                        phone: requestBody.phone,
                        email: requestBody.email,
                        password: encryptedPassword,
                        otp: generateOTP(),
                        role: requestBody.role,
                        active: requestBody.active,
                        segments: requestBody.segments === 'all' ? allSegments : requestBody.segments,
                        lenderId: user.lenderId
                    })
                    break;

                case 'Operations':
                    var temporaryPassword = generateRandomPassword();
                    var encryptedPassword = await bcrypt.hash(temporaryPassword, rounds);
                    
                    var newUser = new User({
                        name: requestBody.name,
                        displayName: requestBody?.displayName,
                        phone: requestBody.phone,
                        email: requestBody.email,
                        password: encryptedPassword,
                        otp: generateOTP(),
                        role: requestBody.role,
                        active: requestBody.active,
                        lenderId: user.lenderId
                    });
                    break;
                
                case 'Loan Agent':
                    var temporaryPassword = generateRandomPassword();
                    var encryptedPassword = await bcrypt.hash(temporaryPassword, rounds);
                    
                    var newUser = new User({
                        name: requestBody.name,
                        displayName: requestBody?.displayName,
                        phone: requestBody.phone,
                        email: requestBody.email,
                        password: encryptedPassword,
                        otp: generateOTP(),
                        role: requestBody.role,
                        active: requestBody.active,
                        segments: requestBody.segments === 'all' ? allSegments : requestBody.segments,
                        target: requestBody.target,
                        lenderId: user.lenderId
                    })
                    break;
            };

            const isSaved = await newUser.save()
            newUser.password = temporaryPassword;

            if(isSaved) {
                // sending otp in mail
                const mailResponse = await sendOTPMail(requestBody.email, requestBody.name.firstName, newUser.otp.OTP, temporaryPassword);
                if(mailResponse instanceof Error) {
                    debug(`Error sending OTP: ${mailResponse.message}`);
                    throw new Error('Error sending OTP. Try again.');
                };
            }else throw new Error('Error creating user');
            
            return {
                message: "User created. OTP and password sent to user email", 
                user: _.pick(newUser,[
                    '_id', 
                    'fullName', 
                    'displayName', 
                    'password', 
                    'email', 
                    'otp.OTP', 
                    'role', 
                    'segments',
                    'timeZone',
                    'createdAtTZAdjusted',
                    'lastLoginTimeTZAdjusted'
                ]) 
            };

        }catch(exception) {
            debug(exception);
            if(exception.code == 11000){
                // catching duplicate key error in MongoDB
                if(requestBody.role === 'Admin') return new Error('Admin user has been created or still active');

                const baseString = 'Duplicate ';
                let field = Object.keys(exception.keyPattern)[0];

                if(field === 'phone') field = 'phone number';

                return new Error(baseString + field);
            };

            return exception;
        };
    },

    getAll: async function(lenderId, filters={}) {
        try{
            let queryParams = { lenderId };

            if(Object.keys(filters).length > 0) queryParams = Object.assign(queryParams, filters);

            const users = await User.find( queryParams )
                                     .select('-password -otp -__v')
                                     .sort('name.firstName')
            if(users.length == 0) throw new Error('Users not found');

            return users;

        }catch(exception) {
            debug(exception)
            return exception;
        };
    },

    getOne: async function(id, filters={}) {
        try{
            let queryParams = {_id: id};
            if(Object.keys(filters).length > 0) queryParams = Object.assign(queryParams, filters);

            const user = await User.findOne( queryParams )
                                   .select('-password -otp -__v');
            if(!user) throw new Error('User not found');
    
            return user;

        }catch(exception) {
            debug(exception)
            return exception;
        };
    },

    update: async function(id, alteration, filters={}) {
        try{
            let queryParams = {_id: id};
            if(Object.keys(filters).length > 0) queryParams = Object.assign(queryParams, filters);
            
            const user = await User.findByIdAndUpdate(queryParams, alteration, {new: true})
                                   .select('-password');
            if(!user) throw new Error('User not found');

            // TODO: how to specify if it's a delete or ADD??
            // TODO: ask front end if the can build the array.
            
            return {
                message: 'User Updated',
                data: user
            };
            
        }catch(exception) {
            debug(exception)
            return exception;
        };
    },

    verifyUser: async function (requestBody) {
        try{
            const user = await User.findOne( {email: requestBody.email} )
            if(!user) throw new Error('Invalid email or password');

            const isValid = await bcrypt.compare(requestBody.password, user.password)
            if(!isValid) throw new Error('Incorrect email or password');

            if(user.emailVerified) throw new Error('User already verified');
            
            if( (Date.now() > user.otp.expirationTime) || (requestBody.otp !== user.otp.OTP) ) throw new Error('Invalid OTP');
             
            user.token = user.generateToken()
            authUser = _.pick(user, ['_id', 'firstName', 'lastName', 'phone', 'email', 'role', 'lastLoginTimeTZAdjusted', 'token'])
            
            await user.updateOne( { emailVerified: true, 'otp.OTP': null, active: true, lastLoginTime: Date.now() } )
            
            return {
                message: 'Email verified and account activated',
                user: authUser
            };

        }catch(exception) {
            debug(exception)
            return exception;
        };
    },

    login: async function(email, password) {
        try{
            const user = await User.findOne({ email });
            if(!user) throw new Error('Invalid email or password');
            
            const isValidPassword = await bcrypt.compare(password, user.password);
            if(!isValidPassword)  throw new Error('Invalid email or password');
            
            if((user.lastLoginTime === null || !user.emailVerified) && !user.active) {
                return {
                    message: 'New User',
                    user: _.omit(user._doc, ['password', 'otp', 'displayName'])
                };
            };
            
            if(user.lastLoginTime !== null && user.emailVerified && !user.active) throw new Error('Account inactive. Contact administrator');

            user.token = user.generateToken()
            authUser = _.pick(user, ['_id', 'firstName', 'lastName', 'email', 'role', 'lastLoginTime', 'lastLoginTimeTZAdjusted', 'token']);

            await user.updateOne( { lastLoginTime: Date.now() } );

            return {
                message: 'Login Successful',
                user: authUser
            }

        }catch(exception) {
            debug(exception)
            return exception;
        };
    },

    changePassword: async function(email, newPassword, otp=null, currentPassword=null) {
        try{
            const user = await User.findOne({ email })
            if(!user) throw new Error('User not found');

            if(otp && ( (Date.now() > user.otp.expirationTIme) || (otp !== user.otp.OTP) ) ) throw new Error('Invalid OTP');

            if(currentPassword) {
                const isValid = await bcrypt.compare(currentPassword, user.password)
                if(!isValid) throw new Error('Password is incorrect');

                if(newPassword === currentPassword) throw new Error('New password is too similar to old password');
            };
            
            const encryptedPassword = await bcrypt.hash(newPassword, config.get('salt_rounds'));

            await user.update({ 'otp.OTP': null, password: encryptedPassword });

            return 'Password updated';
            
        }catch(exception) {
            debug(exception)
            return exception;
        };
    },

    sendOTP: async function(email, template) {
        try {
            const user = await User.findOneAndUpdate( { email }, { otp: generateOTP() }, {new: true} )
                                   .select('email otp')
            if(!user) throw new Error('User not found');

            const mailResponse = await sendOTPMail(email, user.name.firstName, user.otp.OTP);
            if(mailResponse instanceof Error) {
                debug(`Error sending OTP: ${mailResponse.message}`);
                throw new Error('Error sending OTP. Try again.');
            };

            return {
                message: 'OTP sent successfully',
                otp: user.otp.OTP,
                email: user.email
            };

        }catch(exception) {
            debug(exception)
            return exception;
        };
    },

    // delete: async function(id) {
    //     try{
    //         const user = await User.findById(id);
    //         if(!user) throw new Error('User not found.');

    //         if(user.customers.length > 0) {
    //             return 'Are you sure you want to delete?';
    //         };

    //         user.deleteOne()
    
    //         return user;
    
    //     }catch(exception) {
    //         debug(exception)
    //         return exception;
    //     }
    // },
}

module.exports = userCtrlFuncs;