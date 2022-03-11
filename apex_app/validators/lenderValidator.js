const Joi = require('@hapi/joi');

const validators = {
    creation: function(lender) {
        const schema = Joi.object({
            companyName: Joi.string().required().trim(),
            companyAddress: Joi.string().required(),
            cacNumber: Joi.string().required(),
            email: Joi.string().email().required()
        });

        return schema.validate(lender);
    },


};


module.exports = validators;