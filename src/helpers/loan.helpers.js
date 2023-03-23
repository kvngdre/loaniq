/**
 * Computes person age
 * @param {string} dob Date of birth in ISO 8601 format.
 * @returns {number}
 */
export const computeAge = (dob) => {
  const epochYear = 1970

  const diff = Date.now() - new Date(dob).getTime()
  const age = new Date(diff).getUTCFullYear() - epochYear

  return age
}

/**
 * Computes employment tenure.
 * @param {string} doe Date of employment in ISO 8601 format.
 * @returns {number}
 */
export const computeTenure = (doe) => {
  const diff = Date.now() - new Date(doe).getTime()
  const tenure = new Date(diff).getUTCFullYear() - 1970

  return tenure
}

/**
 * Applies all fees to loan.
 * @param {number} amount The recommended loan amount.
 * @param  {array} fees The fees to be applied.
 * @returns {number} Net value after all deductions.
 */
export const applyFees = (amount, fees) => {
  function reducer (acc, fee) {
    const value = fee.type === 'percent' ? fee.value / 100 : fee.value

    return acc - value
  }
  const netValue = fees.reduce(reducer, amount)

  return parseFloat(netValue.toFixed(2))
}

/**
 * Computes the repayment and total repayment.
 * @param {number} amount The loan amount.
 * @param {number} interestRate The interest rate.
 * @param {number} tenor The loan tenor.
 * @returns {number[]}
 */
export const computeRepaymentSet = (amount, interestRate, tenor) => {
  const repayment = (amount * (interestRate / 100) + amount / tenor).toFixed(2)
  const totalRepayment = (repayment * tenor).toFixed(2)

  return [parseFloat(repayment), parseFloat(totalRepayment)]
}

/**
 *  Calculates the Deb-to-Income ratio.
 * @param {number} repayment The monthly repayment value.
 * @param {number} income The loanee's monthly income.
 * @returns {number}
 */
export const computeDTI = (repayment, income) => {
  const dti = (repayment / income) * 100

  return parseFloat(dti.toFixed(2))
}
