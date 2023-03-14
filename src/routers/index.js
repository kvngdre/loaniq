import { Router } from 'express'
import authRouter from './auth.routes'
import bankRouter from './bank.routes'
import commonRouter from './common.routes'
import customerRouter from './customer.routes'
import dashboardRouter from './dashboard.routes'
import loanRouter from './loan.routes'
import reviewRouter from './review.routes.js'
import segmentRouter from './segment.routes'
import stateRouter from './state.routes'
import tenantRouter from './tenant.routes'
import testRoutes from './test.routes'
import transactionRouter from './transaction.routes'
import userRoutes from './user.routes'
import walletRoutes from './wallet.routes'
import webhookRouter from './webhook.routes'

const router = Router()

export default () => {
  router.use('/auth', authRouter)
  router.use('/banks', bankRouter)
  router.use('/common', commonRouter)
  router.use('/customers', customerRouter)
  router.use('/dashboard', dashboardRouter)
  router.use('/loans', loanRouter)
  router.use('/reviews', reviewRouter)
  router.use('/segments', segmentRouter)
  router.use('/states', stateRouter)
  router.use('/tenants', tenantRouter)
  router.use('/test', testRoutes)
  router.use('/transactions', transactionRouter)
  router.use('/users', userRoutes)
  router.use('/wallet', walletRoutes)
  router.use('/webhooks', webhookRouter)

  return router
}
