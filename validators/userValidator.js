const { roles } = require('../utils/constants');
const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);
const { joiPassword } = require('joi-password');

const nameSchema = Joi.object({
    first: Joi.string().min(2).max(255).messages({
        'string.min': 'Invalid first name',
        'string.max': 'First name is too long.',
        'any.required': 'First name is required',
    }),
    last: Joi.string().min(2).max(255).messages({
        'string.min': 'Invalid surname',
        'string.max': 'Surname is too long.',
        'any.required': 'Surname is required',
    }),
    middle: Joi.string().min(2).max(255).messages({
        'string.min': 'Invalid middle name',
        'string.max': 'Middle name is too long.',
        'any.required': 'Middle name is required',
    }),
});

const genderSchema = Joi.string().valid('Male', 'Female').messages({
    'any.only': 'Invalid gender',
    'any.required': 'gender is required',
});

const jobTitleSchema = Joi.string().min(2).max(50).messages({
    'string.min': 'Job title is too short',
    'string.max': 'Job title is too long',
    'any.required': 'Job title is required',
});

// TODO: ask if front end would do the validation logic
const dobSchema = Joi.date().less('now');
// const dobSchema = Joi.object({
//     day: Joi.number().min(1).max(31).required().messages({
//         'number.min': 'Invalid date of birth',
//         'number.max': 'Invalid date of birth',
//     }),
//     month: Joi.number().min(1).max(12).required().messages({
//         'number.min': 'Invalid date of birth',
//         'number.max': 'Invalid date of birth',
//     }),
//     year: Joi.number()
//         .min(1970)
//         .max(new Date().getFullYear() - 16)
//         .messages({
//             'number.min': 'Invalid date of birth',
//             'number.max': 'Invalid date of birth',
//         }),
// });

const displayNameSchema = Joi.string().max(255).messages({
    'string.max': 'Display name is too long',
});

const phoneSchema = Joi.string()
    .pattern(/^\+?([0-9]){3}([7-9])([0,1])[0-9]{8}$/)
    .message({
        'string.pattern.base':
            'Invalid phone number, please include international dialling code.',
        'any.required': 'Phone number is required',
    });

const emailSchema = Joi.string().email().min(10).max(50).messages({
    'string.min': 'Invalid email',
    'string.max': 'Invalid email',
    'string.email': 'Please enter a valid email',
    'any.required': 'Email is required',
});

const passwordSchema = joiPassword
    .string()
    .label('Password')
    .minOfUppercase(1)
    .minOfSpecialCharacters(1)
    .minOfNumeric(1)
    .noWhiteSpaces()
    .min(6)
    .max(1024)
    .messages({
        'password.minOfUppercase':
            '{#label} should contain at least {#min} uppercase character',
        'password.minOfSpecialCharacters':
            '{#label} should contain at least {#min} special character',
        'password.minOfNumeric':
            '{#label} should contain at least {#min} number',
        'password.noWhiteSpaces': '{#label} should not contain white spaces',
    });

const otpSchema = Joi.string()
    .label('OTP')
    .pattern(/^[0-9]{8}$/)
    .messages({ 'string.pattern.base': 'Invalid {#label}' });

const segmentSchema = Joi.alternatives().try(
    Joi.array().items(Joi.objectId).min(1),
    Joi.string().valid('all').messages({
        'any.required': 'Segments is required',
    })
);

const roleSchema = Joi.string()
    .label('Role')
    .valid(
        roles.admin,
        roles.agent,
        roles.credit,
        roles.master,
        roles.operations
    )
    .messages({
        'any.only': '{#label} is not valid',
        'any.required': '{#label} is required',
    });

const validators = {
    validateLogin: (dto) => {
        const schema = Joi.object({
            email: emailSchema.required(),
            password: Joi.string().max(40).required(),
        });
        return schema.validate(dto);
    },

    create: (userDto) => {
        const schema = Joi.object({
            name: Joi.object({
                first: Joi.string().min(2).max(255).required().messages({
                    'string.min': 'Invalid first name',
                    'string.max': 'First name is too long.',
                    'any.required': 'First name is required',
                }),
                last: Joi.string().min(2).max(255).required().messages({
                    'string.min': 'Invalid surname',
                    'string.max': 'Surname is too long.',
                    'any.required': 'Surname is required',
                }),
                middle: Joi.string().min(2).max(255).messages({
                    'string.min': 'Invalid middle name',
                    'string.max': 'Middle name is too long.',
                    'any.required': 'Middle name is required',
                }),
            }),
            jobTitle: jobTitleSchema,
            gender: genderSchema.required(),
            dob: dobSchema,
            displayName: Joi.string(),
            phone: phoneSchema.required(),
            email: emailSchema.required(),
            role: roleSchema.required(),
        });

        if ([roles.agent, roles.credit].includes(userDto.role))
            schema.append({ segments: segmentSchema.required() });

        return schema.validate(userDto);
    },

    verify: (userDto) => {
        const schema = Joi.object({
            email: emailSchema.required(),
            otp: otpSchema.required(),
            currentPassword: Joi.string().max(40).required(),
            newPassword: passwordSchema.required(),
        });
        return schema.validate(userDto);
    },

    update: function (user) {
        const schema = Joi.object({
            name: nameSchema,
            jobTitle: jobTitleSchema,
            gender: genderSchema,
            dob: dobSchema,
            displayName: displayNameSchema,
            phone: phoneSchema,
            role: roleSchema,
            segments: segmentSchema,
        });

        return schema.validate(user);
    },

    email: function (user) {
        const schema = Joi.object({
            email: emailSchema.required(),
        });

        return schema.validate(user);
    },

    password: function (pwd) {
        const schema = Joi.object({
            currentPassword: Joi.string()
                .max(1024)
                .messages({
                    'string.max': 'Invalid Password',
                    'any.required': 'Current password is required',
                })
                .required(),
            newPassword: passwordSchema.required(),
        });

        return schema.validate(pwd);
    },

    changePassword: function (passwordObj) {
        const schema = Joi.object({
            otp: otpSchema,
            currentPassword: Joi.string()
                .max(1024)
                .messages({
                    'string.max': 'Invalid Password.',
                    'any.required': 'Current password is required.',
                })
                .required(),
            newPassword: passwordSchema.required(),
        });

        return schema.validate(passwordObj);
    },
};

module.exports = validators;
