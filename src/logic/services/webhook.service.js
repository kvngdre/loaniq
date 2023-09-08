import { HttpCode, txnPurposes, txnTypes } from "../../utils/common.js";
import { TransactionDTO } from "../models/transaction.model.js";
import { events, pubsub } from "../pubsub/index.js";

class WebhookService {
  static eventHandler = async (payload) => {
    const { data } = payload;

    if (data.status === "success") {
      await pubsub.publish(
        events.webhook.success,
        null,
        new TransactionDTO({
          tenantId: data.metadata.tenantId,
          reference: data.reference,
          status: data.status,
          type: txnTypes.CREDIT,
          purpose: txnPurposes.DEPOSIT,
          amount: data.amount / 100,
          channel: data.channel,
          fees: data.fees / 100,
        }),
      );

      return HttpCode.OK;
    }
  };
}

export default WebhookService;
