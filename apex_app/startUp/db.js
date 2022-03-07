const mongoose = require('mongoose');
const dbDebug = require('debug')('app:db');

function connectDB() {
    mongoose.connect('mongodb://localhost/apex_')
        .then(() => { dbDebug('Connected to mongoDB.') })
        .catch(error => dbDebug(`Failed to connect to db. ${error}`));
}

module.exports = connectDB;
