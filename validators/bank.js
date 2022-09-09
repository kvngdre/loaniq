const Joi = require('joi');

const bankNameSchema = Joi.string().min(10).max(255);

const bankCodeSchema = Joi.string()
                          .min(3)
                          .max(6)
                          .pattern(/^[0-9]{3,6}$/);

const validators = {
    validateCreation: function(bank) {
        const schema = Joi.object({
            name: bankNameSchema.required(),
            code: bankCodeSchema.required()
        });       

        return schema.validate(bank);
    },

    validateEdit: function(bank){
        const schema = Joi.object({
            name: bankNameSchema,
            code: bankCodeSchema
        });       

        return schema.validate(bank);
    }
};

module.exports = validators;
