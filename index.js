require('dotenv').config();
require('express-async-errors');

const app = require('express')();
const appRoutes = require('./startUp/routes');
const config = require('config');
const connectDB = require('./startUp/db');
const debug = require('debug')('app:startUp');
const jobs = require('./jobs/loanJobs');

// Setup
connectDB();
appRoutes(app);


// jobs();


const port = config.get('server.port');
app.listen(port, () => {
    debug(`ENV=${process.env.NODE_ENV} \nListening on port:[${port}]`);
});
