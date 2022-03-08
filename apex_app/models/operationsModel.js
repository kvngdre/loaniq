const config = require('config');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');


// Operations officer user schema
const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        minLength: 3,
        maxLength: 50,
        required: true,
        trim:true
    },

    lastName: {
        type: String,
        minLength: 3,
        maxLength: 50,
        required: true,
        trim:true
    },

    middleName: {
        type: String,
        default: null,
        // minLength: 3,
        maxLength: 50,
        trim:true
    },

    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        minLength: 10,
        maxLength: 255
    },

    password: {
        type: String,
        required: true,
        minLength: 6,
        maxLength: 1024
    },

    emailVerify: {
        type: Boolean,
        default: false
    },

    otp: {
        type: String,
    },

    createdAt: {
        // TODO: Look up how to set timezone for this to Nigerian time.
        type: Date,
        default: () => Date.now()
    }
});

userSchema.methods.generateToken = function() {
    return jwt.sign( {
        _id: this._id, 
        firstName: this.firstName, 
        lastName: this.lastName,
        email: this.email
    }, config.get('jwtPrivateKey'));
}

const opUser = mongoose.model('UserOperations', userSchema);

module.exports = opUser;
