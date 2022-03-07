const express = require('express');
const authRoute = require('../routes/authRoute');
const adminRoutes = require('../routes/adminRoutes');
const errorHandler = require('../middleware/errorHandler');

module.exports = function(app) {
    // middleware
    app.use(express.json());

    // Route handlers
    app.use('/api/admin', adminRoutes);
    app.use('/api/auth', authRoute);

    // Error handling middleware
    app.use(errorHandler);
}