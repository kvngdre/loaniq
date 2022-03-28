const debug = require('debug')('customerContr');
const ObjectId = require('mongoose').Types.ObjectId;
const Customer = require('../models/customerModel');
const pickRandomAgent = require('../utils/pickRandomAgent');

const customer = {
    getAll: async function(agent) {
        if(agent.role !== 'loanAgent') {
            return await Customer.find()
                                 .populate( [ 'segment' ] )
                                 .select( [ 'firstName', 'lastName', 'ippis', 'segment', 'loans', 'loanAgent' ] )
                                 .sort('_id');
        };

        return await Customer.find( { loanAgents: agent.id } )
                                 .populate( [ 'segment' ] )
                                 .select( [ 'firstName', 'lastName', 'ippis', 'segment', 'loans', 'loanAgent' ] )
                                 .sort('_id');
    },

    get: async function(id, user) {
        try{
            if(user.role !== 'loanAgent') {
                const customer = await Customer.findOne( ObjectId.isValid(id) ? { _id: id } : { ippis: id } )
                                               .select( [ 'firstName', 'lastName', 'ippis', 'segment', 'loans', 'loanAgent' ] );
                if(!customer) throw new Error('Customer not found.');

                return customer; 
            };

            const customer = await Customer.findOne( ObjectId.isValid(id) ? { _id: id, loanAgent: user.id } : { ippis: id, loanAgent: user.id } )
                                           .select( [ 'firstName', 'lastName', 'ippis', 'segment', 'loans', 'loanAgent' ] );
        
            if(!customer) {
                debug(customer);     
                throw new Error('Customer not found.');
            };
            
            return customer;

        }catch(exception) {
            return exception;
        };
    },

    create: async function(requestBody) {
        try{
            const customerExists = await Customer.findOne( { ippis: requestBody.ippis } );
            if(customerExists) throw new Error('Duplicate IPPIS NO. Customer already exists');

            const newCustomer = new Customer(requestBody);
            newCustomer.validateSegment();

            // assigning agent
            let agent
            if(!requestBody.loanAgent) {
                agent =  await pickRandomAgent(requestBody.segment);
            }else{
                agent = await User.findOne( { _id: requestBody.loanAgent, active: true, segment: requestBody.segment });
                if(!agent) throw new Error('Agent does not exist or is inactive.');
            };

            newCustomer.loanAgent = agent._id;
            
            await newCustomer.save();

            return {newCustomer, agent};

        }catch(exception) {
            return exception;
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

            // if(customer.loans.length > 0) return 'Are you sure you want to delete? Customer has loans.';

            await customer.deleteOne();

            return customer;

        }catch(exception) {
            debug(exception);
            return exception;
        }
    }
};

module.exports = customer;