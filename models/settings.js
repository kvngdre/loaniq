const mongoose = require('mongoose');

const schemaOptions = { timestamps: true, versionKey: false };

const settingsSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            unique: true,
            required: true,
        },

        
    },
    schemaOptions
);

const Settings = mongoose.model('Setting', settingsSchema);

module.exports = Settings;
