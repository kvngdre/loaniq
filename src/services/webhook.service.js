import { httpCodes, txnPurposes, txnTypes } from '../utils/common'
import { events, pubsub } from '../pubsub'
import { TransactionDTO } from '../models/transaction.model'

class WebhookService {
  static eventHandler = async (payload) => {
    const { data } = payload

    if (data.status === 'success') {
      await pubsub.publish(events.webhook.success, null, new TransactionDTO({
        tenantId: data.metadata.tenantId,
        reference: data.reference,
        status: data.status,
        type: txnTypes.CREDIT,
        purpose: txnPurposes.DEPOSIT,
        amount: data.amount / 100,
        channel: data.channel,
        fees: data.fees / 100
      }))

      return httpCodes.OK
    }
  }
}

export default WebhookService
