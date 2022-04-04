const _ = require('lodash');
const State = require('../models/stateModel');
const { admin } = require('googleapis/build/src/apis/admin');
const res = require('express/lib/response');
const ObjectId = require('mongoose').Types.ObjectId;

const state = {  
    create: async function(requestBody) {
        try{
            const stateExists = await State.findOne( { code: requestBody.code } );
            if(stateExists) throw new Error('Code already exists');

            const newState = new State(requestBody);
            await newState.save();

            return {newState: newState};

        }catch(exception) {
            return exception;
        };
    },

    update: async function(id, requestBody) {
        try{
            const state = await State.findByIdAndUpdate( {_id: id }, requestBody, {new: true} );
            if(!state) {
                debug(state);
                throw new Error('State not found.')
            };

            return state;
            
        }catch(exception) {
            return exception;
        }
    },

    delete: async function(id) {
        try{
            const state = await State.findById(id);
            if(!state) throw new Error('User not found.');

            await state.deleteOne();

            return state;

        }catch(exception) {
            debug(exception);
            return exception;
        }
    }

}

module.exports = state;
