const Joi = require('joi');
const { ref } = require('joi');
const { DateTime } = require('luxon');
Joi.objectId = require('joi-objectid')(Joi);


function isValidDOB(dob, helper) {
    const dobFormatted = DateTime.fromISO(new Date(dob).toISOString()).toFormat('yyyy-MM-dd')
    const minDob = DateTime.now().minus({'years': 21}).toFormat('yyyy-MM-dd')
    console.log(minDob)
    console.log(dobFormatted)
    
    if(dobFormatted > minDob) return helper.error('date.less')

    return dob;
}

const nameSchema = Joi.object({
    first: Joi.string()
                  .min(3)
                  .max(50),

    last: Joi.string()
                 .min(3)
                 .max(50),

    middle: Joi.string()
                   .min(3)
                   .max(50),
});

const genderSchema = Joi.string()
                        .valid('Male', 'Female');

const dateOfBirthSchema = Joi.date()
                             .custom(isValidDOB)
                             .message({'date.less': 'Error Date of Birth: Age must be minimum 21'});

const addressSchema = Joi.object({
    street: Joi.string()
               .min(5)
               .max(255),

    state: Joi.string(),

    stateCode: Joi.string()
                  .length(2),

    lga: Joi.string(),

    geo: Joi.string()
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
    name: Joi.string(),

    segment: Joi.objectId(),
    
    ippis: Joi.string()
              .pattern(/^([a-zA-Z]{2,5})?.[0-9]{3,8}$/)
              .uppercase()
              .messages({'string.pattern.base': '{#label} Invalid IPPIS number.'}),

    companyLocation: addressSchema,

    dateOfEnlistment: Joi.date()
                         .min(Joi.ref('...dateOfBirth', { adjust: (value) => {
                                value.setFullYear(value.getFullYear() + 21);
                                console.log(value)
                                return value;
                                }}))
                        // TODO: Improve on this error message
                         .message( {'date.min': 'Invalid Date of Enlistment.'} )
});

const bvnSchema = Joi.string()
                     .pattern(/^22[0-9]{9}$/)
                     .message({'string.pattern.base': 'Invalid BVN.'})

const idSchema = Joi.object({
    idType: Joi.string(),

    idNumber: Joi.string()
});

const nokSchema = Joi.object({
    fullName: Joi.string(),

    address: addressSchema,

    phone: Joi.string()
              .pattern(/^0([7-9])([0,1])[0-9]{8}$/)
              .message({
                "string.pattern.base": "Invalid phone number"
              }),

    relationship: Joi.string()
});

const accountInfoSchema = Joi.object({
    salaryAccountName: Joi.string(),

    salaryAccountNumber: Joi.string()
                            .pattern(/^[0-9]{10}$/)
                            .message({
                                "string.pattern.base": "Invalid account number"
                              }),

    bank: {
        name: Joi.string(),
        code: Joi.string()
    }
});

const netPaySchema = Joi.object({
    value: Joi.number().precision(2)
});

const validators = {
    validateCreation: function(customer) {
        const schema = Joi.object({
            name: nameSchema.required(),
                          
            gender: genderSchema.required(),

            dateOfBirth: dateOfBirthSchema.required(),

            residentialAddress: addressSchema.required(),

            contactInfo: contactSchema.required(),

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
            residentialAddress: addressSchema,

            contactInfo: contactSchema,

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
