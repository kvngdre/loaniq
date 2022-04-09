const Joi = require('joi');

const segmentNameSchema = Joi.string();

const segmentCodeSchema = Joi.string()
                             .pattern(/^[a-zA-Z]{2,5}$/)

const validators = {
    validateCreation: function(segment) {
        const schema = Joi.object({
            code: segmentCodeSchema.required(),
            name: segmentNameSchema.required()
        });

        return schema.validate(segment);
    },

    validateEdit: function(segment) {
        const schema = Joi.object({
            code: segmentCodeSchema,
            name: segmentNameSchema
        });

        return schema.validate(segment);
    }
};

module.exports = validators;
