const Bank = require('../models/bankModel');
const debug = require('debug')('app:bankModel');


const banksNew = {  
    create: async function(requestBody) {
        try{
            const bankExists = await Bank.findOne( { code: requestBody.code } );
            if(bankExists) throw new Error('Bank already exists.');

            const newBank = await Bank.create(requestBody);

            return  newBank;

        }catch(exception) {
            debug(exception);
            return exception;
        };
    },

    getAll: async function() {
        return await Bank.find()
    },

    get: async function(id) {
        try{
            const bank = Bank.findById(id);
            if(!bank) throw new Error('Bank does not exist.');

            return bank;
            
        }catch(exception) {
            return exception;
        };
    },

    update: async function(id, requestBody) {
        try{
            const bank = await Bank.findByIdAndUpdate( {_id: id }, requestBody, {new: true} );
            if(!bank) {
                debug(bank);
                throw new Error('Bank not found.');
            };

            return bank;
            
        }catch(exception) {
            debug(exception);
            return exception;
        };
    },

    delete: async function(id) {
        try{
            const bank = await Bank.findByIdAndRemove(id);
            if(!bank) throw new Error('bank not found.');

            return bank;

        }catch(exception) {
            debug(exception);
            return exception;
        };
    }


 }        

module.exports = banksNew;
