const State = require('../models/state');
const debug = require('debug')('app:stateCtrl');

const state = {  
    create: async function(requestBody) {
        try{
            const stateExists = await State.findOne( { name: requestBody.name } );
            if(stateExists) throw new Error('State already exists.');

            const newState = await State.create(requestBody);

            return newState;

        }catch(exception) {
            return exception;
        };
    },

    getAll: async function() {
        return await State.find();
    },

    get: async function(id) {
        try{
            const state = await State.findById(id);
            if(!state) throw new Error('State not found.');

            return state;

        }catch(exception) {
            debug(exception);
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
        };
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
        };
    }

}

module.exports = state;
