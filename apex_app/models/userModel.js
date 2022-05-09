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
    
    phone: {
        type: String,
        unique: true,
        trim: true,
    },

    email: {
        type: String,
        minLength: 10,
        maxLength: 255,
        lowercase: true,
        trim: true,
        unique: true,
        required: true
    },
    
    emailVerify: {
        type: Boolean,
        default: false
    },

    password: {
        type: String,
        maxLength: 1024,
        required: true
    },

    active: {
        type: Boolean,
        default: false
    },

    otp: {
        value: {
            type: String,
        },
        
        expirationTime: {
            type: Number,
        }
    },
    
    role: {
        type: String,
        enum: [
            'admin',
            'credit',
            'loanAgent',
            'operations',
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

    // TODO: Duration of target
    target: {
        type: Number,
    },

    achieved: {
        type: Number
    },

    lastLoginTime: {
        type: Date,
        default: null
    }

}, {
    timestamps: true
});

userSchema.virtual('fullName').get(function() {
    return this.name.firstName.concat(this.name?.middleName ? ` ${this.name.middleName}` : '', ` ${this.name.lastName}`);
})

userSchema.methods.generateToken = function() {
    return jwt.sign( {
        id: this._id, 
        lenderId: this.lenderId,
        firstName: this.name.firstName, 
        lastName: this.name.lastName,
        email: this.email,
        role: this.role,
        active: this.active,
        segments: (this.segments ? this.segments : null)
    }, 'jwtPrivateKey');
}

userSchema.pre('save', function (next) {
    // capitalize names
    this.name.firstName = this.name.firstName.charAt(0).toUpperCase() + this.name.firstName.slice(1).toLowerCase();
    this.name.lastName = this.name.lastName.charAt(0).toUpperCase() + this.name.lastName.slice(1).toLowerCase();
    if(this.name?.middleName) this.name.middleName = this.name.middleName.charAt(0).toUpperCase() + this.name.middleName.slice(1).toLowerCase();

    next();
  });

const User = mongoose.model('User', userSchema);

module.exports = User;
