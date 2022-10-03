function getAge(dob) {
    const dobMs = dob.getTime();
    const diff = Date.now() - dobMs;
    const age = new Date(diff).getUTCFullYear() - 1970;

    return age;
}

function getDti(repayment, netPay) {
    const dti = repayment / netPay;
    console.log(dti);

    return dti.toFixed(4);
}

function getNetValue(loanAmount, upfrontFee, transferFee) {
    const netValue = loanAmount - upfrontFee - transferFee;
    if (netValue >= loanAmount)
        throw new Error(
            'Error: Net value should not be greater than loan amount.'
        );

    return netValue.toFixed(2);
}

function getRepayment(recommendedAmount, interestRate, recommendedTenor) {
    const repayment =
        recommendedAmount * interestRate + recommendedAmount / recommendedTenor;
    return repayment.toFixed(2);
}

function getServiceLength(doe) {
    const doeMs = doe.getTime();
    const diff = Date.now() - doeMs;
    const serviceLength = new Date(diff).getUTCFullYear() - 1970;

    return serviceLength;
}

function getTotalRepayment(repayment, loanTenor) {
    const totalRepayment = repayment * loanTenor;
    return totalRepayment.toFixed(2);
}

function getUpfrontFee(loanAmount, upfrontFeePercent) {
    const upfrontFee = loanAmount * upfrontFeePercent;
    return upfrontFee.toFixed(2);
}

module.exports = {
    getAge,
    getDti,
    getNetValue,
    getRepayment,
    getServiceLength,
    getTotalRepayment,
    getUpfrontFee,
};
