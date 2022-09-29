const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);
const { joiPassword } = require('joi-password');

const companyNameSchema = Joi.string().min(10).max(50).messages({
    'string.min': `Company name is too short.`,
    'string.max': `Company name is too long.`,
});

const addressSchema = Joi.string().min(10).max(70).messages({
    'string.min': `Company address is too short.`,
    'string.max': `Company address is too long.`,
});

const emailSchema = Joi.string().email().min(10).max(50).messages({
    'string.min': `Invalid email address.`,
    'string.max': `Invalid email address.`,
});

const cacNumberSchema = Joi.string()
    .pattern(/^RC[0-9]{3,8}/)
    .invalid('RC0000 RC000')
    .messages({
        'any.invalid': 'Invalid CAC number',
        'string.pattern.base': 'CAC number must begin with "RC".',
    });

const phoneSchema = Joi.string()
    .pattern(/^\+?([0-9]){3}([7-9])([0,1])[0-9]{8}$/)
    .messages({
        'string.min': 'Invalid phone number.',
        'string.max': 'Phone number is too long.',
        'string.pattern.base':
            'Invalid phone number, please include international dialling code.',
    });

const passwordSchema = joiPassword
    .string()
    .minOfUppercase(1)
    .minOfSpecialCharacters(2)
    .minOfNumeric(2)
    .noWhiteSpaces()
    .min(6)
    .max(40)
    .messages({
        'password.minOfUppercase':
            '{#label} should contain at least {#min} uppercase character.',
        'password.minOfSpecialCharacters':
            '{#label} should contain at least {#min} special characters.',
        'password.minOfNumeric':
            '{#label} should contain at least {#min} numbers.',
        'password.noWhiteSpaces': '{#label} should not contain white spaces.',
    });

const supportSchema = Joi.object({
    email: emailSchema.required(),
    phone: Joi.string()
        .pattern(/^\+?([0-9]){3}([7-9])([0,1])[0-9]{8}$/)
        .messages({
            'string.min': 'Invalid phone number.',
            'string.max': 'Phone number is too long.',
            'string.pattern.base':
                'Invalid support phone number, please include international dialling code.',
        })
        .required(),
});

const validators = {
    create: function (lender) {
        const schema = Joi.object({
            companyName: companyNameSchema.required(),
            companyAddress: addressSchema.required(),
            cacNumber: cacNumberSchema,
            category: Joi.string(),
            phone: phoneSchema.required(),
            email: emailSchema.required(),
            password: passwordSchema.required(),
            website: Joi.string(),
            support: supportSchema,
            timeZone: Joi.string(),
        });

        return schema.validate(lender, { abortEarly: false });
    },

    update: function (lender) {
        const schema = Joi.object({
            companyName: companyNameSchema,
            companyAddress: addressSchema,
            cacNumber: cacNumberSchema,
            category: Joi.string(),
            phone: phoneSchema,
            website: Joi.string(),
            support: supportSchema,
            timeZone: Joi.string(),
        });

        return schema.validate(lender);
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

    otp: function (email) {
        const schema = Joi.object({
            email: emailSchema.required(),
        });

        return schema.validate(email);
    },

    fundAccount: function (payload) {
        const schema = Joi.object({
            amount: Joi.number().precision(2).min(100.0).required().messages({
                'number.min': 'Minimum amount is 100.00.',
            }),
            choice: Joi.number().min(0).max(1),
        });

        return schema.validate(payload);
    },

    deactivate: function (lender) {
        const schema = Joi.object({
            password: Joi.string(),
        });

        return schema.validate(lender);
    },
};

module.exports = validators;
