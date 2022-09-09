const cors = require('cors');
const express = require('express');
const stateRouter = require('../routes/state');
const lenderRouter = require('../routes/lender');
const customerRouter = require('../routes/customer');
const loanRoutes = require('../routes/loanRoutes');
const userRoutes = require('../routes/userRoutes');
const banksRoutes = require('../routes/banksRoutes');
const originRoutes = require('../routes/originRoutes');
const segmentRoutes = require('../routes/segmentRoutes');
const pendingEditRoutes = require('../routes/pendingEditRoutes');
const transactionRoutes = require('../routes/transactionRoutes');

const errorHandler = require('../middleware/errorHandler');


module.exports = function(app) {
    // middleware
    app.use(cors());
    app.use(express.json());

    // Route handlers
    app.use('/api/loans', loanRoutes);
    app.use('/api/users', userRoutes);
    app.use('/api/banks', banksRoutes);
    app.use('/api/states', stateRouter);
    app.use('/api/origin', originRoutes);
    app.use('/api/lenders', lenderRouter);
    app.use('/api/segments', segmentRoutes);
    app.use('/api/customers', customerRouter);
    app.use('/api/transactions', transactionRoutes);
    app.use('/api/pending-edits', pendingEditRoutes);

    // Error handling middleware
    app.use(errorHandler);
}