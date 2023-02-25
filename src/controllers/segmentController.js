import Segment, { find, findById } from '../models/segment.model'
import ServerError from '../errors/serverError'
const debug = require('debug')('app:segCtrl')
const logger = require('../utils/Logger')

export async function create (payload) {
  try {
    const newSegment = new Segment(payload)
    await newSegment.save()

    return {
      message: 'Segment created',
      data: newSegment
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

    const foundSegments = await find(queryFilter).sort('name')
    if (foundSegments.length === 0) { return new ServerError(404, 'No segments found') }

    return {
      message: 'success',
      data: foundSegments
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
    const foundSegment = await findById(id)
    if (!foundSegment) { return new ServerError(404, 'Segment not found') }

    return {
      message: 'success',
      data: foundSegment
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
    const foundSegment = await findById(id)
    if (!foundSegment) { return new ServerError(404, 'Segment not found') }

    foundSegment.set(payload)
    await foundSegment.save()

    return {
      message: 'Segment Updated',
      data: foundSegment
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
    const foundSegment = await findById(id)
    if (!foundSegment) { return new ServerError(404, 'Segment not found') }

    await foundSegment.delete()

    return {
      message: 'Segment deleted',
      data: foundSegment
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
