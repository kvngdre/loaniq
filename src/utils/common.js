import _ from 'lodash';
import { ValidId } from './constants.utils.js';

/**
 * The possible values of the tenant category.
 * @enum {string}
 */
export const CompanyCategory = {
  MFB: 'mfb',
  FINANCE_HOUSE: 'finance house',
  MONEY_LENDER: 'money lender',
};

/**
 * The possible values of the type of fee.
 * @enum {string}
 */
export const FeeType = { PERCENT: 'percent', DECIMAL: 'decimal' };

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

export const ReviewStatus = {
  APPROVED: 'approved',
  DENIED: 'denied',
  PENDING: 'pending',
};

/**
 * The possible values of the social platforms.
 * @enum {string}
 */
export const SocialPlatform = {
  WEBSITE: 'website',
  FACEBOOK: 'facebook',
  TWITTER: 'twitter',
  INSTAGRAM: 'instagram',
  YOUTUBE: 'youtube',
  LINKEDIN: 'linkedin',
  TICTOK: 'tictok',
};

/**
 * The possible values of the tenant status.
 * @enum {string}
 */
export const TenantStatus = {
  ACTIVE: 'active',
  AWAITING_ACTIVATION: 'awaiting activation',
  DEACTIVATED: 'deactivated',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended',
  ONBOARDING: 'onboarding',
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

/**
 * @enum {string}
 */
export const TenantDocumentationTypes = {
  CAC_DOC: 'certificate of incorporation',
  TAX_REG: 'tax registration',
  MONEY_LENDER_LICENSE: 'money lender license',
  MFB_LICENSE: 'mfb license',
  ..._.omit(ValidId, ValidId.STAFF_ID),
};
