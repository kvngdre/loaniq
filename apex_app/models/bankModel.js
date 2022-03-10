const mongoose = require('mongoose');

const bankSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },

    code: {
        type: String,
        required: true,
        minLength: 3,
        maxLength: 6,
        trim: true
    }
});

const Bank = mongoose.model('Bank', bankSchema);

module.exports = Bank;