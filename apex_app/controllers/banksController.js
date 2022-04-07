const _ = require('lodash');
const Bank = require('../models/bankModel');
const { admin } = require('googleapis/build/src/apis/admin');
const res = require('express/lib/response');
const ObjectId = require('mongoose').Types.ObjectId;

const banksNew = {  
/**
     *  function creates a segment.
     * @param {object} requestBody 
     * @param {object} bank 
     * @returns new bank
     */

create: async function(requestBody) {
        try{
            const bankExists = await Bank.findOne( { code: requestBody.code } );
            if(bankExists) throw new Error('Bank already exists');

            const newBank = new Segment(requestBody);
            await newBank.save();

            return {newBank: newBank};

        }catch(exception) {
            return exception;
        };
    },

    update: async function(id, requestBody) {
        try{
            const bank = await Bank.findByIdAndUpdate( {_id: id }, requestBody, {new: true} );
            if(!bank) {
                debug(bank);
                throw new Error('Segment not found.')
            };

            return bank;
            
        }catch(exception) {
            return exception;
        }
    },

    delete: async function(id) {
        try{
            const bank = await Bank.findById(id);
            if(!bank) throw new Error('User not found.');

            await bank.deleteOne();

            return bank;

        }catch(exception) {
            debug(exception);
            return exception;
        }
    }


 }        

module.exports = banksNew;
