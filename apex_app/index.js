require('express-async-errors');
require('dotenv').config();

const app = require('express')();
const jobs = require('./jobs/jobs');
const connectDB = require('./startUp/db');
const appRoutes = require('./startUp/routes');
const debug = require('debug')('app:startUp');
// const genpass = require('./utils/generatePassword');
const { 
    firebaseConfig, 
    initializeApp, 
    getMessaging 
} = require('./startUp/firebase-cm');


// Setup
connectDB();
appRoutes(app);
// jobs();
// const fcm_app = initializeApp(firebaseConfig);
// const messaging = getMessaging(fcm_app)
// messaging.getToken({vapidKey: "BEYkETs_arnU_0Er49Z5O-ZBv24aE_HEtoN8xWEJSOyilwODbb4uC51S7-TPePrixvOwIjDDXGgYHqe2p06Ydjw"})

// Get Node Environment
debug(`ENV: ${app.get('env')}`);

const port = process.env.PORT;
app.listen(port, () => {
  // TODO: uncomment this
  debug(`Listening on port ${port}`);
  console.log(`Listening on port ${port}`);
});