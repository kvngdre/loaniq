const _ = require('lodash');
const Segment = require('../models/segmentModel');
const { admin } = require('googleapis/build/src/apis/admin');
const res = require('express/lib/response');
const ObjectId = require('mongoose').Types.ObjectId;

const segment = {  
    create: async function(requestBody) {
        try{
            const segmentExists = await Segment.findOne( { code: requestBody.code } );
            if(segmentExists) throw new Error('Code already exists');

            const newSegment = new Segment(requestBody);
            await newSegment.save();

            return {newSegment};

        }catch(exception) {
            return exception;
        };
    },

    update: async function(id, requestBody) {
        try{
            const segemnt = await Segment.findByIdAndUpdate( {_id: id }, requestBody, {new: true} );
            if(!segemnt) {
                debug(segemnt);
                throw new Error('Segment not found.')
            };

            return segemnt;
            
        }catch(exception) {
            return exception;
        }
    },

    delete: async function(id) {
        try{
            const segment = await Segment.findById(id);
            if(!segment) throw new Error('User not found.');

            await segment.deleteOne();

            return segment;

        }catch(exception) {
            debug(exception);
            return exception;
        }
    }

}

module.exports = segment;
