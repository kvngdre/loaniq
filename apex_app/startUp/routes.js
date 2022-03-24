const express = require('express');
const authRoute = require('../routes/authRoute');
const loanRoutes = require('../routes/loanRoutes');
const userRoutes = require('../routes/userRoutes');
const adminRoutes = require('../routes/adminRoutes');
const creditRoutes = require('../routes/creditRoutes');
const lenderRoutes = require('../routes/lenderRoutes');
const loanAgentRoutes = require('../routes/loanAgentRoutes');
const operationsRoutes = require('../routes/operationsRoutes');
const errorHandler = require('../middleware/errorHandler');

module.exports = function(app) {
    // middleware
    app.use(express.json());

    // Route handlers
    app.use('/api/auth', authRoute);
    app.use('/api/loans', loanRoutes);
    app.use('/api/users', userRoutes);
    app.use('/api/admin', adminRoutes);
    app.use('/api/credit', creditRoutes);
    app.use('/api/lenders', lenderRoutes);
    app.use('/api/agents', loanAgentRoutes);
    app.use('/api/operations', operationsRoutes);

    // Error handling middleware
    app.use(errorHandler);
}