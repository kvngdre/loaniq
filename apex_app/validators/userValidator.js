const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);
const { joiPassword } = require('joi-password');

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
                                    })

const segmentSchema = Joi.alternatives()
                         .try(Joi.array().items(Joi.objectId).min(1), Joi.string().valid('all'))

const otpSchema = Joi.string()
                     .pattern(/^[0-9]{6}$/)
                     .messages({'string.pattern.base': '{#label} must be 6 digits.'})


// TODO: Reposition required and remove optional.
const validators = {
    validateRegistration: {
        admin: function (user) {
            const schema = Joi.object({
                name: nameSchema.required(),
                displayName: Joi.string(),
                phone: phoneSchema.required(),
                email: emailSchema.required(),
                role: Joi.string().required(),
            });

            return schema.validate(user);
        },
    
        credit: function (user) {
            const schema = Joi.object({
                name: nameSchema.required(),
                displayName: Joi.string(),
                phone: phoneSchema.required(),
                email: emailSchema.required(),
                role: Joi.string().required(),
                segments: segmentSchema.required(),
        
            });
        
            return schema.validate(user);
        },
        
        operations: function (user) {
            const schema = Joi.object({
                name: nameSchema,
                displayName: Joi.string(),
                phone: phoneSchema,
                email: emailSchema,
                role: Joi.string().required(),
            });
        
            return schema.validate(user);
        },
    
        loanAgent: function (user) {
            const schema = Joi.object({
                name: nameSchema.required(),
                displayName: Joi.string(),
                phone: phoneSchema.required(),
                email: emailSchema.required(),
                role: Joi.string().required(),
                segments: segmentSchema.required(),
                target: Joi.number().required(),
                achieved: Joi.number(),
            });

            return schema.validate(user);
        },
    },

    // TODO: Should users be allowed to change their email?
    validateEdit: function(user) {
        const schema = Joi.object({
            name: nameSchema,
            displayName: Joi.string(),
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
            otp: otpSchema.required(),
            password: Joi.string().required()
        });

        return schema.validate(user);
    },

    validateLogin: function(user) {
        const schema = Joi.object({
            email: emailSchema.required(),
            password: passwordSchema.required()
        });

        return schema.validate(user);
    },
    
    validateEmail: function(user) {
        const schema = Joi.object({
            email: emailSchema.required(),
        });

        return schema.validate(user);
    },

    validateChangePassword: function(user) {
        // TODO: discuss this with Victor. 
        const schema = Joi.object({
            email: emailSchema.required(),
            newPassword: passwordSchema.required(),
            otp: otpSchema,
            currentPassword: Joi.string(),
            // currentPassword: Joi.string().when('otp', {
            //     is: Joi.exist(),
            //     then: Joi.required(),
            //     otherwise: Joi.forbidden()
            // }),
        });

        return schema.validate(user);
    }
}

module.exports = validators;
