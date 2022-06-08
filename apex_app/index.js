require('express-async-errors');
require('dotenv').config();

const app = require('express')();
const jobs = require('./jobs/jobs');
const connectDB = require('./startUp/db');
const appRoutes = require('./startUp/routes');
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
