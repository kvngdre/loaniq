const Lender = require('../models/lenderModel');

const lender = {
    createLender: async function(requestBody) {
        try{
            const lender = await Lender.findOne( {email: requestBody.email} );
            if(lender) throw new Error('Email has already been taken.');


            const newLender = new Lender({
                companyName: requestBody.companyName,
                companyAddress: requestBody.companyAddress,
                cacNumber: requestBody.cacNumber,
                email: requestBody.email
            });

            await newLender.save();

            return newLender;

        }catch(exception) {
            return exception;
        };
    },

    update: async function(requestBody) {
        try{
            const lender = await Lender.findOneAndUpdate(
                 {email: requestBody.email}, requestBody, options={new: true}
                 );
            
            if (!lender) throw new Error('No lender found.');

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
