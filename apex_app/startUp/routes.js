const express = require('express');
const authRoute = require('../routes/authRoute');
const loanRoutes = require('../routes/loanRoutes');
const userRoutes = require('../routes/userRoutes');
const stateRoutes = require('../routes/stateRoutes');
const banksRoutes = require('../routes/banksRoutes');
const lenderRoutes = require('../routes/lenderRoutes');
const segmentRoutes = require('../routes/segmentRoutes');
const customerRoutes = require('../routes/customerRoutes');
const errorHandler = require('../middleware/errorHandler');

module.exports = function(app) {
    // middleware
    app.use(express.json());

    // Route handlers
    app.use('/api/auth', authRoute);
    app.use('/api/loans', loanRoutes);
    app.use('/api/users', userRoutes);
    app.use('/api/banks', banksRoutes);
    app.use('/api/state', stateRoutes);
    app.use('/api/lenders', lenderRoutes);
    app.use('/api/segment', segmentRoutes);
    app.use('/api/customers', customerRoutes);

    // Error handling middleware
    app.use(errorHandler);
}