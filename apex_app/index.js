require('dotenv').config();
require('express-async-errors');
const app = require('express')();
const nodeCron = require('node-cron');
const connectDB = require('./startUp/db');
const appRoutes = require('./startUp/routes');
const debug = require('debug')('app:startUp');
const checkForExpiringLoans = require('./tools/netPayManager/updateNetPay');


// Setup
connectDB();
appRoutes(app);


// Get Node Environment
debug(`ENV: ${app.get('env')}`);
// const job = nodeCron.schedule("50-59 * * * * *", checkForExpiringLoans);

// Listener
const port = process.env.PORT;
app.listen(port, () => {
    debug(`Listening on port ${port}`);
    // console.log(`Listening on port ${port}`);
});