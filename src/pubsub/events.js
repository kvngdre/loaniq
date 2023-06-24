export default {
  tenant: {
    signUp: 'onTenantSignUp',
  },

  user: {
    new: 'onCreateUser',
    delete: 'onUserDelete',
    updateConfig: 'onUserUpdateConfigRequest',
  },

  wallet: {
    credit: 'onWalletCredit',
    debit: 'onWalletDebit',
  },

  webhook: {
    success: 'onWebhookSuccessEvent',
    failure: 'onWebhookFailedEvent',
    pending: 'onWebhookPendingEvent',
  },
};
