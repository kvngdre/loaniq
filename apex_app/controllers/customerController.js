const Customer = require('../models/customerModel');

const customer = {
    getAll: async function() {
        try{
            const customers = await Customer.find()
                                            .populate('companyName')
                                            .select( ['firstName, lastName, ippis, companyName'] )
                                            .sort('_id');
            if (customers.length === 0) throw new Error('No customers.');

            return customers;

        }catch(exception) {
            return exception;
        };
    },

    create: async function(requestBody) {
        try{
            const doesExist = await Customer.findOne( {ippis: requestBody.ippis} );
            if(doesExist) throw new Error('Customer exists', doesExists);

        }catch(exception) {
            return exception;
        };
    }
}