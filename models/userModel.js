const config = require('config');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const moment = require('moment-timezone');
const Segment = require('../models/segmentModel');


const schemaOptions = {timestamps: true, toJSON: { virtuals: true} };

const userSchema = new mongoose.Schema({
    lenderId: {
        type: String
    },

    name: {
        first: {
            type: String,
            trim:true,
            required: true
        },
    
        last: {
            type: String,
            trim:true,
            required: true  
        },
    
        middle: {
            type: String,
            minLength: 3,
            maxLength: 50,
            trim:true
          },
    },
    
    displayName: {
        type: String,
        trim: true,
        default: function() {
            return this.name.first.concat(this.name.middle ? ` ${this.name.middle}` : '', ` ${this.name.last}`);
        }
    },
    
    phone: {
        type: String,
        unique: true,
        trim: true,
    },

    email: {
        type: String,
        lowercase: true,
        trim: true,
        unique: true,
        required: true
    },
    
    emailVerified: {
        type: Boolean,
        default: false
    },

    password: {
        type: String,
        trim: true,
        maxLength: 1024,
        required: true
    },

    active: {
        type: Boolean,
        default: false
    },

    otp: {
        OTP: {
            type: String,
        },
        
        expirationTime: {
            type: Number,
        }
    },
    
    role: {
        type: String,
        enum: [
            'Admin',
            'Credit',
            'Loan Agent',
            'Operations',
            'origin-master'
        ],
        required: true
    },

    // following fields below are for loan agents
    segments: {
        type: [ mongoose.Schema.Types.ObjectId ],
        ref: 'Segment',
        default: null,
        required: true
    },

    // TODO: Duration of target?
    target: {
        type: Number,
    },

    achieved: {
        type: Number
    },

    lastLoginTime: {
        type: Date,
        default: null
    },

    timeZone:{
        type: String,
        default: 'Africa/Lagos'
    }

}, schemaOptions)

userSchema.methods.generateToken = function() {
    return jwt.sign({
        id: this._id, 
        iss: this.displayName,
        email: this.email,
        role: this.role,
        isa: false,
        active: this.active,
        emailVerified: this.emailVerified,
        segments: (this.segments ? this.segments : null),
        timeZone: this.timeZone,
        lastLoginTime: this.lastLoginTimeTzAdjusted
    }, config.get('jwt_secret'));
};

const User = mongoose.model('User', userSchema);

module.exports = User;