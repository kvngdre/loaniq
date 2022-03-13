const User = require('../models/userModel');
const bcrypt = require('bcrypt');

const auth = {
    // Generate json web token
    getToken: async function(requestBody) {
        try{
            const doesExist = await User.findOne( {email: requestBody.email} );
            if(!doesExist) throw new Error('Invalid email address or password.');

            const isValidPassword = await bcrypt.compare(requestBody.password, user.password);
            if(!isValidPassword) throw new Error('Invalid email address or password.');

            return user.generateToken();

        } catch(exception) {
            return exception;
        };         
    }

}

module.exports = auth;
