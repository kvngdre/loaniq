require('express-async-errors');
const app = require('express')();
const connectDB = require('./startUp/db');
const appRoutes = require('./startUp/routes');
const debug = require('debug')('app:startUp');
const configurations = require('./startUp/config');


// Setup
// TODO: Don't forget to uncomment this.
configurations();
connectDB();
appRoutes(app);


// Get Node Environment
debug(`${app.get('env')}`);


// Listener
const port = process.env.PORT || 8480;
app.listen(port, () => {
    debug(`Listening on port ${port}`);
});