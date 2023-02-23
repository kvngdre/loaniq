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
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  PAYMENT_REQUIRED: 402,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER: 500
}

export const loanStatus = {
  approved: 'Approved',
  denied: 'Denied',
  discntd: 'Discontinued',
  hold: 'On Hold',
  liquidated: 'Liquidated',
  matured: 'Matured',
  pending: 'Pending'
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

export const roles = {
  admin: 'Admin',
  agent: 'Agent',
  credit: 'Credit',
  master: 'Master',
  operations: 'Operations',
  owner: 'Owner'
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
  abandoned: 'Abandoned',
  failed: 'Failed',
  pending: 'Pending',
  success: 'Successful'
}

export const validIds = [
  'Voters card',
  'International passport',
  'Staff ID card',
  'National ID card',
  "Driver's license"
]
