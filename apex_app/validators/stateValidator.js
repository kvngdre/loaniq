const Joi = require('joi');

const stateCodeSchema = Joi.string()
                           .pattern(/^[a-zA-z]{2}$/)
const stateNameSchema = Joi.string();
const stateLgasSchema = Joi.array()
                           .items(Joi.string())

const validators = {
    validateCreation: function(state) {
        const schema = Joi.object({
            code: stateCodeSchema.required(),
            name: stateNameSchema.required(),
            lgas: stateLgasSchema.required()
        });

        return schema.validate(state);
    },

    validateEdi(state) {
        const schema = Joi.object({
            code: stateCodeSchema,
            name: stateNameSchema,
            lgas: stateLgasSchema
        });

        return schema.validate(state);
    }
};

module.exports = validators;
