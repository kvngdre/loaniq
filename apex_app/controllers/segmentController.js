const Segment = require('../models/segmentModel');
const debug = require('debug')('app:segmentContr');
const ObjectId = require('mongoose').Types.ObjectId;

const segment = {  
    create: async function(requestBody) {
        try{
            const segmentExists = await Segment.findOne( { code: requestBody.code } );
            if(segmentExists) throw new Error('Segment already exists.');

            const newSegment = await Segment.create(requestBody);

            return newSegment;

        }catch(exception) {
            return exception;
        };
    },

    getAll: async function() {
        return await Segment.find().select('-ippisPrefix');
    },

    get: async function(id) {
        try{
            const segment = await Segment.findById(id).select('-ippisPrefix');
            if(!segment) throw new Error('Segment not found.');

            return segment;

        }catch(exception) {
            return exception;
        };
    },

    update: async function(id, requestBody) {
        try{
            const segment = await Segment.findByIdAndUpdate( {_id: id }, requestBody, {new: true} ).select('-ippisPrefix');
            if(!segment) {
                debug(segment);
                throw new Error('Segment not found.');
            };

            return segment;
            
        }catch(exception) {
            return exception;
        };
    },

    delete: async function(id) {
        try{
            const segment = await Segment.findByIdAndDelete(id);
            if(!segment) throw new Error('User not found.');

            return segment;

        }catch(exception) {
            debug(exception);
            return exception;
        };
    }

}

module.exports = segment;
