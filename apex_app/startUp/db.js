const config = require('config');
const mongoose = require('mongoose');
const dbDebug = require('debug')('app:db');


function connectDB() {
    mongoose.connect(config.get('databaseURI'))
        .then(() => { dbDebug('Connected to mongoDB.') })
        .catch(error => dbDebug(`Failed to connect to db. ${error}`));
}

module.exports = connectDB;