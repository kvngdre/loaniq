const _ = require('lodash');
const Banks = require('../models/bankModel');
const { admin } = require('googleapis/build/src/apis/admin');
const res = require('express/lib/response');
const ObjectId = require('mongoose').Types.ObjectId;

const banks = {  
    create: async function(requestBody) {
        try{
            const banksExists = await Banks.findOne( { code: requestBody.code } );
            if(banksExists) throw new Error('Code already exists');

            const newBanks = new Banks(requestBody);
            await newBanks.save();

            return {newBanks: newBanks};

        }catch(exception) {
            return exception;
        };
    },

    update: async function(id, requestBody) {
        try{
            const banks = await Banks.findByIdAndUpdate( {_id: id }, requestBody, {new: true} );
            if(!banks) {
                debug(banks);
                throw new Error('Banks not found.')
            };

            return banks;
            
        }catch(exception) {
            return exception;
        }
    },

    delete: async function(id) {
        try{
            const banks = await Banks.findById(id);
            if(!banks) throw new Error('Banks not found.');

            await banks.deleteOne();

            return banks;

        }catch(exception) {
            debug(exception);
            return exception;
        }
    }

}

module.exports = banks;
