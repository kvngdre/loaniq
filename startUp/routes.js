const authRouter = require('../routes/authRoutes');
const banksRouter = require('../routes/bankRoutes');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const corsOptions = require('../config/corsOptions');
const credentials = require('../middleware/credentials');
const customerRouter = require('../routes/customerRoutes');
const errorHandler = require('../middleware/errorHandler');
const express = require('express');
const helmet = require('helmet');
const lenderRouter = require('../routes/lenderRoutes');
const loanRouter = require('../routes/loanRoutes');
const originRouter = require('../routes/origin');
const pendingEditRouter = require('../routes/pendingEditRoutes');
const refreshTokenRouter = require('../routes/refreshTokenRoutes');
const segmentRouter = require('../routes/segment');
const stateRouter = require('../routes/stateRoutes');
const transactionRouter = require('../routes/transactionRoutes');
const userRouter = require('../routes/userRoutes');

module.exports = function (app) {
    // middleware
    app.use(credentials);
    app.use(cors(corsOptions));
    app.use(helmet());
    app.use(express.urlencoded({ extended: false }));
    app.use(express.json());
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
