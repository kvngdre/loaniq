require('dotenv').config();
require('express-async-errors');

const app = require('express')();
const appMiddleware = require('./startUp/middleware');
const appRoutes = require('./startUp/routes');
const config = require('config');
const connectDB = require('./db/setup.db');
const debug = require('debug')('app:startUp');
const jobs = require('./jobs/loanJobs');

// Setup
connectDB();
appMiddleware(app);
appRoutes(app);

const port = process.env.PORT || 8480;
app.listen(port, () => debug(`Listening on port:[${port}]`));
