const banksRouter = require('../routes/bank');
const cors = require('cors');
const customerRouter = require('../routes/customer');
const errorHandler = require('../middleware/errorHandler');
const express = require('express');
const helmet = require('helmet');
const lenderRouter = require('../routes/lender');
const loanRouter = require('../routes/loan');
const originRouter = require('../routes/origin');
const pendingEditRouter = require('../routes/pendingEdit');
const segmentRouter = require('../routes/segment');
const stateRouter = require('../routes/state');
const transactionRouter = require('../routes/transaction');
const userRouter = require('../routes/user');

module.exports = function (app) {
    // middleware
    app.use(cors());
    app.use(helmet());
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // Route handlers
    app.use('/api/loans', loanRouter);
    app.use('/api/users', userRouter);
    app.use('/api/banks', banksRouter);
    app.use('/api/states', stateRouter);
    app.use('/api/origin', originRouter);
    app.use('/api/lenders', lenderRouter);
    app.use('/api/segments', segmentRouter);
    app.use('/api/customers', customerRouter);
    app.use('/api/transactions', transactionRouter);
    app.use('/api/pending-edits', pendingEditRouter);

    // Error handling middleware
    app.use(errorHandler);
};
