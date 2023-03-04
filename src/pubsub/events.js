export default {
  tenant: {
    signUp: 'onTenantSignUp'
  },

  user: {
    new: 'onCreateUser',
    login: 'onUserLogin',
    delete: 'onUserDelete'
  },

  wallet: {
    credit: 'onWalletCredit',
    debit: 'onWalletDebit'
  },

  webhook: {
    success: 'onWebhookSuccessEvent',
    failure: 'onWebhookFailedEvent',
    pending: 'onWebhookPendingEvent'
  }
}
