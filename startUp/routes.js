const cors = require('cors');
const express = require('express');
const loanRouter = require('../routes/loan');
const userRouter = require('../routes/user');
const banksRouter = require('../routes/bank');
const stateRouter = require('../routes/state');
const lenderRouter = require('../routes/lender');
const originRouter = require('../routes/origin');
const segmentRouter = require('../routes/segment');
const customerRouter = require('../routes/customer');
const pendingEditRouter = require('../routes/pendingEdit');
const transactionRouter = require('../routes/transaction');

const errorHandler = require('../middleware/errorHandler');


module.exports = function(app) {
    // middleware
    app.use(cors());
    app.use(express.json());

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
}