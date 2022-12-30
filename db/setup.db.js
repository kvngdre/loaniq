const config = require('config');
const debug = require('debug')('app:db');
const mongoose = require('mongoose');

function connectDB() {
    const databaseUri = config.get('db.uri');

    mongoose
        .connect(databaseUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        })
        .then(() => debug(`Connected to ${process.env.NODE_ENV} DB.`))
        .catch((err) => debug(`Error connecting to MongoDB>> ${err}`));
}

module.exports = connectDB;
