require('express-async-errors');
const cors = require('cors');
require('dotenv').config();
const app = require('express')();
const nodeCron = require('node-cron');
const connectDB = require('./startUp/db');
const appRoutes = require('./startUp/routes');
const debug = require('debug')('app:startUp');
const { checkExpiringLoans } = require('./tools/Managers/loanManager');

app.use(cors());

// Setup
connectDB();
appRoutes(app);


// Get Node Environment
debug(`ENV: ${app.get('env')}`);
// const job = nodeCron.schedule("50-59 * * * * *", checkExpiringLoans);

// Listener
const port = process.env.PORT;
app.listen(port, () => {
    // debug(`Listening on port ${port}`);
     console.log(`Listening on port ${port}`);
});