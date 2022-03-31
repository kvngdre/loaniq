const config = require('config');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const Segment = require('../models/segmentModel');

const userSchema = new mongoose.Schema({
    lenderId: {
        type: String
    },

    name: {
        firstName: {
            type: String,
            minLength: 3,
            maxLength: 50,
            trim:true,
            required: true
        },
    
        lastName: {
            type: String,
            minLength: 3,
            maxLength: 50,
            trim:true,
            required: true
        },
    
        middleName: {
            type: String,
            minLength: 3,
            maxLength: 50,
            trim:true
        },
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
    },

    achieved: {
        type: Number,
    },

    loans: {
        type: [ mongoose.Schema.Types.ObjectId ],
        ref: 'Loan'
    },

    customers: {
        type: [ String ],
    }

}, {

    timestamps: true
});

userSchema.methods.generateToken = function() {
    return jwt.sign( {
        id: this._id, 
        lenderId: this.lenderId,
        firstName: this.name.firstName, 
        lastName: this.name.lastName,
        email: this.email,
        role: this.role,
        active: this.active,
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
