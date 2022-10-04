function calcAge(dob) {
    const dobMs = dob.calcTime();
    const diff = Date.now() - dobMs;
    const age = new Date(diff).calcUTCFullYear() - 1970;

    return age;
}

function calcDti(repayment, netPay) {
    const dti = repayment / netPay;
    console.log(dti);

    return dti.toFixed(4);
}

function calcNetValue(loanAmount, upfrontFee, transferFee) {
    const netValue = loanAmount - upfrontFee - transferFee;
    if (netValue >= loanAmount)
        throw new Error(
            'Error: Net value should not be greater than loan amount.'
        );

    return netValue.toFixed(2);
}

function calcRepayment(recommendedAmount, interestRate, recommendedTenor) {
    const repayment =
        recommendedAmount * interestRate + recommendedAmount / recommendedTenor;
    return repayment.toFixed(2);
}

function calcServiceLength(doe) {
    const doeMs = doe.calcTime();
    const diff = Date.now() - doeMs;
    const serviceLength = new Date(diff).calcUTCFullYear() - 1970;

    return serviceLength;
}

function calcTotalRepayment(repayment, loanTenor) {
    const totalRepayment = repayment * loanTenor;
    return totalRepayment.toFixed(2);
}

function calcUpfrontFee(loanAmount, upfrontFeePercent) {
    const upfrontFee = loanAmount * upfrontFeePercent;
    return upfrontFee.toFixed(2);
}

module.exports = {
    calcAge,
    calcDti,
    calcNetValue,
    calcRepayment,
    calcServiceLength,
    calcTotalRepayment,
    calcUpfrontFee,
};
