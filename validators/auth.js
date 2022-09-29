const Joi = require('joi');

const emailSchema = Joi.string().email().min(10).max(50).messages({
    'string.min': `Invalid email address.`,
    'string.max': `Invalid email address.`,
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
            password: Joi.string().max(40).required(),
        });

        return schema.validate(lender);
    },

};

module.exports = validators;
