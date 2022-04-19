const Joi = require('joi');

const validators = {
    create: function(customer) {
        const schema = Joi.object({
            name: Joi.string(),

            dateOfBirth: Joi.date().less('now'),

            bvn: Joi.string()
                    .pattern(/^22[0-9]{9}$/)
                    .message({'string.pattern.base': '{#label} Invalid BVN.'}),

            ippis: Joi.string()
                      .pattern(/^([a-zA-Z]{2,5})?.[0-9]{3,8}$/)
                      .messages({'string.pattern.base': '{#label} Invalid IPPIS number.'}),
                    
            segment: Joi.string(),

            netPays: Joi.array().items(Joi.number()),

            dateOfEnlistment: Joi.date()
                                 .greater(Joi.ref('dateOfBirth', 
                                 { adjust: (value) => {value.setFullYear(value.getFullYear() + 18);
                                 return value; }}))
                                 .message( {'date.greater': 'Invalid Date of Enlistment.'} ),
            
            salaryAccountNumber: Joi.string().pattern(/^[0-9]{10}$/),

            bank: Joi.string(),

            command: Joi.string()

        });
        return schema.validate(customer);
    },

    edit: function(customer) {
        const schema = Joi.object({
            name: Joi.string(),

            dateOfBirth: Joi.date().less('now'),

            bvn: Joi.string()
                    .pattern(/^22[0-9]{9}$/)
                    .message({'string.pattern.base': '{#label} Invalid BVN.'}),

            ippis: Joi.string()
                      .pattern(/^([a-zA-Z]{2,5})?.[0-9]{3,8}$/)
                      .messages({'string.pattern.base': '{#label} Invalid IPPIS number.'}),
                    
            segment: Joi.string(),

            netPays: Joi.array().items(Joi.number()),

            dateOfEnlistment: Joi.date()
                                 .greater(Joi.ref('dateOfBirth', 
                                 { adjust: (value) => {value.setFullYear(value.getFullYear() + 18);
                                 return value; }}))
                                 .message( {'date.greater': 'Invalid Date of Enlistment.'} ),
            
            salaryAccountNumber: Joi.string().pattern(/^[0-9]{10}$/),

            bank: Joi.string(),

            command: Joi.string()

        });
        return schema.validate(customer);   
    }
};

module.exports = validators;