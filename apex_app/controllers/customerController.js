const Customer = require('../models/customerModel');

const customer = {
    getAll: async function() {
        return await Customer.find()
                             .populate( [ 'segment', 'loanAgent' ] )
                             .select( [ 'firstName', 'lastName', 'ippis', 'segment', 'loanAgent' ] )
                             .sort('_id');

    },

    create: async function(requestBody) {
        try{
            const doesExist = await Customer.findOne( { ippis: requestBody.ippis } );
            if(doesExist) throw new Error('Duplicate IPPIS NO. Customer already exists');

        }catch(exception) {
            return {exception, customer: doesExist};
        };
    }
}

module.exports = customer;