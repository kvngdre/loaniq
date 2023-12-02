import { Router } from 'express'

import authRoutes from './auth.routes.js'
import bankRoutes from './bank.routes.js'
import customerRoutes from './customer.routes.js'
import dashboardRoutes from './dashboard.routes.js'
import loanRoutes from './loan.routes.js'
import pendingEditRoutes from './pendingEdit.routes.js'
import segmentRoutes from './segment.routes.js'
import stateRoutes from './state.routes.js'
import tenantRoutes from './tenant.routes.js'
import testRoutes from './test.routes.js'
import transactionRoutes from './transaction.routes.js'
import userRoutes from './user.routes.js'
import webhookRoutes from './webhook.routes.js'

const router = Router()

export default () => {
  router.use('/auth', authRoutes)
  router.use('/bank', bankRoutes)
  router.use('/customer', customerRoutes)
  router.use('/dashboard', dashboardRoutes)
  router.use('/loan', loanRoutes)
  router.use('/pending-edit', pendingEditRoutes)
  router.use('/segment', segmentRoutes)
  router.use('/state', stateRoutes)
  router.use('/tenant', tenantRoutes)
  router.use('/test', testRoutes)
  router.use('/transaction', transactionRoutes)
  router.use('/user', userRoutes)
  router.use('/webhook', webhookRoutes)

  return router
}
