const mongoose = require('mongoose');

const originSchema = new mongoose.Schema({
    name: {
        type: String
    },

    dateOfBirth: {
        type: Date
    },

    bvn: {
        type: String
    },

    bvnValid: {
        type: Boolean,
        default: false
    },

    ippis: {
        type: String
    },

    segment:{
        type: String,
        uppercase: true
    },

    netPays: {
        type:[ Number ]
    },

    dateOfEnlistment: {
        type: Date
    },

    salaryAccountNumber: {
        type: String
    },

    bank: {
        type: String
    },

    command: {
        type: String
    }

});

originSchema.methods.getAge = function() {
    const dobMSec = this.dateOfBirth.getTime();

    const diff = Date.now() - dobMSec;

    const age = new Date(diff).getUTCFullYear() - 1970;

    return age;

}

originSchema.methods.getLengthOfService = function() {
    const doeMSec = this.dateOfEnlistment.getTime();

    const diff = Date.now() - doeMSec;

    const serviceLength = new Date(diff).getUTCFullYear() - 1970;

    return serviceLength;
}

originSchema.methods.getMonthNetPay = function(idx=2) {
    return this.netPays[idx];
}

const Origin = mongoose.model('Origin', originSchema);

module.exports = Origin;
