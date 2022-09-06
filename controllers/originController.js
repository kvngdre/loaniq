const mongoose = require('mongoose');
const Origin = require('../models/originModel');
const debug = require('debug')('app:OriginCtrl');


const origin = {
    create: async function(requestBody) {
        try{
            const customer = await Origin.findOne( { ippis: requestBody.ippis } );
            if(customer) throw new Error('Customer already exists in origin.');

            const newCustomer = await Origin.create(requestBody);

            return newCustomer;

        }catch(exception) {
            return exception;
        };
    },

    edit: async function(id, requestBody) {
        try{
            const filter = mongoose.isValidObjectId(id) ? {_id: id} : {ippis: id}

            const updatedCustomer = await Origin.findOneAndUpdate( filter, requestBody, {new: true} );
            if(!updatedCustomer) {
                debug(updatedCustomer);
                throw new Error('Customer does not exist in origin.');
            };

            return updatedCustomer;

        }catch(exception) {
            return exception;
        };
    },

    getOne: async function(queryParam={}) {
        const customer = await Origin.findOne( queryParam );
        if(!customer) return { errorCode: 404, message: 'Not found.'};

        return customer;
    },

    getAll: async function(queryParam={}) {
        const customers = await Origin.find( queryParam );

        return customers;
    },

    delete: async function(id) {
        try{
            const filter = mongoose.isValidObjectId(id) ? { _id: id } : { ippis: id }

            const deletedCustomer = await Origin.findOneAndDelete( filter );
            if(!deletedCustomer) {
                debug(deletedCustomer);
                throw new Error('Customer not found in origin.');
            };
            
            return deletedCustomer;

        }catch(exception) {
            return exception;
        };

        
    }
};

module.exports = origin;