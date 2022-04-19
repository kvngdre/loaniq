const mongoose = require('mongoose');

const pendingSchema = new mongoose.Schema({
    id: {
        type: String
    },

    type: {
        type: String
    }

}, {
    strict: false,
    timestamps: true
});

const Pending = mongoose.model('PendingEdit', pendingSchema);

module.exports = Pending;
