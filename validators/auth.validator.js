const joi = require('joi');

const emailSchema = joi.string().email().min(10).max(50).messages({
    'string.min': 'Invalid email address',
    'string.max': 'Invalid email address',
    'string.email': 'Please enter a valid email address',
});

const validators = {
    validateLogin: function (lender) {
        const schema = joi.object({
            email: emailSchema.required(),
            password: joi.string().max(40).required(),
        });
        return schema.validate(lender);
    },
};

module.exports = validators;
