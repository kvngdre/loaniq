import ServerError from '../errors/serverError'
import State, { find, findById } from '../models/stateModel'
const debug = require('debug')('app:stateCtrl')
const logger = require('../utils/logger')

export async function create (payload) {
  try {
    const newState = new State(payload)
    await newState.save()

    return {
      message: 'State created',
      data: newState
    }
  } catch (exception) {
    logger.error({
      method: 'create',
      message: exception.message,
      meta: exception.stack
    })
    debug(exception)
    if (exception.name === 'MongoServerError') {
      const field = Object.keys(exception.keyPattern)[0].toUpperCase()
      return new ServerError(409, field + ' already in use')
    }

    if (exception.name === 'ValidationError') {
      const field = Object.keys(exception.errors)[0]
      return new ServerError(
        400,
        exception.errors[field].message.replace('Path', '')
      )
    }

    return new ServerError(500, 'Something went wrong')
  }
}
export async function getAll (filters) {
  try {
    const queryFilter = {}
    if (filters?.name) { queryFilter.name = new RegExp(filters.name, 'i') }
    if (filters?.lga) { queryFilter.lgas = new RegExp(filters.lga, 'i') }

    const foundStates = await find(queryFilter).sort('name')
    if (foundStates.length === 0) { return new ServerError(404, 'No states found') }

    return {
      message: 'success',
      data: foundStates
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
export async function getOne (id) {
  try {
    const foundState = await findById(id)
    if (!foundState) { return new ServerError(404, 'State not found') }

    return {
      message: 'success',
      data: foundState
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
export async function update (id, payload) {
  try {
    const foundState = await findById(id)
    if (!foundState) { new ServerError(404, 'State not found') }

    foundState.set(payload)
    await foundState.save()

    return {
      message: 'State updated',
      data: foundState
    }
  } catch (exception) {
    logger.error({
      method: 'update',
      message: exception.message,
      meta: exception.stack
    })
    debug(exception)
    if (exception.name === 'MongoServerError') {
      const field = Object.keys(exception.keyPattern)[0].toUpperCase()
      return new ServerError(409, field + ' already in use')
    }

    if (exception.name === 'ValidationError') {
      const field = Object.keys(exception.errors)[0]
      return new ServerError(
        400,
        exception.errors[field].message.replace('Path', '')
      )
    }

    return new ServerError(500, 'Something went wrong')
  }
}
export async function delete_ (id) {
  try {
    const foundState = await findById(id)
    if (!foundState) { return new ServerError(404, 'State not found') }

    await foundState.delete()

    return {
      message: 'State deleted',
      data: foundState
    }
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
