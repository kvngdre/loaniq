import { roles } from '../utils/constants'
import ServerError from '../errors/serverError'
import Transaction, { find, findById } from '../models/transactionModel'
const debug = require('debug')('app:txnCtrl')
const logger = require('../utils/Logger')

export async function create (user, payload) {
  try {
    const newTransaction = new Transaction(payload)
    newTransaction.modifiedBy = user.id

    await newTransaction.save()

    return {
      message: 'Transaction created',
      data: newTransaction
    }
  } catch (exception) {
    logger.error({
      method: 'create',
      message: exception.message,
      meta: exception.stack
    })
    debug(exception)
    return new ServerError(500, 'Something went wrong')
  }
}
export async function getAll (user, filters) {
  try {
    const queryFilter = user.role === roles.master ? {} : { lender: user.lender }

    if (filters?.type) { queryFilter.type = filters.type }
    if (filters?.status) { queryFilter.status = filters.status }

    // Number Filter - amount   `k            if (filters?.min) queryFilter.amount = { $gte: filters.min };
    if (filters?.max) {
      const target = queryFilter.amount ? queryFilter.amount : {}
      queryFilter.amount = Object.assign(target, {
        $lte: filters.max
      })
    }

    const foundTransactions = await find(queryFilter, {
      lender: 0
    }).sort('-createdAt')
    if (foundTransactions.length == 0) { return new ServerError(404, 'No transactions found') }

    return {
      message: 'success',
      data: foundTransactions
    }
  } catch (exception) {
    logger.error({
      method: 'get_all',
      message: exception.message,
      meta: exception.stack
    })
    debug(exception)
    return new ServerError(500, 'Something went wrong')
  }
}
export async function getOne (id, user) {
  try {
    const foundTransaction = await findById(id, {
      lender: 0
    })
    if (!foundTransaction) { return new ServerError(404, 'Transaction not found') }

    return {
      message: 'success',
      data: foundTransaction
    }
  } catch (exception) {
    logger.error({
      method: 'get_one',
      message: exception.message,
      meta: exception.stack
    })
    debug(exception)
    return new ServerError(500, 'Something went wrong')
  }
}
export async function update (id, user, alteration) {
  try {
    const foundTransaction = await findById(id)
    if (!foundTransaction) { return new ServerError(404, 'Transaction not found') }

    foundTransaction.set(alteration)
    foundTransaction.modifiedBy = user.id

    await foundTransaction.save()

    return {
      message: 'Transaction updated',
      data: foundTransaction
    }
  } catch (exception) {
    logger.error({
      method: 'update',
      message: exception.message,
      meta: exception.stack
    })
    debug(exception)
    return new ServerError(500, 'Something went wrong')
  }
}
export async function delete_ () {
  try {
  } catch (exception) {
    logger.error({
      method: 'delete',
      message: exception.message,
      meta: exception.stack
    })
    debug(exception)
    return new ServerError(500, 'Something went wrong')
  }
}
