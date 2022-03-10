const mongoose = require('mongoose');

const stateSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        length: 2,
        uppercase: true,
        trim: true,
    },

    name: {
        type: String,
        required: true,
        trim: true
    },

    lgas: {
        type: [String],
        
    }

});

const State = mongoose.model('State', stateSchema);

module.exports = State;