const Joi = require('joi');
const { ref } = require('joi');
Joi.objectId = require('joi-objectid')(Joi);

const validators = {
    validateCreation: function(customer) {
        const schema = Joi.object({
            name: Joi.object({
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
            }),
                          
            gender: Joi.string()
                       .valid('Male', 'Female')
                       .required(),

            dateOfBirth: Joi.date()
                            .less('now')
                            .message({'date.less': 'Date of Birth must be valid.'})
                            .required(),

            // TODO: Add required to fields.
            residentialAddress: Joi.object({
                street: Joi.string()
                           .min(5)
                           .max(255),

                state: Joi.objectId()
                          .required(),
            }),

            contact: {
                phone: Joi.string()
                          .length(11)
                          .required(),

                email: Joi.string()
                          .email()
                          .min(10)
                          .max(255)
                          .required(),
            },

            maritalStatus: Joi.string(),

            bvn: Joi.string()
                    .pattern(/^22/)
                    .message( {'string.pattern.base': 'Invalid BVN.'} )
                    .length(11)
                    .required(),

            idCardInfo: Joi.object({
                idType: Joi.string(),

                idNumber: Joi.string(),
            }),

            employmentInfo: Joi.object({
                segment: Joi.objectId()
                            .required(),
                
                ippis: Joi.string()
                          .pattern(/([a-zA-z]{2,3})?[0-9]{3,7}/)
                          .messages({'string.pattern.base': 'Invalid IPPIS number.'})
                          .required(),

                companyLocation: Joi.string(),

                state: Joi.objectId(),

                dateOfEnlistment: Joi.date()
                                     .greater(Joi.ref('...dateOfBirth', { adjust: (value) => {
                                            value.setFullYear(value.getFullYear() + 18);
                                            return value;
                                            }}))
                                    // TODO: Improve on this error message
                                     .message( {'date.greater': 'Invalid Date of Enlistment.'} )
                                     .required()
            }),

            nok: Joi.object({
                name: Joi.string(),

                address: Joi.object({
                    street: Joi.string(),

                    state: Joi.objectId()
                }),

                phone: Joi.string(),

                relationship: Joi.string()
            }),
            
            accountInfo: Joi.object({
                salaryAccountName: Joi.string(),

                salaryAccountNumber: Joi.string()
                                        .length(10),

                bankName: Joi.objectId()
                             .required(),
            }),

            loanAgent: Joi.objectId(),

            netPay: Joi.number()
        });

    return schema.validate(customer);
    },

    validateEdit: function(customer) {     
        const schema = Joi.object({
            firstName: Joi.string()
                          .min(3)
                          .max(50)
                          .message({'string.error': 'First name is invalid'}),

            lastName: Joi.string()
                         .min(3)
                         .max(50),

            middleName: Joi.string()
                           .min(3)
                           .max(50),
                           
            gender: Joi.string()
                       .valid('Male', 'Female'),

            dateOfBirth: Joi.date()
                            .less('now')
                            .message( {'date.less': 'Date of Birth must be valid.'} ),

            residentialAddress: Joi.string()
                                   .min(5)
                                   .max(255),

            stateResident: Joi.objectId(),

            maritalStatus: Joi.string(),

            phone: Joi.string()
                      .length(11),

            email: Joi.string()
                      .email()
                      .min(10)
                      .max(255),

            bvn: Joi.string()
                    .pattern(/^22/)
                    .message( {'string.pattern.base': 'Invalid BVN.'} )
                    .length(11),
            
            validId: Joi.string(),

            idNumber: Joi.string(),

            ippis: Joi.string()
                      .pattern(/([a-zA-z]{2,3})?[0-9]{3,7}/)
                      .messages( {'string.pattern.base': 'Invalid IPPIS number.'} ),

            segment: Joi.objectId(),

            companyLocation: Joi.string()
                                .min(6),

            companyState: Joi.objectId(),
            
            dateOfEnlistment: Joi.date()
                                 .greater(Joi.ref('dateOfBirth', {adjust: (value) => {
                                    value.setFullYear(value.getFullYear() + 18);
                                    return value;
                                }}))
                                // TODO: Improve on this error message
                                 .message( {'date.greater': 'Invalid Date of Enlistment.'} ),
            
            nameNOK: Joi.string(),

            addressNOK: Joi.string(),

            stateNOK: Joi.objectId(),

            phoneNOK: Joi.string()
                         .length(11),
            
            relationshipNOK: Joi.string(),

            salaryAccountName: Joi.string(),

            salaryAccountNumber: Joi.string()
                                    .length(10),
            
            bankName: Joi.objectId(),
            
            // TODO: OR should be a string? 
            loans: Joi.array()
                      .items(Joi.objectId()),
            
            loanAgent: Joi.object({
                id: Joi.objectId(),
                firstName: Joi.string(),
                lastName: Joi.string()
            }),

        });

    return schema.validate(customer);
    }
};

module.exports = validators;
