import debug from 'debug'
import flwService from '../utils/Flutterwave'
// import logger from '../utils/logger'('paymentCtrl.js')
import ServerError from '../errors/serverError'
import skService from '../utils/Paystack'
import Transaction from '../models/transactionModel'

/**
 * Generates a payment link.
 * @param {Object} params - Function parameters
 * @property {number} params.amount - The amount the user wishes to fund.
 * @property {Object} params.customer - customer details.
 * @property {Object} customer.name - customer name.
 * @property {Object} customer.email - customer email.
 * @property {Object} customer.phonenumber - customer phone number.
 * @returns {Object} Returns a payment link from either Paystack or Flutterwave.
 */
async function getPaymentLink (params) {
  try {
    const { lender, balance, amount, customer } = params

    // get paystack link
    // if (defaultOption === 0)
    let response = await skService.getPaymentLink({
      amount,
      email: customer.email
    })
    let gateway = 'Paystack'

    // if failure getting paystack fall back to flutterwave
    if (response.status !== 200 || response instanceof Error) {
      gateway = 'Flutterwave'
      response = await flwService.getPaymentLink({
        amount,
        customerDetails: customer
      })
    }

    // if both fail
    if (response.status !== 200 || response instanceof Error) { return new ServerError(424, 'Error initializing transaction.') }

    const newTransaction = new Transaction({
      lender,
      provider: gateway,
      status: 'Pending',
      reference: response.data.data.reference,
      category: 'Credit',
      amount,
      balance
    })

    await newTransaction.save()

    return {
      message: 'Transaction initialized',
      data: {
        reference: response.data.data.reference,
        url:
                    response.data.data.authorization_url ||
                    response.data.data.link
      }
    }
  } catch (exception) {
    // logger.error({
    //     method: 'get_payment_link',
    //     message: exception.message,
    //     meta: exception.stack,
    // });
    // debug(exception);
    return new ServerError(500, 'Something went wrong')
  }
}

module.exports = {
  getPaymentLink
}
