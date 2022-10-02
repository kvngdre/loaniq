const Joi = require('joi');
const { joiPassword } = require('joi-password');

const emailSchema = Joi.string().email().min(10).max(50).messages({
    'string.min': 'Invalid email address',
    'string.max': 'Invalid email address',
    'string.email': 'Please enter a valid email',
});

const passwordSchema = joiPassword
    .string()
    .minOfUppercase(1)
    .minOfSpecialCharacters(2)
    .minOfNumeric(2)
    .noWhiteSpaces()
    .min(6)
    .max(1024)
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
    .pattern(/^[0-9]{8}$/)
    .messages({ 'string.pattern.base': 'Invalid OTP' });

const validators = {
    login: function (lender) {
        const schema = Joi.object({
            email: emailSchema.required(),
            password: Joi.string().max(40).required(),
        });

        return schema.validate(lender);
    },

    verify: function (lender) {
        const schema = Joi.object({
            email: emailSchema.required(),
            otp: otpSchema.required(),
            currentPassword: Joi.string().max(40).required(),
            newPassword: passwordSchema.required()
        });

        return schema.validate(lender);
    },

};

module.exports = validators;
