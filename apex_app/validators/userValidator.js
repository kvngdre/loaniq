const Joi = require('joi');
const { joiPassword } = require('joi-password');
Joi.objectId = require('joi-objectid')(Joi);

const validators = {
    validateRegistration: {
        admin: function (user) {
            const schema = Joi.object({
                firstName: Joi.string().required().min(3).max(50),
                lastName: Joi.string().required().min(3).max(50),
                middleName: Joi.string().optional().min(3).max(50),
                email: Joi.string().required().email().min(10).max(255),
                role: Joi.string().required(),
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
    
        credit: function (user) {
            const schema = Joi.object({
                firstName: Joi.string().required().min(3).max(50),
                lastName: Joi.string().required().min(3).max(50),
                middleName: Joi.string().optional().min(3).max(50),
                email: Joi.string().required().email().min(10).max(255),
                role: Joi.string().required(),
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
    
        operations: function (user) {
            const schema = Joi.object({
                firstName: Joi.string().required().min(3).max(50),
                lastName: Joi.string().required().min(3).max(50),
                middleName: Joi.string().optional().min(3).max(50),
                email: Joi.string().required().email().min(10).max(255),
                role: Joi.string().required(),
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
    
        loanAgent: function (user) {
            const schema = Joi.object({
                firstName: Joi.string().required().min(3).max(50),
                lastName: Joi.string().required().min(3).max(50),
                middleName: Joi.string().optional().min(3).max(50),
                email: Joi.string().required().email().min(10).max(255),
                role: Joi.string().required(),
                segments: Joi.array().items(Joi.objectId).required(),
                target: Joi.number(),
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
    },

    validateRegVerification: function(user) {
        const schema = Joi.object({
            email: Joi.string().required().email().min(10).max(50),
            otp: Joi.string().required()
                        .pattern(/^[0-9]{6}$/)
                        .messages( {'string.pattern.base': '{#label} must be 6 digits.'} ),
            password: joiPassword
                        .string()
                        .required()
                        .min(6)
                        .noWhiteSpaces()
                        .messages({
                            'password.noWhiteSpaces': '{#label} should not contain white spaces.'
                        })
        });

        return schema.validate(user);
    },

    validateLogin: function(user) {
        const schema = Joi.object({
            email: Joi.string().required().email().min(10).max(50),
            password: joiPassword
                        .string()
                        .required()
                        .min(6)
                        .noWhiteSpaces()
                        .messages({
                            'password.noWhiteSpaces': '{#label} should not contain white spaces.'
                        })
        });

        return schema.validate(user);
    },
    
    validateForgotPassword: function(user) {
        const schema = Joi.object({
            email: Joi.string().required().email().min(10).max(50),
            newPassword: joiPassword
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

    validateChangePassword: function(user) {
        const schema = Joi.object({
            email: Joi.string().optional().email().min(10).max(50),
            newPassword: joiPassword
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
    }
}

module.exports = validators;
