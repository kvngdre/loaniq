const Joi = require('joi');
const { joiPassword } = require('joi-password');
Joi.objectId = require('joi-objectid')(Joi);

const phoneSchema = Joi.string()
                       .pattern(/^0([7-9])[0-9]{9}$/)
                       .message({
                            "string.pattern.base": "Invalid phone number."
                            });

const emailSchema = Joi.string()
                       .email()
                       .min(10)
                       .max(255);

const passwordSchema = joiPassword.string()
                                  .minOfUppercase(1)
                                  .minOfSpecialCharacters(2)
                                  .minOfNumeric(2)
                                  .noWhiteSpaces()
                                  .min(6)
                                  .max(255)
                                  .messages({
                                    'password.minOfUppercase': '{#label} should contain at least {#min} uppercase character.',
                                    'password.minOfSpecialCharacters': '{#label} should contain at least {#min} special characters.',
                                    'password.minOfNumeric': '{#label} should contain at least {#min} numbers.',
                                    'password.noWhiteSpaces': '{#label} should not contain white spaces.'
                                    });
                                
const validators = {
    creation: function(lender) {
        const schema = Joi.object({
            // TODO: change values to required.
            companyName: Joi.string()
                            .required(),
            
            slug: Joi.string()
                     .required(),

            companyAddress: Joi.string()
                               .required(),

            cacNumber: Joi.string()
                          .required(),

            category: Joi.string(),

            phone: phoneSchema.required(),

            email: emailSchema.required(),

            password: passwordSchema.required(),

            lenderURL: Joi.string()
        });
        return schema.validate(lender);
    },

    validateRegVerification: function(lender) {
        const schema = Joi.object({
            email: emailSchema.required(),
            otp: Joi.string()
                    .required()
                    .pattern(/^[0-9]{6}$/)
                    .messages( {'string.pattern.base': '{#label} must be 6 digits.'} ),
            password: passwordSchema.required()

        });
        return schema.validate(lender);
    },

    validateLogin: function(lender) {
        const schema = Joi.object({
            email: emailSchema.required(),
            password: passwordSchema.required()
        });
        return schema.validate(lender);
    },

    validateForgotPassword: function(lender) {
        const schema = Joi.object({
            email: emailSchema.required(),
            newPassword: passwordSchema.required()
        });
        return schema.validate(lender);
    },

    validateChangePassword: function(lender) {
        const schema = Joi.object({
            email: emailSchema,
            newPassword: passwordSchema
        });
        return schema.validate(lender);
    },

    adminCreation: function (user) {
        const schema = Joi.object({
            name: Joi.object({
                firstName: Joi.string().required().min(3).max(50),
                lastName: Joi.string().required().min(3).max(50),
                middleName: Joi.string().min(3).max(50),
            }),
            phone: Joi.string().length(11),            
            email: Joi.string().required().email().min(10).max(255),
            role: Joi.string().equal('admin'),
            active: Joi.boolean().equal(true),
            lenderId: Joi.objectId(),
            password: joiPassword
                        .string()
                        .required()
                        .minOfUppercase(1)
                        .minOfSpecialCharacters(2)
                        .minOfNumeric(2)
                        .noWhiteSpaces()
                        .min(6)
                        .max(255)
                        .messages({
                            'password.minOfUppercase': '{#label} should contain at least {#min} uppercase character.',
                            'password.minOfSpecialCharacters': '{#label} should contain at least {#min} special characters.',
                            'password.minOfNumeric': '{#label} should contain at least {#min} numbers.',
                            'password.noWhiteSpaces': '{#label} should not contain white spaces.'
                        })
    
        });
        return schema.validate(user);
    },

    update: function (lender) {
        const schema = Joi.object({
            companyName: Joi.string()
                            .required(),

            companyAddress: Joi.string()
                               .required(),

            cacNumber: Joi.string()
                          .required(),

            category: Joi.string(),

            phone: Joi.string()
                      .length(11)
        });
        return schema.validate(lender);  
    },

    validateSettings: function(settings) {
        const schema = Joi.object({
            slug: Joi.string(),
            segments: Joi.array().items(Joi.object({segment: Joi.objectId(), minLoanAmount: Joi.number(), maxLoanAmount: Joi.number(), minTenor: Joi.number(), maxTenor: Joi.number()})).required(),
            loanMetrics: Joi.object({
                interestRate: Joi.number().required(),
                upfrontFeePercentage: Joi.number().required(),
                transferFee: Joi.number().required(),
                minLoanAmount: Joi.number().required(),
                maxLoanAmount: Joi.number().required(),
                minNetPay: Joi.number().required(),
                minTenor: Joi.number().required(),
                maxTenor: Joi.number().required(),
                dtiThreshold: Joi.number().required()
            }).required()
        });
        return schema.validate(settings);
    },

    delete: function(lender) {
        const schema = Joi.object({
            id: Joi.objectId().required(),
            email: Joi.string().email().required()
        });
        return schema.validate(lender);
    }
};


module.exports = validators;