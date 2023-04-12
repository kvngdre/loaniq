import { loanStatus } from '../utils/common.js'
import Customer from '../models/customer.model.js'
import Tenant from '../models/tenant.model.js'
import Loan from '../models/loan.model.js'
import User from '../models/user.model.js'
import logger from '../utils/logger.js'

export const getLoanData = async (user, status) => {
  try {
    const currentYear = new Date().getUTCFullYear().toString()

    const approvedLoans = await Loan.aggregate([
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

    if (approvedLoans.length === 0) {
      return
    }

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
  }
}
