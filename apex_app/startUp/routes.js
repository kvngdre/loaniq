const express = require('express');
const authRoute = require('../routes/authRoute');
const userRoutes = require('../routes/superAdminRoutes');
const errorHandler = require('../middleware/errorHandler');

module.exports = function(app) {
    // middleware
    app.use(express.json());

    // Route handlers
    app.use('/api/users', userRoutes);
    app.use('/api/auth', authRoute);

    // Error handling middleware
    app.use(errorHandler);
}