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
            lowercase: true,
            trim:true
        },
    }, 
    
    phone: {
        type: String,
        unique: true,
        trim: true,
        required: true
    },

    email: {
        type: String,
        unique: true,
        lowercase: true,
        trim: true,
        minLength: 10,
        maxLength: 255,
        required: true
    },
    
    emailVerify: {
        type: Boolean,
        default: false
    },

    password: {
        type: String,
        minLength: 6,
        maxLength: 1024,
        required: true
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
        required: true
    },

    // TODO: Duration of target
    target: {
        type: Number,
        // required: true
    },

    achieved: {
        type: Number,
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
    }, 'jwtPrivateKey');
}

userSchema.pre('save', function (next) {
    // capitalize names
    this.name.firstName = this.name.firstName.charAt(0).toUpperCase() + this.name.firstName.slice(1).toLowerCase();
    this.name.lastName = this.name.lastName.charAt(0).toUpperCase() + this.name.lastName.slice(1).toLowerCase();
    if(this.name.middleName) this.name.middleName = this.name.middleName.charAt(0).toUpperCase() + this.name.middleName.slice(1).toLowerCase();

    next();
  });

const User = mongoose.model('User', userSchema);

module.exports = User;
