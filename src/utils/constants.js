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
  'Duplicate request',
  'Ok for disbursement',
  'Net pay below threshold',
  'Inconsistent net pay',
  'Incorrect IPPIS number',
  'Confirm recommended loan amount',
  'Confirm recommended tenor',
  'Confirm account number',
  'Confirm BVN',
  'Confirm BVN and account number',
  'Age above threshold',
  'Length of service above threshold',
  'Bad loan with other institution',
  'Department not eligible',
  'Negative net pay',
  'Not eligible for top up',
  'High exposure',
  'Name mismatch',
  'Net pay not available',
  'Client discontinued',
  'Failed to provide valid documentation'
]

export const maritalStatus = [
  'Single',
  'Married',
  'Divorced',
  'Separated',
  'Widow',
  'Widower'
]

export const userRoles = {
  ADMIN: 'Q2',
  AGENT: 'Y6',
  CREDIT: 'R4',
  MASTER: 'Z0',
  MANAGER: 'E3',
  OPERATIONS: 'T5',
  OWNER: 'W1'
  // support: 'Support',
}

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
  SUCCESS: 'successful'
}

export const validIds = [
  'Voters card',
  'International passport',
  'Staff ID card',
  'National ID card',
  "Driver's license"
]

export const companyCategory = ['MFB', 'Finance House', 'Money Lender']

export const socials = [
  'facebook',
  'twitter',
  'instagram',
  'youtube',
  'linkedin',
  'tictok'
]
