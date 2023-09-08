import { Router } from "express";

import authRouter from "./auth.routes.js";
// import bankRouter from './bank.routes.js';
// import customerRouter from './customer.routes.js';
// import dashboardRouter from './dashboard.routes.js';
// import emailTemplateRouter from './email-template.routes.js';
// import loanRouter from './loan.routes.js';
// import clientRouter from './client.routes.js';
// import permissionRouter from './permissions.routes.js';
// import reviewRouter from './review.routes.js';
import roleRouter from "./role.routes.js";
// import segmentRouter from './segment.routes.js';
// import stateRouter from './state.routes.js';
import tenantRouter from "./tenant.routes.js";
// import testRoutes from './test.routes.js';
import userRoutes from "./user.routes.js";
// import webhookRouter from './webhook.routes.js';

export const appRouter = Router();

appRouter.use("/auth", authRouter);
// router.use('/banks', bankRouter);
// router.use('/clients', clientRouter);
// router.use('/customers', customerRouter);
// router.use('/dashboard', dashboardRouter);
// router.use('/email-templates', emailTemplateRouter);
// router.use('/loans', loanRouter);
// router.use('/permissions', permissionRouter);
// router.use('/reviews', reviewRouter);
appRouter.use("/roles", roleRouter);
// router.use('/segments', segmentRouter);
// router.use('/states', stateRouter);
appRouter.use("/tenants", tenantRouter);
// router.use('/test', testRoutes);
// router.use('/transactions', transactionRouter);
appRouter.use("/users", userRoutes);
// router.use('/wallets', walletRoutes);
// router.use('/webhooks', webhookRouter);
