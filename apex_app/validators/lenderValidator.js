const Joi = require('joi');
const { joiPassword } = require('joi-password');
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

    adminCreation: function (user) {
        const schema = Joi.object({
            name: Joi.object({
                firstName: Joi.string().required().min(3).max(50),
                lastName: Joi.string().required().min(3).max(50),
                middleName: Joi.string().min(3).max(50),
            }),            
            email: Joi.string().required().email().min(10).max(255),
            role: Joi.string().equal('admin'),
            active: Joi.boolean().equal(true),
            lenderId: Joi.objectId(),
            password: joiPassword
                        .string()
                        .required()
                        .minOfUppercase(1)
                        .minOfSpecialCharacters(2)
                        .minOfNumeric(2)
                        .noWhiteSpaces()
                        .min(6)
                        .max(255)
                        .messages({
                            'password.minOfUppercase': '{#label} should contain at least {#min} uppercase character.',
                            'password.minOfSpecialCharacters': '{#label} should contain at least {#min} special characters.',
                            'password.minOfNumeric': '{#label} should contain at least {#min} numbers.',
                            'password.noWhiteSpaces': '{#label} should not contain white spaces.'
                        })
    
        });
    
        return schema.validate(user);
    },

    update: function (lender) {
        const schema = Joi.object({
            companyName: Joi.string()
                            .required(),

            companyAddress: Joi.string()
                               .required(),

            cacNumber: Joi.string()
                          .required(),

            category: Joi.string(),

            phone: Joi.string()
                      .length(11)
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