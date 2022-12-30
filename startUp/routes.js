const authRouter = require('../routers/authRoutes');
const banksRouter = require('../routers/bankRoutes');
const customerRouter = require('../routers/customerRoutes');
const dashboardRouter = require('../routers/dashboardRoutes');
const errorHandler = require('../middleware/errorHandler');
const lenderRouter = require('../routers/lenderRoutes');
const loanRouter = require('../routers/loanRoutes');
const originRouter = require('../routers/origin');
const pendingEditRouter = require('../routers/pendingEditRoutes');
const refreshTokenRouter = require('../routers/refreshTokenRoutes');
const segmentRouter = require('../routers/segmentRoutes');
const stateRouter = require('../routers/stateRoutes');
const transactionRouter = require('../routers/transactionRoutes');
const userRouter = require('../routers/userRoutes');

module.exports = function (app) {
    app.use('/api/auth', authRouter);
    app.use('/api/banks', banksRouter);
    app.use('/api/customers', customerRouter);
    app.use('/api/dashboard', dashboardRouter);
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
