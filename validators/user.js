const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);

const nameSchema = Joi.object({
    first: Joi.string()
                  .min(3)
                  .max(50),

    last: Joi.string()
                 .min(3)
                 .max(50),

    middle: Joi.string()
                   .min(3)
                   .max(50)
});

const displayNameSchema = Joi.string()

const phoneSchema = Joi.string()
                       .pattern(/^0([7-9])[0-9]{9}$/)
                       .message({
                          "string.pattern.base": "Invalid phone number"
                        })

const emailSchema = Joi.string().email().min(10).max(50).messages({
    'string.min': `Invalid email address.`,
    'string.max': `Invalid email address.`,
});


const segmentSchema = Joi.alternatives()
                         .try(Joi.array().items(Joi.objectId).min(1), Joi.string().valid('all'))

const validators = {
    validateSignUp: function(user) {
        if(!user.role) return {
            error: {
                details:[{message: 'Role is required.'}]
            }
        }

        switch(user.role) {
            case "Admin": 
                return (function(user) {
                    const schema = Joi.object({
                        lenderId: Joi.objectId(),
                        name: nameSchema.required(),
                        displayName: Joi.string(),
                        phone: phoneSchema.required(),
                        email: emailSchema.required(),
                        role: Joi.string().equal('Admin').required(),
                    });
                    return schema.validate(user);

                }).call(this, user)
            
            case "Credit":
                return (function (user) {
                    const schema = Joi.object({
                        name: nameSchema.required(),
                        displayName: Joi.string(),
                        phone: phoneSchema.required(),
                        email: emailSchema.required(),
                        role: Joi.string().equal('Credit').required(),
                        segments: segmentSchema.required(),
                
                    });
                    return schema.validate(user);

                }).call(this, user)
            
            case "Operations":
                return (function (user) {
                    const schema = Joi.object({
                        name: nameSchema,
                        displayName: Joi.string(),
                        phone: phoneSchema,
                        email: emailSchema,
                        role: Joi.string().equal('Operations').required(),
                    });
                    return schema.validate(user);

                }).call(this, user)
    
            case "Loan Agent":
                return (function (user) {
                    const schema = Joi.object({
                        name: nameSchema.required(),
                        displayName: Joi.string(),
                        phone: phoneSchema.required(),
                        email: emailSchema.required(),
                        role: Joi.string().equal('Loan Agent').required(),
                        segments: segmentSchema.required(),
                        target: Joi.number().required(),
                        achieved: Joi.number(),
                    });
                    return schema.validate(user);

                }).call(this, user)

            case "Jk":
                return (function() {
                    console.log('in here')
                    return 'I returned'
                }).call(this)
            
            default:
                return {
                    error: {
                        details:[{message: 'Invalid role'}]
                    }
                }
        }
        
    },

    validateEdit: function(user) {
        const schema = Joi.object({
            name: nameSchema,
            displayName: displayNameSchema,
            phone: phoneSchema,
            role: Joi.string(),
            segments: segmentSchema,
            target: Joi.number(),
            active: Joi.boolean()
        });

        return schema.validate(user);
    },

    validateEmail: function(user) {
        const schema = Joi.object({
            email: emailSchema.required(),
        });

        return schema.validate(user);
    },
}

module.exports = validators;