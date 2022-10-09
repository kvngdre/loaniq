require('dotenv').config();
require('express-async-errors');

const app = require('express')();
const appRoutes = require('./startUp/routes');
const config = require('config');
const connectDB = require('./startUp/db');
const debug = require('debug')('app:startUp');
const jobs = require('./jobs/loanJobs');
const { encryptQueryParams, decryptQueryParams } = require('./utils/generateURL');

// const edata = encryptQueryParams(1);
// console.log(edata)
// console.log(decryptQueryParams(edata))

// const {
//     firebaseConfig,
//     initializeApp,
//     getMessaging
// } = require('./startUp/firebase-cm');

// Setup
connectDB();
appRoutes(app);
// jobs();
// const fcm_app = initializeApp(firebaseConfig);
// const messaging = getMessaging(fcm_app)
// messaging.getToken({vapidKey: "BEYkETs_arnU_0Er49Z5O-ZBv24aE_HEtoN8xWEJSOyilwODbb4uC51S7-TPePrixvOwIjDDXGgYHqe2p06Ydjw"})

const port = config.get('server.port');
app.listen(port, () => {
    debug(`ENV=${process.env.NODE_ENV} \nListening on port:[${port}]`);
});
