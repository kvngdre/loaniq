const Joi = require('joi');
const { DateTime } = require('luxon');
Joi.objectId = require('joi-objectid')(Joi);

function isValidDOB(dob, helper) {
    const dobFormatted = DateTime.fromISO(new Date(dob).toISOString()).toFormat(
        'yyyy-MM-dd'
    );
    const minDob = DateTime.now().minus({ years: 18 }).toFormat('yyyy-MM-dd');

    if (dobFormatted > minDob) return helper.error('date.less');

    return dob;
}

const nameSchema = Joi.object({
    first: Joi.string().min(3).max(30).messages({
        'string.min': `First name is too short.`,
        'string.max': `first name is too long.`,
    }),
    last: Joi.string().min(3).max(30).messages({
        'string.min': `Surname is too short.`,
        'string.max': `Surname is too long.`,
    }),
    middle: Joi.string().min(3).max(30).messages({
        'string.min': `Middle name is too short.`,
        'string.max': `Middle name is too long.`,
    }),
});

const genderSchema = Joi.string().valid('Male', 'Female');

const dateOfBirthSchema = Joi.date()
    .custom(isValidDOB)
    .message({ 'date.less': 'Must be 18 years or older.' });

const addressSchema = Joi.object({
    street: Joi.string().min(9).max(70).messages({
        'string.min': `Street name is too short.`,
        'string.max': `Street name is too long.`,
    }),
    state: Joi.string(),
    stateCode: Joi.string().length(2),
    lga: Joi.string(),
    geo: Joi.string(),
});

const contactSchema = Joi.object({
    phone: Joi.string()
        .pattern(/^\+?([0-9]){3}([7-9])([0,1])[0-9]{8}$/)
        .message({
            'string.pattern.base':
                'Invalid phone number, please include international dialing code.',
        }),
    email: Joi.string().email().min(10).max(50).messages({
        'string.min': `Invalid email address.`,
        'string.max': `Invalid email address.`,
    }),
});

const employmentSchema = Joi.object({
    name: Joi.string().min(10).max(70).messages({
        'string.min': `Next of kin name is too short.`,
        'string.max': `Next of kin name is too long.`,
    }),
    depart: Joi.string().min(3).max(50),
    segment: Joi.objectId(),
    ippis: Joi.string()
        .pattern(/^([a-zA-Z]{2,5})?.[0-9]{3,8}$/)
        .uppercase()
        .messages({ 'string.pattern.base': 'Invalid IPPIS number.' }),
    companyLocation: addressSchema,
    dateOfEnlistment: Joi.date()
        .min(
            Joi.ref('...dateOfBirth', {
                adjust: (value) => {
                    value.setFullYear(value.getFullYear() + 18);
                    return value;
                },
            })
        )
        // TODO: Improve on this error message
        .message({ 'date.min': 'Invalid Date of Enlistment.' }),
});

const bvnSchema = Joi.string()
    .pattern(/^22[0-9]{9}$/)
    .message({ 'string.pattern.base': 'Invalid BVN.' });

const idSchema = Joi.object({
    idType: Joi.string().valid(
        'Voters card',
        'International passport',
        'Staff ID card',
        'National ID card',
        "Driver's license"
    ),
    idNumber: Joi.string()
        .pattern(/^([a-zA-Z]{2,7})?.[0-9]{3,11}$/)
        .messages({ 'string.pattern.base': 'Invalid ID number.' }),
});

const nokSchema = Joi.object({
    fullName: Joi.string(),
    address: addressSchema,
    phone: Joi.string()
        .pattern(/^\+?([0-9]){3}([7-9])([0,1])[0-9]{8}$/)
        .message({
            'string.pattern.base':
                'Invalid next of kin phone number, please include international dialing code.',
        }),
    relationship: Joi.string(),
});

const accountInfoSchema = Joi.object({
    accountName: Joi.string().min(10).max(70).messages({
        'string.min': `Account name is too short.`,
        'string.max': `Account name is too long.`,
    }),
    accountNumber: Joi.string()
        .pattern(/^[0-9]{10}$/)
        .message({
            'string.pattern.base': 'Invalid account number.',
        }),
    bank: {
        name: Joi.string(),
        code: Joi.string(),
    },
});

const netPaySchema = Joi.object({
    value: Joi.number().precision(2),
});

const validators = {
    create: function (customer) {
        const schema = Joi.alternatives().try(
            Joi.objectId().required(),
            Joi.object({
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
            })
        );

        return schema.validate(customer, {abortEarly: false});
    },

    validateEdit: function (customer) {
        const schema = Joi.object({
            name: nameSchema,
            gender: genderSchema,
            dateOfBirth: dateOfBirthSchema,
            residentialAddress: addressSchema,
            contactInfo: contactSchema,
            maritalStatus: Joi.string(),
            bvn: bvnSchema,
            idCardInfo: idSchema,
            employmentInfo: employmentSchema,
            nok: nokSchema,
            accountInfo: accountInfoSchema,
            netPay: netPaySchema,
        });

        return schema.validate(customer);
    },
};

module.exports = validators;
