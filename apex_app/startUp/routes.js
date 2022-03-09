const express = require('express');
const authRoute = require('../routes/authRoute');
const userRoutes = require('../routes/userRoutes');
const adminRoutes = require('../routes/adminRoutes');
const loanAgentRoutes = require('../routes/loanAgentRoutes');
const operationsRoutes = require('../routes/operationsRoutes');
const errorHandler = require('../middleware/errorHandler');

module.exports = function(app) {
    // middleware
    app.use(express.json());

    // Route handlers
    app.use('/api/auth', authRoute);
    app.use('/api/users', userRoutes);
    app.use('/api/admin', adminRoutes);
    app.use('/api/operations', operationsRoutes);
    app.use('/api/loan-agent', loanAgentRoutes);

    // Error handling middleware
    app.use(errorHandler);
}