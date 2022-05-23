require('express-async-errors');
require('dotenv').config();

const app = require('express')();
const jobs = require('./apex_app/jobs/jobs');
const connectDB = require('./apex_app/startUp/db');
const appRoutes = require('./apex_app/startUp/routes');
const debug = require('debug')('app:startUp');

// Setup
connectDB();
appRoutes(app);
// jobs();

// Get Node Environment
debug(`ENV: ${app.get('env')}`);

const port = process.env.PORT || 9000;
app.listen(port, () => {
  // TODO: uncomment this
  // debug(`Listening on port ${port}`);
  console.log(`Listening on port ${port}`);
});
