const Joi = require('joi');

const bankNameSchema = Joi.string().min(8).max(20).messages({
    'string.min': 'Bank name should be at least {#limit} characters long.',
    'string.max': 'Bank name can not be at more than {#limit} characters long.',
});

const bankCodeSchema = Joi.string()
    .min(3)
    .max(6)
    .pattern(/^[0-9]{3,6}$/)
    .messages({
        'string.min': 'Invalid bank code.',
        'string.max': 'Invalid bank code.',
        'string.pattern.base': 'Invalid bank code.',
    });

const validators = {
    validateCreation: function (bank) {
        const schema = Joi.object({
            name: bankNameSchema.required(),
            code: bankCodeSchema.required(),
        });

        return schema.validate(bank);
    },

    validateEdit: function (bank) {
        const schema = Joi.object({
            name: bankNameSchema,
            code: bankCodeSchema,
        }).min(1);

        return schema.validate(bank);
    },
};

module.exports = validators;
