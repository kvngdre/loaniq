const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);

const businessNameSchema = Joi.string().max(255).messages({
    'string.min': 'Business name is required',
    'string.max': 'Business name is too long',
    'any.required': 'Business name is required',
});

const addressSchema = Joi.object({
    address: Joi.string().min(2).max(255).messages({
        'string.min': 'Business address is required',
        'string.max': 'Business address is too long',
        'any.required': 'Business address is required',
    }),
    lga: Joi.string().messages({
        'any.required': 'Select L.G.A of business operations',
    }),
    state: Joi.string().messages({
        'any.required': 'Select state of business operations',
    }),
});

const emailSchema = Joi.string().email().max(50).messages({
    'string.min': 'Invalid business email address',
    'string.max': 'Invalid business email address',
    'string.email': 'Please enter a valid business email address',
    'any.required': 'Business email address is required',
});

const cacNumberSchema = Joi.string()
    .pattern(/^RC[0-9]{3,8}/)
    .invalid('RC0000', 'RC000')
    .messages({
        'any.invalid': 'Invalid CAC number',
        'string.pattern.base': 'CAC number must begin with "RC".',
        'any.required': 'CAC number is required',
    });

const phoneSchema = Joi.string()
    .pattern(/^\+?([0-9]){3}([7-9])([0,1])[0-9]{8}$/)
    .messages({
        'string.min': 'Invalid business phone number',
        'string.max': 'Invalid business phone number',
        'string.pattern.base':
            'Invalid business phone number, please include international dialling code.',
    });

const categorySchema = Joi.string()
    .valid('MFB', 'Finance House', 'Money Lender')
    .messages({
        'any.only': 'Not a valid category',
        'any.required': 'Please pick a business category'
    });

const supportSchema = Joi.object({
    email: Joi.string().email().max(50).messages({
        'string.min': 'Invalid support email address',
        'string.max': 'Invalid support email address',
        'string.email': 'Please enter a valid support email address',
        'any.required': 'Support email address is required',
    }),
    phone: Joi.string()
        .pattern(/^\+?([0-9]){3}([7-9])([0,1])[0-9]{8}$/)
        .messages({
            'string.pattern.base':
                'Invalid support phone number, please include international dialling code.',
                'any.required': 'Support phone number is required',
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
    first: Joi.string().min(2).max(255).messages({
        'string.min': 'Invalid first name.',
        'string.max': 'First name is too long',
        'any.required': 'First name is required',
    }),
    last: Joi.string().min(2).max(255).messages({
        'string.min': 'Invalid surname',
        'string.max': 'Surname is too long',
        'any.required': 'Surname is required',
    }),
    middle: Joi.string().min(2).max(255).messages({
        'string.min': 'Invalid middle name',
        'string.max': 'Middle name is too long',
        'any.required': 'Middle name is required',
    }),
});

const otpSchema = Joi.string()
    .pattern(/^[0-9]{8}$/)
    .messages({ 'string.pattern.base': 'Invalid OTP',
    'any.required': 'OTP is required', });

const validators = {
    create: function (payload) {
        const schema = Joi.object({
            lender: {
                companyName: businessNameSchema.required(),
                category: categorySchema.required(),
                
            },
            user: {
                name: nameSchema.required(),
                email: Joi.string()
                    .email()
                    .min(10)
                    .max(50)
                    .messages({
                        'string.min': 'Invalid user email address',
                        'string.max': 'Invalid user email address',
                        'string.email': 'Please enter a valid user email address',
                        'any.required': 'User email address is required',
                    })
                    .required(),
                phone: Joi.string()
                    .pattern(/^\+?([0-9]){3}([7-9])([0,1])[0-9]{8}$/)
                    .messages({
                        'string.min': 'Invalid user phone number.',
                        'string.max': 'Invalid user phone number.',
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
            // website: Joi.string().required().messages({
            //     'any.required': 'Business website is required',
            // }),
        });

        return schema.validate(lender);
    },

    update: function (lender) {
        const schema = Joi.object({
            logo: Joi.string(),
            businessName: businessNameSchema,
            location: addressSchema,
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

            defaultParams: Joi.object({
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
