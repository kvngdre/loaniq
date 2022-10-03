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
        'string.min': 'First name is too short.',
        'string.max': 'first name is too long.',
    }),
    last: Joi.string().min(3).max(30).messages({
        'string.min': 'Surname is too short.',
        'string.max': 'Surname is too long.',
    }),
    middle: Joi.string().min(3).max(30).messages({
        'string.min': 'Middle name is too short.',
        'string.max': 'Middle name is too long.',
    }),
});

const genderSchema = Joi.string().valid('Male', 'Female').messages({
    'any.only': 'Invalid gender',
});

const birthDateSchema = Joi.date()
    .custom(isValidDOB)
    .message({ 'date.less': 'Must be 18 years or older.' });

const phoneSchema = Joi.string()
    .min(13)
    .max(14)
    .pattern(/^\+?([0-9]){3}([7-9])([0,1])[0-9]{8}$/)
    .messages({
        'string.min': 'Invalid phone number.',
        'string.max': 'Phone number is too long.',
        'string.pattern.base':
            'Invalid phone number, please include international dialling code.',
    });

const emailSchema = Joi.string().email().min(10).max(50).messages({
    'string.min': 'Invalid email address.',
    'string.max': 'Invalid email address.',
    'string.email': 'Please enter a valid email',
});

const ippisSchema = Joi.string()
    .pattern(/^([a-zA-Z]{2,5})?.[0-9]{3,8}$/)
    .uppercase()
    .messages({ 'string.pattern.base': 'Invalid IPPIS number.' });

const employerSchema = Joi.object({
    name: Joi.string().min(2).max(70).messages({
        'string.min': 'Employer name is not valid.',
        'string.max': 'Employer name is too long.',
    }),
    command: Joi.string().min(3).max(50).messages({
        'string.min': 'Command is not valid.',
        'string.max': 'Command is too long.',
    }),
    segment: Joi.string()
        .min(1)
        .max(10)
        .required()
        .messages({
            'string.min': 'Invalid segment.',
            'string.max': 'Invalid segment',
        })
        .uppercase(),
    companyLocation: Joi.object({
        address: Joi.string()
            .min(5)
            .max(100)
            .messages({
                'string.min': 'Address is too short.',
                'string.max': 'Address is too long.',
            })
            .required(),
        state: Joi.string().required(),
        lga: Joi.string().required(),
    }),
    hireDate: Joi.date()
        .min(
            Joi.ref('...birthDate', {
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
    .message({ 'string.pattern.base': 'Invalid BVN' });

const idTypeSchema = Joi.string().valid(
    'Voters card',
    'International passport',
    'Staff ID card',
    'National ID card',
    "Driver's license"
);
const idNoSchema = Joi.string()
    .pattern(/^([a-zA-Z]{2,7})?.[0-9]{3,11}$/)
    .messages({ 'string.pattern.base': 'Invalid ID number' });

const nokSchema = Joi.object({
    fullName: Joi.string().min(10).max(70).messages({
        'string.min': 'Next of kin name is too short.',
        'string.max': 'Next of kin name is too long.',
    }),
    address: Joi.object({
        address: Joi.string()
            .min(9)
            .max(100)
            .messages({
                'string.min': 'Next of kin address is too short.',
                'string.max': 'Next of kin address is too long.',
            })
            .required(),
        state: Joi.string().required(),
        lga: Joi.string().required(),
    }),
    phone: Joi.string()
        .pattern(/^\+?([0-9]){3}([7-9])([0,1])[0-9]{8}$/)
        .message({
            'string.pattern.base':
                'Invalid next of kin phone number, please include international dialling code',
        }),
    relationship: Joi.string(),
});

const accountNameSchema = Joi.string().min(8).max(100).messages({
    'string.min': 'Account name is not valid',
    'string.max': 'Account name is too long',
});
const accountNoSchema = Joi.string()
    .pattern(/^[0-9]{10}$/)
    .message({
        'string.pattern.base': 'Invalid account number.',
    });
const bankSchema = {
    name: Joi.string(),
    code: Joi.string(),
};

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
                birthDate: birthDateSchema.required(),
                residentialAddress: Joi.object({
                    address: Joi.string()
                        .min(9)
                        .max(70)
                        .messages({
                            'string.min': 'Address is too short.',
                            'string.max': 'Address is too long.',
                        })
                        .required(),
                    state: Joi.string().required(),
                    stateCode: Joi.string().length(2).required(),
                    lga: Joi.string().required(),
                    geo: Joi.string().required(),
                }),
                phone: phoneSchema.required(),
                email: emailSchema.required(),
                maritalStatus: Joi.string().required(),
                bvn: bvnSchema.required(),
                ippis: ippisSchema.required(),
                idType: idTypeSchema.required(),
                idNo: idNoSchema.required(),
                employer: employerSchema.required(),
                nok: nokSchema.required(),
                accountName: accountNameSchema.required(),
                accountNo: accountNoSchema.required(),
                bank: bankSchema.required(),
                netPay: netPaySchema.required(),
            })
        );

        return schema.validate(customer, { abortEarly: false });
    },

    update: function (customer) {
        const schema = Joi.object({
            name: nameSchema,
            gender: genderSchema,
            birthDate: birthDateSchema,
            residentialAddress: Joi.object({
                address: Joi.string()
                    .min(9)
                    .max(70)
                    .messages({
                        'string.min': 'Address is too short.',
                        'string.max': 'Address is too long.',
                    })
                    ,
                state: Joi.string(),
                stateCode: Joi.string().length(2),
                lga: Joi.string(),
                geo: Joi.string(),
            }),
            phone: phoneSchema,
            email: emailSchema,
            maritalStatus: Joi.string(),
            bvn: bvnSchema,
            ippis: ippisSchema,
            idType: idTypeSchema,
            idNo: idNoSchema,
            employer: employerSchema,
            nok: nokSchema,
            accountName: accountNameSchema,
            accountNo: accountNoSchema,
            bank: bankSchema,
        }).min(1);

        return schema.validate(customer);
    },
};

module.exports = validators;
