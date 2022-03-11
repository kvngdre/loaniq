const Joi = require('@hapi/joi');
Joi.objectId = require('joi-objectid')(Joi);

const validators = {
    validateCreation: function(customer) {
        const dateTime = new Date()
        const today = dateTime.getFullYear()+'-'+(dateTime.getMonth()+1)+'-'+dateTime.getDate();
        
        const schema = Joi.object({
            firstName: Joi.string().required().min(3).max(50).message({'string.error': 'First name is invalid'}),
            lastName: Joi.string().required().min(3).max(50),
            middleName: Joi.string().optional().min(3).max(50),
            gender: Joi.string().required().valid('Male', 'Female'),
            // TODO: Google how to validate dates with Joi
            // TODO: fix timezone for today variable.
            dateOfBirth: Joi.date().less(today).required(),
            // TODO: Add required to fields.
            // residentialAddress: Joi.string().min(5).max(255),
            stateResident: Joi.objectId().required(),
            phone: Joi.string().length(11).required(),
            email: Joi.string().email().min(10).max(255).required(),
            ippis: Joi.string()
                      .required()
                      .pattern(/([a-zA-z]{2,3})?[0-9]{3,7}/)
                      .messages( {'string.pattern.base': 'Invalid IPPIS number.'} ),
            companyName: Joi.objectId().required(),
            bankName: Joi.objectId().required()
        });

    return schema.validate(customer);
    }
};

module.exports = validators;
