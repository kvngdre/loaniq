const config = require('config');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const Lender = require('./lenderModel');
const Segment = require('../models/segmentModel');
const Customer = require('../models/customerModel');

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

    active: {
        type: Boolean,
        default: false
    },

    otp: {
        type: String,
    },

    lenderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lender'
    },

    role: {
        type: String,
        enum: [
            'admin',
            'credit',
            'operations',
            'loanAgent'
        ],
        required: true
    },

    // following fields below are for loan agents
    segments: {
        type: [ mongoose.Schema.Types.ObjectId ],
        ref: 'Segment',
    },

    // TODO: Duration of target
    target: {
        type: Number,
        default: null
    },

    achieved: {
        type: Number,
        default: null
    },

    customers: {
        type: [ mongoose.Schema.Types.ObjectId ],
        ref: 'Customer'
    },

    loans: {
        type: [ String ]
    }

}, {
    timestamps: true
});

userSchema.methods.generateToken = function() {
    return jwt.sign( {
        id: this._id, 
        lenderId: this.lenderId,
        firstName: this.firstName, 
        lastName: this.lastName,
        email: this.email,
        role: this.role,
        segments: this.segments
    }, config.get('jwtPrivateKey'));
}

// if(userSchema.role === "loanAgent") {
//     userSchema.methods.percentageAchieved = function() {
//         const value = (this.achieved / this.target) * 100;
//         return value.toFixed(2);
//     }
// };

const User = mongoose.model('User', userSchema);

module.exports = User;
