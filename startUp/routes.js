const authRouter = require('../routes/auth');
const banksRouter = require('../routes/bank');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const customerRouter = require('../routes/customer');
const errorHandler = require('../middleware/errorHandler');
const express = require('express');
const helmet = require('helmet');
const lenderRouter = require('../routes/lender');
const loanRouter = require('../routes/loan');
const originRouter = require('../routes/origin');
const pendingEditRouter = require('../routes/pendingEdit');
const refreshTokenRouter = require('../routes/refreshTokenRoutes');
const segmentRouter = require('../routes/segment');
const stateRouter = require('../routes/state');
const transactionRouter = require('../routes/transaction');
const userRouter = require('../routes/user');

module.exports = function (app) {
    // Cross Origin Resource Sharing
    app.use(cors());


    app.use(helmet());

    // built-in middleware for json
    app.use(express.json());

    // built-in middleware to handle urlencoded form data
    app.use(express.urlencoded({ extended: true }));

    // 
    app.use(cookieParser());

    // Route handlers
    app.use('/api/auth', authRouter);
    app.use('/api/banks', banksRouter);
    app.use('/api/customers', customerRouter);
    app.use('/api/lenders', lenderRouter);
    app.use('/api/loans', loanRouter);
    app.use('/api/origin', originRouter);
    app.use('/api/pending-edits', pendingEditRouter);
    app.use('/api/refresh/', refreshTokenRouter);
    app.use('/api/segments', segmentRouter);
    app.use('/api/states', stateRouter);
    app.use('/api/transactions', transactionRouter);
    app.use('/api/users', userRouter);

    // Error handling middleware
    app.use(errorHandler);
};
