const debug = require('debug')('app:pickRandomUser');
const logger = require('../utils/logger')('pickRandomUser.js');
const User = require('../models/userModel');

module.exports = async (lender, role, segment) => {
    try {
        const foundUsers = await User.find({
            lender,
            role,
            active: true,
            segments: segment,
        });
        if (!foundUsers) throw new Error(`No ${role} users found.`);

        const idx = Math.floor(Math.random() * foundUsers.length);
        
        return foundUsers[idx];
    } catch (exception) {
        logger.error({
            method: 'random_user',
            message: exception.message,
            meta: exception.stack
        })
        debug(exception);
        return exception;
    }
};
