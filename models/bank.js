const mongoose = require('mongoose');

const schemaOptions = { timestamps: true, versionKey: false };

const bankSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            unique: true,
            trim: true,
            maxLength: 255,
            required: true,
        },

        code: {
            type: String,
            minLength: 3,
            maxLength: 6,
            trim: true,
            unique: true,
            required: true,
        },
    },
    schemaOptions
);

const Bank = mongoose.model('Bank', bankSchema);

module.exports = Bank;
