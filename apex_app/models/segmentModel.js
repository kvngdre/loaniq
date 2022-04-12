const mongoose = require('mongoose');

const segmentSchema = new mongoose.Schema({
    code: {
        type: String,
        uppercase: true,
        trim: true,
        unique: true,
        required: true
    },
    
    prefix: {
        type: String,
        trim: true
    },

    name: {
        type: String,
        trim: true,
        required: true
    },

    metrics: {
        minLoanAmount: {
            type: Number,
            required: true
        },

        maxLoanAmount: {
            type: Number,
            required: true
        },

        minTenor: {
            type: Number,
            required: true
        },

        maxTenor: {
            type: Number,
            required: true
        }

    }

});

const Segment = mongoose.model('Segment', segmentSchema);

module.exports = Segment;
