export const geoZones = [
  'North Central',
  'North East',
  'North West',
  'South East',
  'South South',
  'South West'
]

export const httpCodes = {
  OK: 200,
  CREATED: 201,
  FOUND_REDIRECT: 307,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  PAYMENT_REQUIRED: 402,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  DEPENDENCY: 424,
  INTERNAL_SERVER: 500
}

export const loanStatus = {
  APPROVED: 'approved',
  DENIED: 'denied',
  DISCONTINUED: 'discontinued',
  LIQUIDATED: 'liquidated',
  MATURED: 'matured',
  NEW: 'new',
  PENDING: 'pending'
}

export const loanRemarks = [
  'Age above threshold',
  'Bad loan with other institution',
  'Client discontinued',
  'Confirm account number',
  'Confirm BVN and account number',
  'Confirm BVN',
  'Confirm loan amount and tenor',
  'Confirm loan amount',
  'Confirm tenor',
  'Department not eligible',
  'Duplicate request',
  'Failed to provide valid documentations',
  'High exposure',
  'Inconsistent net pay',
  'Incorrect staff id',
  'Length of service above threshold',
  'Name mismatch',
  'Negative net pay',
  'Net pay below threshold',
  'Net pay not available',
  'Not eligible for top up',
  'Ok for disbursement'
]

export const maritalStatus = [
  'Single',
  'Married',
  'Divorced',
  'Separated',
  'Widow',
  'Widower'
]

export const relationships = [
  'Daughter',
  'Brother',
  'Cousin',
  'Father',
  'Mother',
  'Nephew',
  'Sister',
  'Spouse',
  'Niece',
  'Son'
]

export const txnStatus = {
  ABANDONED: 'abandoned',
  FAILED: 'failed',
  PENDING: 'pending',
  SUCCESS: 'success'
}

export const txnTypes = {
  CREDIT: 'credit',
  DEBIT: 'debit'
}

export const txnPurposes = {
  DEPOSIT: 'deposit',
  TRANSFER: 'transfer',
  WITHDRAW: 'withdrawal',
  LOAN: 'loan application'
}

export const validIds = [
  'Voters Card',
  'International Passport',
  'Staff ID Card',
  'National ID card',
  "Driver's License"
]

export const companyCategory = ['MFB', 'Finance House', 'Money Lender']

export const socials = [
  'website',
  'facebook',
  'twitter',
  'instagram',
  'youtube',
  'linkedin',
  'tictok'
]

export const userRoles = {
  ADMIN: 'E4',
  AGENT: 'Y5',
  ANALYST: 'R3',
  MASTER: 'Z0',
  OPERATIONS: 'T6',
  OWNER: 'W1',
  S_ADMIN: 'Q2',
  SUPPORT: 'U8'
}

export const feeTypes = { percent: 'percent', decimal: 'decimal' }
