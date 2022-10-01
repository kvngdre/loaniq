const { roles } = require('../utils/constants');
const bcrypt = require('bcrypt');
const config = require('config');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const schemaOptions = {
    timestamps: true,
    versionKey: false,
    toJSON: { virtuals: true },
    id: false,
};

const userSchema = new mongoose.Schema(
    {
        lenderId: {
            type: String,
        },

        name: {
            first: {
                type: String,
                trim: true,
                required: true,
            },

            last: {
                type: String,
                trim: true,
                required: true,
            },

            middle: {
                type: String,
                minLength: 3,
                maxLength: 50,
                trim: true,
                default: null,
            },
        },

        displayName: {
            type: String,
            trim: true,
            default: function () {
                return this.name.first.concat(` ${this.name.last}`);
            },
        },

        title: {
            type: String,
            minLength: 2,
            maxLength: 50,
        },

        queryName: {
            type: String,
            default: function () {
                return this.name.first.concat(
                    this.name.middle ? ` ${this.name.middle}` : '',
                    ` ${this.name.last}`,
                    ` ${this.displayName}`
                );
            },
        },

        dob: {
            type: Date
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
            required: true,
        },

        emailVerified: {
            type: Boolean,
            default: false,
        },

        password: {
            type: String,
            trim: true,
            maxLength: 1024,
            required: true,
        },

        active: {
            type: Boolean,
            default: false,
        },

        otp: {
            OTP: {
                type: String,
            },

            expires: {
                type: Number,
            },
        },

        role: {
            type: String,
            enum: Object.values(roles),
            required: true,
        },

        // following fields below are for loan agents
        segments: {
            type: [mongoose.Schema.Types.ObjectId],
            default: null,
        },

        // TODO: Duration of target?
        target: {
            type: Number,
        },

        achieved: {
            type: Number,
        },

        lastLoginTime: {
            type: Date,
            default: null,
        },

        timeZone: {
            type: String,
            default: 'Africa/Lagos',
        },

        refreshTokens: {
            type: [
                {
                    token: {
                        type: String,
                    },
                    exp: {
                        type: Number,
                    },
                },
            ],
            default: null,
        },
    },
    schemaOptions
);

userSchema.virtual('fullName').get(function () {
    return this.name.first.concat(
        this.name.middle ? ` ${this.name.middle}` : '',
        ` ${this.name.last}`
    );
});

userSchema.pre('save', function (next) {
    try {
        if (this.isNew)
            this.password = bcrypt.hashSync(
                this.password,
                parseInt(config.get('salt_rounds'))
            );

        next();
    } catch (exception) {
        next(exception);
    }
});

userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            id: this._id.toString(),
            lenderId: this.lenderId,
            fullName: this.fullName,
            email: this.email,
            role: this.role,
            active: this.active,
            emailVerified: this.emailVerified,
            timeZone: this.timeZone,
        },
        config.get('jwt.secret.access'),
        {
            audience: config.get('jwt.audience'),
            expiresIn: parseInt(config.get('jwt.access_time')),
            issuer: config.get('jwt.issuer'),
        }
    );
};

userSchema.methods.generateRefreshToken = function () {
    const refreshTokenTTL = parseInt(config.get('jwt.refresh_time'));
    const refreshToken = jwt.sign(
        {
            id: this._id.toString(),
        },
        config.get('jwt.secret.refresh'),
        {
            audience: config.get('jwt.audience'),
            expiresIn: refreshTokenTTL,
            issuer: config.get('jwt.issuer'),
        }
    );
    const expires = Date.now() + refreshTokenTTL * 1000;

    return {
        token: refreshToken,
        exp: expires,
    };
};

const User = mongoose.model('User', userSchema);

module.exports = User;
