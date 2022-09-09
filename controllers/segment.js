const Segment = require('../models/segment');
const debug = require('debug')('app:segmentCtrl');

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
        return await Segment.find();
    },

    getOne: async function(id) {
        try{
            const segment = await Segment.findById(id);
            if(!segment) return { errorCode: 404, message: 'Segment not found.' };

            return {
                message: 'Success',
                data: segment
            };

        }catch(exception) {
            return { errorCode: 500, message: 'Something went wrong.' };
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
