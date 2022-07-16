const Joi = require('joi');
const { ref } = require('joi');
Joi.objectId = require('joi-objectid')(Joi);


const nameSchema = Joi.object({
    firstName: Joi.string()
                  .min(3)
                  .max(50),

    lastName: Joi.string()
                 .min(3)
                 .max(50),

    middleName: Joi.string()
                   .min(3)
                   .max(50),
});

const genderSchema = Joi.string()
                        .valid('Male', 'Female');

const dateOfBirthSchema = Joi.date()
                             .less('now')
                             .message({'date.less': 'Date of Birth must be valid.'});

const residentialAddressSchema = Joi.object({
    street: Joi.string()
               .min(5)
               .max(255),

    state: Joi.objectId()
});

const contactSchema = Joi.object({
        phone: Joi.string()
                  .pattern(/^0([7-9])([0-1])[0-9]{8}$/)
                  .message({
                    "string.pattern.base": "Invalid phone number."
                  }),

        email: Joi.string()
                  .email()
                  .min(10)
                  .max(255)
});

const employmentSchema = Joi.object({
    segment: Joi.objectId(),
    
    ippis: Joi.string()
              .pattern(/^([a-zA-Z]{2,5})?.[0-9]{3,8}$/)
              .uppercase()
              .messages({'string.pattern.base': '{#label} Invalid IPPIS number.'}),

    companyLocation: Joi.string().lowercase(),

    state: Joi.objectId(),

    dateOfEnlistment: Joi.date()
                         .greater(Joi.ref('...dateOfBirth', { adjust: (value) => {
                                value.setFullYear(value.getFullYear() + 18);
                                return value;
                                }}))
                        // TODO: Improve on this error message
                         .message( {'date.greater': 'Invalid Date of Enlistment.'} )
});

const bvnSchema = Joi.string()
                     .pattern(/^22[0-9]{9}$/)
                     .message({'string.pattern.base': 'Invalid BVN.'})

const idSchema = Joi.object({
    idType: Joi.string(),

    idNumber: Joi.string()
});

const nokSchema = Joi.object({
    name: Joi.string(),

    address: Joi.object({
        street: Joi.string(),

        state: Joi.objectId()
    }),

    phone: Joi.string()
              .pattern(/^0([7-9])([0,1])[0-9]{8}$/)
              .message({
                "string.pattern.base": "Invalid phone number."
              }),

    relationship: Joi.string()
});

const accountInfoSchema = Joi.object({
    salaryAccountName: Joi.string(),

    salaryAccountNumber: Joi.string()
                            .pattern(/^[0-9]{10}$/),

    bank: Joi.objectId()
});

const netPaySchema = Joi.object({
    value: Joi.number()
});

const validators = {
    validateCreation: function(customer) {
        const schema = Joi.object({
            name: nameSchema.required(),
                          
            gender: genderSchema.required(),

            dateOfBirth: dateOfBirthSchema.required(),

            residentialAddress: residentialAddressSchema.required(),

            contact: contactSchema.required(),

            maritalStatus: Joi.string().required(),

            bvn: bvnSchema.required(),

            idCardInfo: idSchema.required(),

            employmentInfo: employmentSchema.required(),

            nok: nokSchema.required(),
            
            accountInfo: accountInfoSchema.required(),

            // not required because validator is used in loan creation
            netPay: netPaySchema.required()
        });

    return schema.validate(customer);
    },

    validateEdit: function(customer) {     
        const schema = Joi.object({
            name:nameSchema,
                           
            gender: genderSchema,

            dateOfBirth: dateOfBirthSchema,

            // TODO: Add required to fields.
            residentialAddress: residentialAddressSchema,

            contact: contactSchema,

            maritalStatus: Joi.string(),

            bvn: bvnSchema,

            idCardInfo: idSchema,

            employmentInfo: employmentSchema,

            nok: nokSchema,
            
            accountInfo: accountInfoSchema,
            
            // netPay: netPaySchema
        });

    return schema.validate(customer);
    }
};

module.exports = validators;
