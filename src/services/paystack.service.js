import { constants } from '../config'
import axios from 'axios'
import DependencyError from '../errors/DependencyError'
import TenantService from './tenant.service'
import logger from '../utils/logger'

class PaystackService {
  #headers
  #initTxnUrl
  #payment_channels
  #verifyTxnUrl

  constructor () {
    this.#headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${constants.paystack.key.private}`
    }
    this.#initTxnUrl = 'https://api.paystack.co/transaction/initialize'
    this.#payment_channels = ['card', 'bank_transfer']
    this.#verifyTxnUrl = 'https://api.paystack.co/transaction/verify/:reference'
  }

  #calcFee (amount) {
    let fee = 0.015 * amount
    if (amount < 2_500) return fee

    fee += 100
    if (fee > 2_000) return 2_000

    return fee
  }

  async initTransaction (tenantId, amount) {
    try {
      if (!tenantId || !amount) {
        throw new Error('Missing arguments.')
      }

      const { email } = await TenantService.getTenant(tenantId)

      // const fee = this.#calcFee(amount)
      const payload = {
        amount: (amount) * 100,
        email,
        channels: this.#payment_channels,
        metadata: {
          tenantId,
          amount
        }
      }

      const response = await axios.post(this.#initTxnUrl, payload, {
        headers: this.#headers
      })

      return { url: response.data.data.authorization_url }
    } catch (exception) {
      if (exception.response) {
        throw new DependencyError('Error initializing transaction.')
      }

      throw exception
    }
  }

  async verifyTransaction (ref) {
    try {
      const response = await axios.get(
        this.#verifyTxnUrl.replace(':reference', ref.toString()),
        { headers: this.#headers }
      )

      return response.data
    } catch (exception) {
      logger.error(exception.message, exception.stack)
      throw exception
    }
  }
}

export default new PaystackService()
