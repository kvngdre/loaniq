import Bank, { find, findById } from '../models/bank.model'
import { validateCreation, validateUpdate } from '../validators/bank.validator'
import ServerResponse from '../utils/ServerResponse'
const debug = require('debug')('app:bankModel')
const logger = require('../utils/Logger')

const MONGO_DUPLICATE_ERROR_CODE = 11000

class BankController {
  /**
     *
     * @param {Object} bankDto
     * @param {string} bankDto.name - The name of the bank.
     * @param {string} bankDto.code - The bank code.
     * @returns
     */
  async create ({ name, code }) {
    try {
      const { error } = validateCreation({ name, code })
      if (error) {
        return new ServerResponse(
          400,
          this.#formatMsg(error.details[0].message)
        )
      }

      const newBank = new Bank({
        name,
        code
      })
      await newBank.save()

      return new ServerResponse(201, 'Bank created', newBank)
    } catch (exception) {
      logger.error({
        method: 'createBank',
        message: exception.message,
        meta: exception.stack
      })
      debug(exception)
      // Duplicate field error handling
      if (exception.code === MONGO_DUPLICATE_ERROR_CODE) {
        const field = Object.keys(exception.keyPattern)[0]
        return new ServerResponse(409, `Bank ${field} already in use.`)
      }
      return new ServerResponse(500, 'Something went wrong')
    }
  }

  /**
     * Retrieves all banks
     * @returns
     */
  async getBanks () {
    try {
      const foundBanks = await find()
      if (foundBanks.length === 0) { return new ServerResponse(404, 'No banks found') }

      return new ServerResponse(200, 'Success', foundBanks)
    } catch (exception) {
      logger.error({
        method: 'getBanks',
        message: exception.message,
        meta: exception.stack
      })
      debug(exception)
      return new ServerResponse(500, 'Something went wrong')
    }
  }

  /**
     * Retrieves a bank.
     * @param {string} bankId - The bank object id.
     * @returns
     */
  async getBank (bankId) {
    try {
      const foundBank = await findById(bankId)
      if (!foundBank) return new ServerResponse(404, 'Bank not found')

      return new ServerResponse(200, 'Success', foundBank)
    } catch (exception) {
      logger.error({
        method: 'getBank',
        message: exception.message,
        meta: exception.stack
      })
      debug(exception)
      return new ServerResponse(500, 'Something went wrong')
    }
  }

  /**
     * Modifies a bank
     * @param {string} bankId
     * @param {Object} alteration
     * @returns
     */
  async updateBank (bankId, alteration) {
    try {
      const { error } = validateUpdate(alteration)
      if (error) {
        return new ServerResponse(
          400,
          this.#formatMsg(error.details[0].message)
        )
      }

      const foundBank = await findById(bankId)
      if (!foundBank) return new ServerResponse(404, 'Bank not found')

      foundBank.set(alteration)
      await foundBank.save()

      return new ServerResponse(200, 'Success', foundBank)
    } catch (exception) {
      logger.error({
        method: 'updateBank',
        message: exception.message,
        meta: exception.stack
      })
      debug(exception)
      if (exception.code === MONGO_DUPLICATE_ERROR_CODE) {
        const field = Object.keys(exception.keyPattern)[0]
        return new ServerResponse(409, `Bank ${field} already in use.`)
      }
      return new ServerResponse(500, 'Something went wrong')
    }
  }

  /**
     * Deletes a bank
     * @param {string} bankId
     * @returns
     */
  async deleteBank (bankId) {
    try {
      const foundBank = await findById(bankId)
      if (!foundBank) return new ServerResponse(404, 'Bank not found')

      await foundBank.delete()

      return new ServerResponse(200, 'Bank deleted')
    } catch (exception) {
      logger.error({
        method: 'deleteBank',
        message: exception.message,
        meta: exception.stack
      })
      debug(exception)
      return new ServerResponse(500, 'Something went wrong')
    }
  }

  #formatMsg (errorMsg) {
    const regex = /\B(?=(\d{3})+(?!\d))/g
    let msg = `${errorMsg.replaceAll('"', '')}.` // remove quotation marks.
    msg = msg.replace(regex, ',') // add comma to numbers if present in error msg.
    return msg
  }
}

export default new BankController()
