const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);

const validators = {
    create: function (obj) {
        const schema = Joi.object({
            docId: Joi.objectId().required(),
            type: Joi.string().valid('Customer', 'Loan').required(),
            alteration: Joi.object().required(),
        });

        return schema.validate(obj);
    },

    update: function (user, payload) {
        switch (user.role) {
            case 'Credit':
            case 'Operations':
                return (function (payload) {
                    const schema = Joi.object({
                        alteration: Joi.object().min(1).messages({
                            'object.min': 'Alteration cannot be empty.'
                        }),

                        status: Joi.string().valid(
                            'Approved',
                            'Pending',
                            'Denied'
                        ).messages({
                            'any.only': 'Not a valid status'
                        }),

                        remark: Joi.string().when('status', {
                            is: ['Denied', 'Approved'],
                            then: Joi.required(),
                            otherwise: Joi.optional(),
                        }).min(10).max(255).messages({
                            'string.min': 'Remark is too short.',
                            'string.max': 'Remark is too long.',
                        }),
                    });
                    return schema.validate(payload);

                }).call(this, payload);

            case 'Admin':
            case 'Loan Agent':
                return (function (payload) {
                    const schema = Joi.object({
                        alteration: Joi.object().min(1).messages({
                            'object.min': 'Alteration cannot be empty.'
                        }),
                    });
                    return schema.validate(payload);

                }).call(this, payload);
                
            default:
                return {
                    error: {
                        details: [ { message: 'Invalid role'} ]
                    }
                }
        }
    },
};

module.exports = validators;
