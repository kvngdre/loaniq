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
