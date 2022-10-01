const { roles } = require('../utils/constants');
const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);
const { joiPassword } = require('joi-password');

function isValidDOB(dob, helper) {
    const dobFormatted = DateTime.fromISO(new Date(dob).toISOString()).toFormat(
        'yyyy-MM-dd'
    );
    const minDob = DateTime.now().minus({ years: 18 }).toFormat('yyyy-MM-dd');

    if (dobFormatted > minDob) return helper.error('date.less');

    return true;
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

const jobTitleSchema = Joi.string().min(2).max(50).messages({
    'string.min': `Job title is too short.`,
    'string.max': `Job title is too long.`,
})

const dobSchema = Joi.object({
    day: Joi.number().min(1).max(31).required,
    month: Joi.number().min(1).max(12).required(),
    year: Joi.number().min(1970).max(new Date().getFullYear())
})
    .custom(isValidDOB)
    .message({ 'date.less': 'Must be 18 years or older.' });

const displayNameSchema = Joi.string();

const phoneSchema = Joi.string()
    .pattern(/^\+?([0-9]){3}([7-9])([0,1])[0-9]{8}$/)
    .message({
        'string.pattern.base': 'Invalid phone number, please include international dialling code.',
    });

const emailSchema = Joi.string().email().min(10).max(50).messages({
    'string.min': 'Invalid email address',
    'string.max': 'Invalid email address',
    'string.email': 'Please enter a valid email',
});

const passwordSchema = joiPassword
    .string()
    .minOfUppercase(1)
    .minOfSpecialCharacters(2)
    .minOfNumeric(2)
    .noWhiteSpaces()
    .min(6)
    .max(40)
    .messages({
        'password.minOfUppercase':
            '{#label} should contain at least {#min} uppercase character.',
        'password.minOfSpecialCharacters':
            '{#label} should contain at least {#min} special characters.',
        'password.minOfNumeric':
            '{#label} should contain at least {#min} numbers.',
        'password.noWhiteSpaces': '{#label} should not contain white spaces.',
    });

const otpSchema = Joi.string()
    .pattern(/^[0-9]{8}$/)
    .messages({ 'string.pattern.base': 'Invalid OTP' });

const segmentSchema = Joi.alternatives().try(
    Joi.array().items(Joi.objectId).min(1),
    Joi.string().valid('all')
);

const validators = {
    create: function (user) {
        if (!user.role)
            return {
                error: {
                    details: [{ message: 'Role is required' }],
                },
            };

        switch (user.role) {
            case roles.owner:
            case roles.admin:
                return (function (user) {
                    const schema = Joi.object({
                        lenderId: Joi.objectId().required(),
                        name: nameSchema.required(),
                        title: jobTitleSchema,
                        gender: genderSchema.required(),
                        dob: dobSchema,
                        displayName: Joi.string(),
                        phone: phoneSchema.required(),
                        email: emailSchema.required(),
                        role: Joi.string().valid(roles.admin, roles.owner).required(),
                    });
                    return schema.validate(user);
                }).call(this, user);

            case roles.credit:
                return (function (user) {
                    const schema = Joi.object({
                        name: nameSchema.required(),
                        title: jobTitleSchema,
                        gender: genderSchema.required(),
                        dob: dobSchema,
                        displayName: Joi.string(),
                        phone: phoneSchema.required(),
                        email: emailSchema.required(),
                        role: Joi.string().valid(roles.credit).required(),
                        segments: segmentSchema.required(),
                    });
                    return schema.validate(user);
                }).call(this, user);

            case roles.operations:
                return (function (user) {
                    const schema = Joi.object({
                        name: nameSchema,
                        title: jobTitleSchema,
                        gender: genderSchema.required(),
                        dob: dobSchema,
                        displayName: Joi.string(),
                        phone: phoneSchema,
                        email: emailSchema,
                        role: Joi.string().valid(roles.operations).required(),
                    });
                    return schema.validate(user);
                }).call(this, user);

            case roles.agent:
                return (function (user) {
                    const schema = Joi.object({
                        name: nameSchema.required(),
                        title: jobTitleSchema,
                        gender: genderSchema.required(),
                        dob: dobSchema,
                        displayName: Joi.string(),
                        phone: phoneSchema.required(),
                        email: emailSchema.required(),
                        role: Joi.string().valid(roles.agent).required(),
                        segments: segmentSchema.required(),
                        target: Joi.number().required(),
                        achieved: Joi.number(),
                    });
                    return schema.validate(user);
                }).call(this, user);

            case roles.master:
                return (function (user) {
                    const schema = Joi.object({
                        lenderId: Joi.objectId().required(),
                        name: nameSchema.required(),
                        title: jobTitleSchema,
                        gender: genderSchema.required(),
                        dob: dobSchema,
                        displayName: Joi.string(),
                        phone: phoneSchema.required(),
                        email: emailSchema.required(),
                        role: Joi.string().valid(roles.admin, roles.owner).required(),
                    });
                    return schema.validate(user);
                }).call(this, user);

            default:
                return {
                    error: {
                        details: [{ message: 'Invalid role' }],
                    },
                };
        }
    },

    update: function (user) {
        const schema = Joi.object({
            name: nameSchema,
            gender: genderSchema,
            displayName: displayNameSchema,
            phone: phoneSchema,
            role: Joi.string(),
            segments: segmentSchema,
            target: Joi.number(),
            active: Joi.boolean(),
        });

        return schema.validate(user);
    },

    email: function (user) {
        const schema = Joi.object({
            email: emailSchema.required(),
        });

        return schema.validate(user);
    },

    changePassword: function (passwordObj) {
        const schema = Joi.object({
            otp: otpSchema.when('currentPassword', {
                not: Joi.exist(),
                then: Joi.required(),
                otherwise: Joi.optional(),
            }),
            email: emailSchema.required(),
            currentPassword: Joi.string().max(255),
            newPassword: passwordSchema.required(),
        });

        return schema.validate(passwordObj);
    },
};

module.exports = validators;
