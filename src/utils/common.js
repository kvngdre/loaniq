export const companyCategory = ['mfb', 'finance house', 'money lender'];

export const feeTypes = { percent: 'percent', decimal: 'decimal' };

export const geoZones = [
  'north central',
  'north east',
  'north west',
  'south east',
  'south south',
  'south west',
];

export const HttpCode = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  FOUND_REDIRECT: 307,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  PAYMENT_REQUIRED: 402,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  DEPENDENCY: 424,
  INTERNAL_SERVER: 500,
};

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

export const TENANT_STATUS = {
  ACTIVE: 'active',
  AWAITING_ACTIVATION: 'awaiting_activation',
  DEACTIVATED: 'deactivated',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended',
};

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
  'national id card',
  'drivers license',
];

export const tenantDocTypes = [
  'certificate of incorporation',
  'tax registration',
  'money lender license',
  'mfb license',
];
