const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);

const companyNameSchema = Joi.string().min(10).max(50).messages({
    'string.min': `Company name is too short.`,
    'string.max': `Company name is too long.`,
});

const addressSchema = Joi.object({
    address: Joi.string().min(9).max(70).messages({
        'string.min': `Street name is too short.`,
        'string.max': `Street name is too long.`,
    }),
    lga: Joi.string(),
    state: Joi.string(),
});

const emailSchema = Joi.string().email().min(10).max(50).messages({
    'string.min': 'Invalid email address',
    'string.max': 'Invalid email address',
    'string.email': 'Please enter a valid email',
});

const cacNumberSchema = Joi.string()
    .pattern(/^RC[0-9]{3,8}/)
    .invalid('RC0000', 'RC000')
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

const categorySchema = Joi.string()
    .valid('MFB', 'Finance House', 'Money Lender')
    .messages({
        'any.only': 'Not a valid category',
    });

const supportSchema = Joi.object({
    email: emailSchema,
    phone: Joi.string()
        .pattern(/^\+?([0-9]){3}([7-9])([0,1])[0-9]{8}$/)
        .messages({
            'string.min': 'Invalid phone number.',
            'string.max': 'Phone number is too long.',
            'string.pattern.base':
                'Invalid support phone number, please include international dialling code.',
        }),
});

const socialSchema = Joi.object({
    twitter: Joi.string(),
    instagram: Joi.string(),
    facebook: Joi.string(),
    whatsapp: Joi.string(),
    youtube: Joi.string(),
    tiktok: Joi.string(),
});

const nameSchema = Joi.object({
    first: Joi.string().min(3).max(30).messages({
        'string.min': `First name is too short.`,
        'string.max': `first name is too long.`,
    }),
    last: Joi.string().min(3).max(30).messages({
        'string.min': `Surname is too short.`,
        'string.max': `Surname is too long.`,
    }),
    middle: Joi.string().min(3).max(30).messages({
        'string.min': `Middle name is too short.`,
        'string.max': `Middle name is too long.`,
    }),
});

const otpSchema = Joi.string()
    .pattern(/^[0-9]{8}$/)
    .messages({ 'string.pattern.base': 'Invalid OTP' });

const validators = {
    create: function (payload) {
        const schema = Joi.object({
            lender: {
                companyName: companyNameSchema.required(),
                companyAddress: addressSchema.required(),
                // cacNumber: cacNumberSchema,
                category: categorySchema.required(),
                phone: phoneSchema.required(),
                email: emailSchema.required(),
                website: Joi.string(),
                // support: supportSchema,
                // social: socialSchema,
            },
            user: {
                name: nameSchema.required(),
                email: Joi.string()
                    .email()
                    .min(10)
                    .max(50)
                    .messages({
                        'string.min': 'Invalid email address.',
                        'string.max': 'Invalid email address.',
                        'string.email': 'Please enter a valid user email',
                    })
                    .required(),
                phone: Joi.string()
                    .pattern(/^\+?([0-9]){3}([7-9])([0,1])[0-9]{8}$/)
                    .messages({
                        'string.min': 'Invalid phone number.',
                        'string.max': 'Phone number is too long.',
                        'string.pattern.base':
                            'Invalid user phone number, please include international dialling code.',
                    })
                    .required(),
            },
        });

        return schema.validate(payload, { abortEarly: false });
    },

    activate: function (lender) {
        const schema = Joi.object({
            otp: otpSchema.required(),
            cacNumber: cacNumberSchema.required(),
            support: supportSchema.required(),
        });

        return schema.validate(lender);
    },

    update: function (lender) {
        const schema = Joi.object({
            logo: Joi.string(),
            companyName: companyNameSchema,
            companyAddress: addressSchema,
            cacNumber: cacNumberSchema,
            category: categorySchema,
            phone: phoneSchema,
            website: Joi.string(),
            support: supportSchema,
            social: socialSchema,
        });

        return schema.validate(lender);
    },

    updateSettings: function (settings) {
        const schema = Joi.object({
            segment: Joi.object({
                id: Joi.objectId().required(),
                interestRate: Joi.number(),
                minNetPay: Joi.number(),
                minLoanAmount: Joi.number(),
                maxLoanAmount: Joi.number(),
                minTenor: Joi.number(),
                maxTenor: Joi.number(),
                maxDti: Joi.number(),
                transferFee: Joi.number(),
                upfrontFeePercent: Joi.number(),
            }),

            loanParams: Joi.object({
                minLoanAmount: Joi.number(),
                maxLoanAmount: Joi.number(),
                minTenor: Joi.number(),
                maxTenor: Joi.number(),
                interestRate: Joi.number(),
                upfrontFeePercent: Joi.number(),
                transferFee: Joi.number(),
                minNetPay: Joi.number(),
                maxDti: Joi.number(),
            }),
        });

        return schema.validate(settings);
    },

    fundAccount: function (payload) {
        const schema = Joi.object({
            amount: Joi.number().precision(2).min(500).required().messages({
                'number.min': 'Minimum amount is 500.00.',
            }),
        });

        return schema.validate(payload);
    },
};

module.exports = validators;
