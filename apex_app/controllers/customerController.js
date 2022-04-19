const debug = require('debug')('app:customerContr');
const ObjectId = require('mongoose').Types.ObjectId;
const Customer = require('../models/customerModel');
const convertToDotNotation = require('../utils/convertToDotNotation');

const customer = {
    getAll: async function(user, queryParam={}) {
        if(user.role !== 'loanAgent') {
            return await Customer.find(queryParam)
                                 .select('-createdAt -updatedAt -__v')
                                 .populate('employmentInfo.segment')
                                 .sort('_id');
        };

        return await Customer.find( { 'loanAgents.id': user.id } )
                                 .select('-createdAt -updatedAt -__v')
                                 .sort('_id');
    },

    get: async function(user, queryParam) {
        try{
            if(user.role !== 'loanAgent') {
                const customer = await Customer.findOne( queryParam )
                                               .select({'name': 1, 'dateOfBirth': 1, 'employmentInfo.ippis': 1, 'employmentInfo.segment': 1, 'employmentInfo.dateOfEnlistment': 1, 'netPay': 1 } );

                if(!customer) throw new Error('Customer not found.');

                return customer; 
            };

            const customer = await Customer.findOne( ObjectId.isValid(id) ? { _id: id, 'loanAgent.id': user.id } : { 'employmentInfo.ippis': id, 'loanAgent.id': user.id } )
                                           .select( [ 'name.firstName', 'name.lastName', 'employmentInfo.ippis', 'employmentInfo.segment', 'netPay', 'loanAgent' ] );
            if(!customer) {
                debug(customer.message, customer.stack);     
                throw new Error('Customer not found.');
            };
            
            return customer;

        }catch(exception) {
            return exception;
        };
    },

    create: async function(request) {
        try{
            const customerExists = await Customer.findOne( { 'employmentInfo.ippis': request.body.employmentInfo.ippis } );
            if(customerExists) throw new Error('Duplicate IPPIS NO. Customer already exists');

            const newCustomer = await Customer.create(request.body);
            if(newCustomer instanceof Error) throw(newCustomer.message);
            
            newCustomer.validateSegment();
            
            await newCustomer.save();                                                                                                                                                                                                                                                                                                                                                                    

            return newCustomer;

        }catch(exception) {
            debug(exception);
            return exception;
        };
    },

    update: async function(id, requestBody) {
        try{
            requestBody = convertToDotNotation(requestBody);
            
            const customer = await Customer.findById(id);
            if(!customer) {
                debug(customer);
                throw new Error('Customer not found.');
            };        
            
            customer.set(requestBody);
            await customer.save();

            return customer;
            
        }catch(exception) {
            return exception;
        }
    },

};

module.exports = customer;
