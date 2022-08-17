const Bank = require('../models/bankModel');
const debug = require('debug')('app:bankModel');


const bankFuncs = {  
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

    getOne: async function(id) {
        try{
            const bank = Bank.findById(id);
            if(!bank) throw new Error('Bank does not exist.');

            return bank;
            
        }catch(exception) {
            debug(exception);
            return exception;
        };
    },

    getAll: async function(queryParams={}) {
        try{
            const banks =  await Bank.find( queryParams );
            if(banks.length === 0) throw new Error('no banks');

            return banks;

        }catch(exception) {
            debug(exception);
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

module.exports = bankFuncs;
