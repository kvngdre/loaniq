const Joi = require('joi');
const { joiPassword } = require('joi-password');
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
                   .max(50)
});
const otpValidTimeSchema = Joi.object({
    otp: Joi.string()
    .required()
    .pattern(/^[0-9]{6}$/)
    .messages( {'string.pattern.base': '{#label} must be 6 digits.'} ),
                 
    expiration_time: Joi.date()
});

const phoneSchema = Joi.string()
                       .pattern(/^0([7-9])[0-9]{9}$/)
                       .message({
                          "string.pattern.base": "Invalid phone number."
                        })

const emailSchema = Joi.string()
                       .email()
                       .min(10)
                       .max(255)

const passwordSchema = joiPassword.string()
                                  .minOfUppercase(1)
                                  .minOfSpecialCharacters(2)
                                  .minOfNumeric(2)
                                  .noWhiteSpaces()
                                  .min(6)
                                  .max(255)
                                  .messages({
                                    'password.minOfUppercase': '{#label} should contain at least {#min} uppercase character.',
                                    'password.minOfSpecialCharacters': '{#label} should contain at least {#min} special characters.',
                                    'password.minOfNumeric': '{#label} should contain at least {#min} numbers.',
                                    'password.noWhiteSpaces': '{#label} should not contain white spaces.'
                                    });

const segmentSchema = Joi.alternatives()
                         .try(Joi.array().items(Joi.objectId), Joi.string().valid('all'))

const otpSchema = Joi.string()
                     .pattern(/^[0-9]{6}$/)
                     .messages({'string.pattern.base': '{#label} must be 6 digits.'})


// TODO: Reposition required and remove optional.
const validators = {
    validateRegistration: {
        admin: function (user) {
            const schema = Joi.object({
                name: nameSchema.required(),
                phone: phoneSchema.required(),
                email: emailSchema.required(),
                role: Joi.string().required(),
                // password: passwordSchema.required()
            });

            return schema.validate(user);
        },
    
        credit: function (user) {
            const schema = Joi.object({
                name: nameSchema.required(),
                phone: phoneSchema.required(),
                email: emailSchema.required(),
                role: Joi.string().required(),
                segments: segmentSchema.required(),
                // password: passwordSchema.required()
        
            });
        
            return schema.validate(user);
        },
        
        operations: function (user) {
            const schema = Joi.object({
                name: nameSchema,
                phone: phoneSchema,
                email: emailSchema,
                role: Joi.string().required(),
                // password: passwordSchema
            });
        
            return schema.validate(user);
        },
    
        loanAgent: function (user) {
            const schema = Joi.object({
                name: nameSchema.required(),
                phone: phoneSchema.required(),
                email: emailSchema.required(),
                role: Joi.string().required(),
                segments: segmentSchema.required(),
                target: Joi.number().required(),
                achieved: Joi.number(),
                // password: passwordSchema.required()
        
            });

            return schema.validate(user);
        },
    },

    // TODO: Should users be allowed to change their email?
    validateEdit: function(user) {
        const schema = Joi.object({
            name: nameSchema,
            phone: phoneSchema,
            email: emailSchema,
            role: Joi.string(),
            segments: segmentSchema,
            target: Joi.number(),
            active: Joi.boolean()
        });

        return schema.validate(user);
    },

    validateRegVerification: function(user) {
        const schema = Joi.object({
            email: emailSchema.required(),
            otp: Joi.string()
            .required()
            .pattern(/^[0-9]{6}$/)
            .messages( {'string.pattern.base': '{#label} must be 6 digits.'} ),
                    
            password: passwordSchema.required()
        });

        return schema.validate(user);
    },

    validateLogin: function(user) {
        const schema = Joi.object({
            email: emailSchema.required(),
            password: Joi.string().required()
        });

        return schema.validate(user);
    },
    
    validateForgotPassword: function(user) {
        const schema = Joi.object({
            email: emailSchema.required(),
        });

        return schema.validate(user);
    },

    validateChangePassword: function(user) {
        const schema = Joi.object({
            email: emailSchema.required(),
            newPassword: passwordSchema.required(),
            otp: otpSchema,
            currentPassword: Joi.string().when('otp', {
                is: Joi.exist(),
                then: Joi.forbidden(),
                otherwise: Joi.required()
            }),
        });

        return schema.validate(user);
    },

    validateOTP: function(otp) {
        const schema = otpSchema.required()

        return schema.validate(otp);
    }
}

module.exports = validators;
