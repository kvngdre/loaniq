const mongoose = require('mongoose');

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
    }
});

const State = mongoose.model('State', stateSchema);

module.exports = State;