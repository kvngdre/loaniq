const Lender = require('../models/lenderModel');

const lender = {
    createLender: async function(requestBody) {
        try{
            const lender = await Lender.findOne( {email: requestBody.email} );
            if(lender) throw new Error('Email has already been taken.');

            const newLender = await Lender.create(requestBody);

            return newLender;

        }catch(exception) {
            return exception;
        };
    },

    update: async function(id, requestBody) {
        try{
            const lender = await Lender.findOneAndUpdate(
                 {_id: id}, requestBody, options={new: true}
                );
            
            if (!lender) throw new Error('Lender not found.');

            return lender;

        }catch(exception) {
            return exception;
        };
    },

    delete: async function(requestBody) {
        try{
            const lender = await Lender.findOneAndRemove( {email: requestBody.email} );

            if (!lender) throw new Error('Lender does not exist.');

            return lender;

        }catch(exception) {
            return exception;
        };
    }
}

module.exports = lender;
