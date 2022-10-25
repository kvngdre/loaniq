const debug = require('debug')('app:pickRandomUser');
const logger = require('../utils/logger')('pickRandomUser.js');
const User = require('../models/userModel');

module.exports = async (lender, role, segment) => {
    try {
        const foundUsers = await User.find(
            {
                lender,
                role,
                active: true,
                resetPwd: false,
                segments: segment,
            },
            { otp: 0, password: 0, refreshTokens: 0, resetPwd: 0 }
        );
        if (foundUsers.length === 0) throw new Error(`No ${role} users found`);

        const randomIdx = Math.floor(Math.random() * foundUsers.length);

        return foundUsers[randomIdx]._id;

    } catch (exception) {
        logger.error({
            method: 'pick_random_user',
            message: exception.message,
            meta: exception.stack,
        });
        debug(exception);
        return exception;
    }
};
