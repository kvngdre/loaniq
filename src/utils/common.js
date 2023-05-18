export const companyCategory = ['mfb', 'finance house', 'money lender'];

export const feeTypes = { percent: 'percent', decimal: 'decimal' };

export const GEO_ZONES = [
  'north central',
  'north east',
  'north west',
  'south east',
  'south south',
  'south west',
];

export const loanRemarks = [
  'age above threshold',
  'bad loan with other institution',
  'client discontinued',
  'confirm account number',
  'confirm bvn and account number',
  'confirm bvn',
  'confirm loan amount and tenor',
  'confirm loan amount',
  'confirm tenor',
  'department not eligible',
  'duplicate request',
  'failed to provide valid documentations',
  'high exposure',
  'inconsistent net pay',
  'incorrect staff id',
  'length of service above threshold',
  'name mismatch',
  'negative net pay',
  'net pay below threshold',
  'net pay not available',
  'not eligible for top up',
  'ok for disbursement',
];

export const loanStatus = {
  APPROVED: 'approved',
  DENIED: 'denied',
  DISCONTINUED: 'discontinued',
  LIQUIDATED: 'liquidated',
  MATURED: 'matured',
  NEW: 'new',
  PENDING: 'pending',
};

export const maritalStatus = [
  'single',
  'married',
  'divorced',
  'separated',
  'widow',
  'widower',
];

export const relationships = [
  'daughter',
  'brother',
  'cousin',
  'father',
  'mother',
  'nephew',
  'sister',
  'spouse',
  'niece',
  'son',
];

export const reviewStatus = {
  APPROVED: 'approved',
  DENIED: 'denied',
  PENDING: 'pending',
};

export const socials = [
  'website',
  'facebook',
  'twitter',
  'instagram',
  'youtube',
  'linkedin',
  'tictok',
];

export class TenantStatus {
  static ACTIVE = 'active';
  static AWAITING_ACTIVATION = 'awaiting activation';
  static DEACTIVATED = 'deactivated';
  static INACTIVE = 'inactive';
  static SUSPENDED = 'suspended';
  static ONBOARDING = 'onboarding';
}

export const txnPurposes = {
  DEPOSIT: 'deposit',
  TRANSFER: 'transfer',
  WITHDRAW: 'withdrawal',
  LOAN: 'loan application',
};

export const txnStatus = {
  ABANDONED: 'abandoned',
  FAILED: 'failed',
  PENDING: 'pending',
  SUCCESS: 'success',
};

export const txnTypes = {
  CREDIT: 'credit',
  DEBIT: 'debit',
};

export const VALID_ID = [
  'voters card',
  'international passport',
  'staff id card',
  'national id card',
  'drivers license',
];

export const tenantDocumentationTypes = [
  'certificate of incorporation',
  'tax documentation',
  'money lender license',
  'mfb license',
  ...VALID_ID,
];
