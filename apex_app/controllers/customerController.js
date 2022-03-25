const Customer = require('../models/customerModel');
const debug = require('debug')('customerContr');

const customer = {
    getAll: async function() {
        return await Customer.find()
                             .populate( [ 'segment' ] )
                             .select( [ 'firstName', 'lastName', 'ippis', 'segment', 'loanAgents' ] )
                             .sort('_id');

    },

    get: async function(id) {
        try{
            const customer = await Customer.findById(id)
                                 .populate( [ 'segment', 'loanAgent' ] )
                                 .select( [ 'firstName', 'lastName', 'ippis', 'segment', 'loanAgent' ] )
                                 .sort('_id');
            
            if(!customer) throw new Error('No customer found.');
            
            return customer;

        }catch(exception) {
            return exception;
        }
    },

    create: async function(requestBody) {
        try{
            const doesExist = await Customer.findOne( { ippis: requestBody.ippis } );
            if(doesExist) throw new Error('Duplicate IPPIS NO. Customer already exists');

        }catch(exception) {
            return {exception, customer: doesExist};
        };
    },

    delete: async function(id) {
        try{
            const customer = await Customer.findByIdAndRemove( {_id: id} );
            if(!customer) throw new Error('Customer not found.');

            return customer;

        }catch(exception) {
            debug(exception);
            return exception;
        }
    }
};

module.exports = customer;