const Joi = require('joi');

const bankNameSchema = Joi.string().min(8).max(20).messages({
    'string.min': 'Bank name too short.',
    'string.max': 'Bank name too long.',
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
    create: function (bank) {
        const schema = Joi.object({
            name: bankNameSchema.required(),
            code: bankCodeSchema.required(),
        });

        return schema.validate(bank);
    },

    update: function (bank) {
        const schema = Joi.object({
            name: bankNameSchema,
            code: bankCodeSchema,
        }).min(1);

        return schema.validate(bank);
    },
};

module.exports = validators;
