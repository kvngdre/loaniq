import authRoutes from './auth.routes'
import bankRoutes from './bank.routes'
import customerRoutes from './customer.routes'
import dashboardRoutes from './dashboard.routes'
import loanRoutes from './loan.routes'
import reviewRoutes from './review.routes.js'
import segmentRoutes from './segment.routes'
import stateRoutes from './state.routes'
import tenantRoutes from './tenant.routes'
import testRoutes from './test.routes'
import transactionRoutes from './transaction.routes'
import userRoutes from './user.routes'
import webhookRoutes from './webhook.routes'
import Router from 'express'

const router = Router()

export default () => {
  router.use('/auth', authRoutes)
  router.use('/banks', bankRoutes)
  router.use('/customers', customerRoutes)
  router.use('/dashboard', dashboardRoutes)
  router.use('/loans', loanRoutes)
  router.use('/reviews', reviewRoutes)
  router.use('/segments', segmentRoutes)
  router.use('/states', stateRoutes)
  router.use('/tenants', tenantRoutes)
  router.use('/test', testRoutes)
  router.use('/transactions', transactionRoutes)
  router.use('/users', userRoutes)
  router.use('/webhooks', webhookRoutes)

  return router
}
