const Joi = require('joi');
const { DateTime } = require('luxon');

function isValidDOB(dob, helper) {
    const dobFormatted = DateTime.fromISO(new Date(dob).toISOString()).toFormat(
        'yyyy-MM-dd'
    );
    const minDob = DateTime.now().minus({ years: 18 }).toFormat('yyyy-MM-dd');

    if (dobFormatted > minDob) return helper.error('date.less');

    return dob;
}

const nameSchema = Joi.string().min(10).max(70).messages({
    'string.min': `Employee name is too short.`,
    'string.max': `Employee name is too long.`,
});

const genderSchema =  Joi.string().valid('Male', 'Female');

const phoneSchema = Joi.string()
.min(13)
.max(14)
.pattern(/^\+?([0-9]){3}([7-9])([0,1])[0-9]{8}$/)
.messages({
    'string.min': 'Invalid phone number.',
    'string.max': 'Phone number is too long.',
    'string.pattern.base':
        'Invalid phone number, please include international dialing code.',
})

const dateOfBirthSchema = Joi.date()
    .custom(isValidDOB)
    .message({ 'date.less': 'Must be 18 years or older.' });

const bvnSchema = Joi.string()
    .pattern(/^22[0-9]{9}$/)
    .message({ 'string.pattern.base': 'Invalid BVN.' });

const ippisSchema = Joi.string()
    .pattern(/^([a-zA-Z]{2,5})?.[0-9]{3,8}$/)
    .uppercase()
    .messages({ 'string.pattern.base': 'Invalid IPPIS number.' });

const dateOfEnlistmentSchema = Joi.date()
    .greater(
        Joi.ref('dateOfBirth', {
            adjust: (value) => {
                value.setFullYear(value.getFullYear() + 18);
                return value;
            },
        })
    )
    .message({ 'date.greater': 'Invalid Date of Enlistment.' });

const accountNoSchema = Joi.string()
    .pattern(/^[0-9]{10}$/)
    .message({
        'string.pattern.base': 'Invalid account number.',
    });

const validators = {
    create: function (customer) {
        const schema = Joi.object({
            name: nameSchema,

            gender: genderSchema,

            phone: phoneSchema,

            dateOfBirth: dateOfBirthSchema,

            bvn: bvnSchema,

            ippis: ippisSchema,

            segment: Joi.string(),

            netPays: Joi.array().items(Joi.number()),

            dateOfEnlistment: dateOfEnlistmentSchema,

            accountNumber: accountNoSchema,

            bank: Joi.string(),

            command: Joi.string(),
        });
        return schema.validate(customer, { abortEarly: false });
    },

    update: function (customer) {
        const schema = Joi.object({
            name: nameSchema,

            gender: genderSchema,

            phone: phoneSchema,

            dateOfBirth: dateOfBirthSchema,

            bvn: bvnSchema,

            ippis: ippisSchema,

            segment: Joi.string(),

            netPays: Joi.array().items(Joi.number()),

            dateOfEnlistment: dateOfEnlistmentSchema,

            accountNumber: accountNoSchema,

            bank: Joi.string(),

            command: Joi.string(),
        });
        return schema.validate(customer);
    },
};

module.exports = validators;
