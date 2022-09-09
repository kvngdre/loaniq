const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);
const { joiPassword } = require('joi-password');

const phoneSchema = Joi.string()
    .pattern(/^0([7-9])[0-9]{9}$/)
    .message({
        'string.pattern.base': 'Invalid phone number.',
    });

const emailSchema = Joi.string().email().min(10).max(255);

const passwordSchema = joiPassword
    .string()
    .minOfUppercase(1)
    .minOfSpecialCharacters(2)
    .minOfNumeric(2)
    .noWhiteSpaces()
    .min(6)
    .max(255)
    .messages({
        'password.minOfUppercase':
            '{#label} should contain at least {#min} uppercase character.',
        'password.minOfSpecialCharacters':
            '{#label} should contain at least {#min} special characters.',
        'password.minOfNumeric':
            '{#label} should contain at least {#min} numbers.',
        'password.noWhiteSpaces': '{#label} should not contain white spaces.',
    });

const otpSchema = Joi.string()
    .pattern(/^[0-9]{6}$/)
    .messages({ 'string.pattern.base': 'Invalid OTP' });

const validators = {
    create: function (lender) {
        const schema = Joi.object({
            companyName: Joi.string().required(),
            companyAddress: Joi.string().required(),
            cacNumber: Joi.string()
                .pattern(/^RC[0-9]+/)
                .required()
                .messages({
                    'string.pattern.base':
                        "Invalid CAC Number. Please ensure the number begins with 'RC'.",
                }),

            category: Joi.string(),
            phone: phoneSchema.required(),
            email: emailSchema.required(),
            password: passwordSchema.required(),
            lenderURL: Joi.string(),
        });

        return schema.validate(lender);
    },

    update: function (lender) {
        const schema = Joi.object({
            companyName: Joi.string(),
            companyAddress: Joi.string(),
            cacNumber: Joi.string()
                .pattern(/^RC[0-9]+/)
                .messages({
                    'string.pattern.base':
                        "Invalid CAC Number. Must begin with 'RC'.",
                }),
            category: Joi.string(),
            phone: phoneSchema,
            timeZone: Joi.string(),
        });

        return schema.validate(lender);
    },

    verifyReg: function (lender) {
        const schema = Joi.object({
            email: emailSchema.required(),
            otp: Joi.string()
                .required()
                .pattern(/^[0-9]{6}$/)
                .messages({
                    'string.pattern.base': 'Invalid OTP.',
                }),
            password: Joi.string().required(),
        });

        return schema.validate(lender);
    },

    login: function (lender) {
        const schema = Joi.object({
            email: emailSchema.required(),
            password: Joi.string().required(),
        });

        return schema.validate(lender);
    },

    changePassword: function (passwordObj) {
        const schema = Joi.object({
            otp: otpSchema.when('currentPassword', {
                not: Joi.exist(),
                then: Joi.required(),
                otherwise: Joi.optional(),
            }),
            email: emailSchema.required(),
            currentPassword: Joi.string(),
            newPassword: passwordSchema.required(),
        });

        return schema.validate(passwordObj);
    },

    adminCreation: function (user) {
        const schema = Joi.object({
            name: Joi.object({
                firstName: Joi.string().required().min(3).max(50),
                lastName: Joi.string().required().min(3).max(50),
                middleName: Joi.string().min(3).max(50),
            }),
            displayName: Joi.string(),
            phone: phoneSchema.required(),
            email: emailSchema.required(),
            role: Joi.string().equal('Admin'),
            active: Joi.boolean().equal(true),
            lenderId: Joi.objectId(),
        });

        return schema.validate(user);
    },

    createSettings: function (settings) {
        const schema = Joi.object({
            segments: Joi.array()
                .items(
                    Joi.object().keys({
                        id: Joi.objectId().required(),
                        minLoanAmount: Joi.number().required(),
                        maxLoanAmount: Joi.number().required(),
                        minTenor: Joi.number().required(),
                        maxTenor: Joi.number().required(),
                        maxDti: Joi.number(),
                        useDefault: Joi.boolean().default((parent) =>
                            parent.maxDti ? false : true
                        ),
                    })
                )
                .min(1),

            loanParams: Joi.object({
                interestRate: Joi.number(),
                upfrontFeePercent: Joi.number().required(),
                transferFee: Joi.number().required(),
                minNetPay: Joi.number().required(),
                maxDti: Joi.number().required(),
            }),
        });

        return schema.validate(settings);
    },

    updateSettings: function (settings) {
        const schema = Joi.object({
            segment: Joi.object({
                id: Joi.objectId().required(),
                minLoanAmount: Joi.number(),
                maxLoanAmount: Joi.number(),
                minTenor: Joi.number(),
                maxTenor: Joi.number(),
                maxDti: Joi.number(),
                useDefault: Joi.boolean(),
            }),

            loanParams: Joi.object({
                interestRate: Joi.number(),
                upfrontFeePercent: Joi.number(),
                transferFee: Joi.number(),
                minNetPay: Joi.number(),
                maxDti: Joi.number(),
            }),
        });

        return schema.validate(settings);
    },

    validateEmail: function (email) {
        const schema = Joi.object({
            email: emailSchema.required(),
        });

        return schema.validate(email);
    },

    deactivate: function (lender) {
        const schema = Joi.object({
            password: Joi.string()
        });

        return schema.validate(lender);
    },
};

module.exports = validators;
