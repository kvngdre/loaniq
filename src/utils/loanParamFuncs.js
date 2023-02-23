function calcAge (dob) {
  const diff = Date.now() - (new Date(dob).getTime())
  const age = new Date(diff).getUTCFullYear() - 1970

  return age
}

function calcDti (repayment, netPay) {
  const dti = (repayment / netPay) * 100
  return dti.toFixed(2)
}

function calcNetValue (recommendedAmount, upfrontFee, transferFee) {
  const netValue = recommendedAmount - upfrontFee - transferFee
  if (netValue >= recommendedAmount) {
    throw new Error(
      'Error: Net value should not be greater than loan amount.'
    )
  }

  return netValue.toFixed(2)
}

function calcRepayment (recommendedAmount, interestRate, recommendedTenor) {
  const repayment =
        recommendedAmount * (interestRate / 100) + recommendedAmount / recommendedTenor
  return repayment.toFixed(2)
}

function calcServiceLength (doe) {
  const diff = Date.now() - new Date(doe).getTime()
  const serviceLength = new Date(diff).getUTCFullYear() - 1970

  return serviceLength
}

function calcTotalRepayment (repayment, recommendedTenor) {
  const totalRepayment = repayment * recommendedTenor
  return totalRepayment.toFixed(2)
}

function calcUpfrontFee (recommendedAmount, upfrontFeePercent) {
  const upfrontFee = recommendedAmount * (upfrontFeePercent / 100)
  return upfrontFee.toFixed(2)
}

export default {
  calcAge,
  calcDti,
  calcNetValue,
  calcRepayment,
  calcServiceLength,
  calcTotalRepayment,
  calcUpfrontFee
}
