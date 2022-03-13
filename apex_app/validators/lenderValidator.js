const Joi = require('@hapi/joi');
Joi.objectId = require('joi-objectid')(Joi);

const validators = {
    creation: function(lender) {
        const schema = Joi.object({
            // TODO: change values to required.
            companyName: Joi.string()
                            .required(),

            companyAddress: Joi.string()
                              .required(),

            cacNumber: Joi.string()
                          .required(),

            category: Joi.string()
                         .optional(),

            phone: Joi.string()
                      .length(11)
                      .optional(),

            email: Joi.string()
                      .email()
                      .required(),

            lenderURL: Joi.string()
                          .optional(),

        });
        return schema.validate(lender);
    },

    update: function (lender) {
        const schema = Joi.object({
            companyName: Joi.string()
                            .required(),

            companyAddress: Joi.string()
                               .required(),

            cacNumber: Joi.string()
                          .required(),

            category: Joi.string()
                         .optional(),

            phone: Joi.string()
                      .length(11)
                      .optional(),
        });
        return schema.validate(lender);  
    },

    delete: function(lender) {
        const schema = Joi.object({
            id: Joi.objectId().required(),
            email: Joi.string().email().required()
        });
        return schema.validate(lender);
    }
};


module.exports = validators;