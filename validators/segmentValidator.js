const Joi = require('joi');

const nameSchema = Joi.string().max(255).messages({
    'string.max': 'Segment name is too long',
    'any.required': 'Segment name is required',
});
const codeSchema = Joi.string()
    .pattern(/^[a-zA-Z]{2,5}$/)
    .messages({
        'string.pattern.base': 'Invalid segment code',
        'any.required': 'Segment code is required',
    });
const prefixSchema = Joi.string()
    .pattern(/[a-zA-Z]{2,8}/)
    .messages({
        'string.pattern.base': 'Invalid segment prefix',
        'any.required': 'Segment prefix is required',
    });

const validators = {
    create: function (segment) {
        const schema = Joi.object({
            code: codeSchema.required(),
            name: nameSchema.required(),
            prefix: prefixSchema,
            active: Joi.boolean(),
        });

        return schema.validate(segment);
    },

    update: function (segment) {
        const schema = Joi.object({
            code: codeSchema,
            name: nameSchema,
            prefix: prefixSchema,
            active: Joi.boolean(),
        });

        return schema.validate(segment);
    },
};

module.exports = validators;
