const Customer = require('../models/customerModel');
const debug = require('debug')('customerContr');

const customer = {
    getAll: async function(agent) {
        if(agent.role !== 'loanAgent') {
            return await Customer.find()
                                 .populate( [ 'segment' ] )
                                 .select( [ 'firstName', 'lastName', 'ippis', 'segment', 'loanAgents' ] )
                                 .sort('_id');
        };

        return await Customer.find( { loanAgents: agent.id } )
                                 .populate( [ 'segment' ] )
                                 .select( [ 'firstName', 'lastName', 'ippis', 'segment', 'loanAgents' ] )
                                 .sort('_id');
    },

    get: async function(id, agent) {
        try{
            if(agent.role !== 'loanAgent') {
                const customer = await Customer.find( { _id: id } )
                                               .populate( [ 'segment' ] )
                                               .select( [ 'firstName', 'lastName', 'ippis', 'segment', 'loanAgents' ] )
                                               .sort('_id');
                if(!customer) throw new Error('No customer found.');

                return customer; 
            };

            const customer = await Customer.find( { _id: id, loanAgents: agent.id } )
                                 .populate( [ 'segment' ] )
                                 .select( [ 'firstName', 'lastName', 'ippis', 'segment', 'loanAgents' ] )
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
            if(!doesExist) throw new Error('Duplicate IPPIS NO. Customer already exists');

            const newCustomer = await Customer.create(requestBody);
            console.log(newCustomer);
            
            return newCustomer;

        }catch(exception) {
            console.log('mm=----', exception.message);
            console.log('---eee', exception);
            return {message:exception.message.message, customer: exception.message.customer};
        };
    },

    update: async function(id, requestBody) {
        try{
            const customer = await Customer.findByIdAndUpdate( {_id: id }, requestBody, {new: true} );
            if(!customer) {
                debug(customer);
                throw new Error('Customer not found.')
            };

            return customer;
            
        }catch(exception) {
            return exception;
        }
    },

    delete: async function(id) {
        try{
            const customer = await Customer.findById(id);
            if(!customer) throw new Error('Customer not found.');

            if(customer.loans.length > 0) return 'Are you sure you want to delete? Customer has loans.';

            customer.delete();

            return customer;

        }catch(exception) {
            debug(exception);
            return exception;
        }
    }
};

module.exports = customer;