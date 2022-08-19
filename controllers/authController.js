const User = require('../models/userModel');
const bcrypt = require('bcrypt');

const auth = {
    // Generate json web token
    getToken: async function (requestBody) {
        try {
            const doesExist = await User.findOne({ email: requestBody.email });
            if (!doesExist)
                return {
                    errorCode: 401,
                    message: 'Invalid email address or password.',
                };

            const isValidPassword = await bcrypt.compare(
                requestBody.password,
                user.password
            );
            if (!isValidPassword)
                return {
                    errorCode: 401,
                    message: 'Invalid email address or password.',
                };

            return {
                message: 'Success',
                data: user.generateToken(),
            };
        } catch (exception) {
            return exception;
        }
    },
};

module.exports = auth;
