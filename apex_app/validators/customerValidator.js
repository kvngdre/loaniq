const Joi = require('@hapi/joi');
const { ref } = require('joi');
Joi.objectId = require('joi-objectid')(Joi);

const validators = {
    validateCreation: function(customer) {
        const dateTime = new Date()
        const today = dateTime.getFullYear()+'-'+(dateTime.getMonth()+1)+'-'+dateTime.getDate();
        
        const schema = Joi.object({
            firstName: Joi.string()
                          .min(3)
                          .max(50)
                          .message({'string.error': 'First name is invalid'})
                          .required(),

            lastName: Joi.string()
                         .min(3)
                         .max(50)
                         .required(),

            middleName: Joi.string()
                           .min(3)
                           .max(50)
                           .optional(),
                           
            gender: Joi.string()
                       .valid('Male', 'Female')
                       .required(),

            // TODO: Google how to validate dates with Joi
            // TODO: fix timezone for today variable.
            dateOfBirth: Joi.date()
                            .less('now')
                            .message( {'date.less': 'Date of Birth must be valid.'} )
                            .required(),

            // TODO: Add required to fields.
            // residentialAddress: Joi.string().min(5).max(255),
            stateResident: Joi.objectId()
                              .required(),

            phone: Joi.string()
                      .length(11)
                      .required(),

            email: Joi.string()
                      .email()
                      .min(10)
                      .max(255)
                      .required(),

            bvn: Joi.string()
                    .pattern(/^22/)
                    .message( {'string.pattern.base': 'Invalid BVN'} )
                    .length(11),

            ippis: Joi.string()
                      .pattern(/([a-zA-z]{2,3})?[0-9]{3,7}/)
                      .messages( {'string.pattern.base': 'Invalid IPPIS number.'} )
                      .required(),

            companyName: Joi.objectId()
                            .required(),
            
            bankName: Joi.objectId()
                         .required(),

            dateOfEnlistment: Joi.date()
                                 .greater(Joi.ref('dateOfBirth', {adjust: (value) => {
                                    value.setFullYear(value.getFullYear() + 18);
                                    return value;
                                }}))
                                // TODO: Improve on this error message
                                 .message( {'date.greater': 'Invalid Date of Enlistment.'} )
                                 .required()

        });

    return schema.validate(customer);
    }
};

module.exports = validators;
