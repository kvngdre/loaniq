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
        firstName: {
            type: String,
            trim:true,
            required: true
        },
    
        lastName: {
            type: String,
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
    
    displayName: {
        type: String,
        trim: true,
        default: function() {
            return this.name.firstName.concat(this.name.middleName ? ` ${this.name.middleName}` : '', ` ${this.name.lastName}`);
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

}, schemaOptions);

userSchema.virtual('createdAtTZAdjusted').get(function() {
    return moment.tz(this.createdAt, this.timeZone).format();
})

userSchema.virtual('updatedAtTZAdjusted').get(function() {
    return moment.tz(this.updatedAt, this.timeZone).format();
})

userSchema.virtual('lastLoginTimeTZAdjusted').get(function() {
    if(!this.lastLoginTime) return null;
    return moment.tz(this.lastLoginTime, this.timeZone).format();
})

userSchema.methods.generateToken = function() {
    return jwt.sign({
        id: this._id, 
        lenderId: this.lenderId,
        firstName: this.name.firstName, 
        lastName: this.name.lastName,
        email: this.email,
        role: this.role,
        active: this.active,
        emailVerified: this.emailVerified,
        segments: (this.segments ? this.segments : null),
        timeZone: this.timeZone,
        lastLoginTime: this.lastLoginTimeTzAdjusted
    }, config.get('jwt_secret'));
}

// userSchema.pre('save', function (next) {
//     // capitalize names
//     // this.name.firstName = this.name.firstName.charAt(0).toUpperCase() + this.name.firstName.slice(1).toLowerCase();
//     // this.name.lastName = this.name.lastName.charAt(0).toUpperCase() + this.name.lastName.slice(1).toLowerCase();
//     // if(this.name?.middleName) this.name.middleName = this.name.middleName.charAt(0).toUpperCase() + this.name.middleName.slice(1).toLowerCase();

//     this.displayName = this.name.firstName.concat(' ', this.name.lastName)

//     next();
//   });

const User = mongoose.model('User', userSchema);

module.exports = User;