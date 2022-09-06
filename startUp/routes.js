const cors = require('cors');
const express = require('express');
const loanRoutes = require('../routes/loanRoutes');
const userRoutes = require('../routes/userRoutes');
const stateRoutes = require('../routes/stateRoutes');
const banksRoutes = require('../routes/banksRoutes');
const lenderRoutes = require('../routes/lenderRoutes');
const originRoutes = require('../routes/originRoutes');
const segmentRoutes = require('../routes/segmentRoutes');
const customerRoutes = require('../routes/customerRoutes');
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
    app.use('/api/states', stateRoutes);
    app.use('/api/origin', originRoutes);
    app.use('/api/lenders', lenderRoutes);
    app.use('/api/segments', segmentRoutes);
    app.use('/api/customers', customerRoutes);
    app.use('/api/transactions', transactionRoutes);
    app.use('/api/pending-edits', pendingEditRoutes);

    // Error handling middleware
    app.use(errorHandler);
}