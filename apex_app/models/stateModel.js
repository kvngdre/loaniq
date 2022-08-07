const mongoose = require('mongoose');


const schemaOptions = {timestamps: true};

const stateSchema = new mongoose.Schema({
    code: {
        type: String,
        uppercase: true,
        trim: true,
        required: true
    },

    name: {
        type: String,
        trim: true,
        required: true
    },

    lgas: {
        type: [ String ],
        required: true 
    },

    geo: {
        type: String,
        required: true
    }

}, schemaOptions)

const State = mongoose.model('State', stateSchema);

module.exports = State;