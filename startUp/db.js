const config = require('config');
const debug = require('debug')('app:db');
const mongoose = require('mongoose');

function connectDB() {
    let databaseURI = null;
    if (process.env.NODE_ENV === 'development')
        databaseURI = config.get('db.dev_database_uri');
    if (process.env.NODE_ENV === 'test')
        databaseURI = config.get('db.test_database_uri');
    if (process.env.NODE_ENV === 'production')
        databaseURI = config
            .get('db.prod_database_uri')
            .replace(
                '<replace-with-your-password>',
                config.get('db.database_password')
            );

    mongoose
        .connect(databaseURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        })
        .then(() => debug('Connected to MongoDB.'))
        .catch((error) => debug(`Failed to connect to MongoDB: ${error}`));
}

module.exports = connectDB;
