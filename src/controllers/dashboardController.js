import { loanStatus } from '../utils/constants'
import Customer from '../models/customer.model'
import Tenant from '../models/tenant.model'
import { aggregate } from '../models/loanModel'
import ServerError from '../errors/serverError'
import User from '../models/user.model'
const debug = require('debug')('dashController')
const logger = require('../utils/logger').default('dashboardCtrl.js')

export default {
  getLoanData: async (user, status) => {
    try {
      const currentYear = new Date().getUTCFullYear().toString()

      const approvedLoans = await aggregate([
        {
          $match: {
            creditUser: user.id,
            status: loanStatus.approved
          }
        },
        {
          $group: {
            _id: {
              year: currentYear,
              month: { $month: '$createdAt' }
            },
            value: { $sum: '$recommendedAmount' }
          }
        }
      ])

      if (approvedLoans.length == 0) { return new ServerError(404, 'No data available.') }

      return {
        message: 'success',
        data: approvedLoans
      }
    } catch (exception) {
      logger.error({
        method: 'get_loan_data',
        message: exception.message,
        meta: exception.stack
      })
      debug(exception)
      return new ServerError(500, 'Something went wrong')
    }
  }
}
