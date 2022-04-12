class Metrics {
    // constructor() {
    //     this.netPay = netPay
    // }

    calcUpfrontFee(loanAmount, upfrontFeePercent) {
        const upfrontFee = loanAmount * upfrontFeePercent;
        return upfrontFee.toFixed(2);
    };

    calcRepayment(loanAmount, interestRate, loanTenor) {
        const repayment =  (loanAmount * interestRate) + (loanAmount / loanTenor);
        return repayment.toFixed(2);
    };

    calcTotalRepayment(repayment, loanTenor) {
        const totalRepayment = repayment * loanTenor;
        return totalRepayment;
    };

    calcNetValue(loanAmount, upfrontFee, transferFee) {
        const netValue = (loanAmount - upfrontFee) - transferFee;
        if(netValue >= loanAmount) throw new Error('Error in net value');

        return netValue.toFixed(2);
    };

    ageValidator(dob) {
        const dobMilliSec = dob.getTime();

        const diff = Date.now() - dobMilliSec;

        const diff_year = new Date(diff).getUTCFullYear();

        const age = diff_year - 1970;

        return { result: age >= 21 && age <= 57, value: age };
    };

    serviceLengthValidator(doe) {
        const doeMilliSec = doe.getTime();

        const diff = Date.now() - doeMilliSec;

        const diff_year = new Date(diff).getUTCFullYear();

        const serviceLength = diff_year - 1970;

        return { result: serviceLength <= 33, value: serviceLength };
    };

    netPayValidator(netPay) {
        return { result: netPay >= ('loanMetrics.minNetPay') };
    };

    dtiRatioCalculator(repayment, netPay) {
        const value = repayment / netPay;

        return { result: value < ('dtiThreshold'), value: value.toFixed(4) }

    }

};

module.exports = Metrics;
