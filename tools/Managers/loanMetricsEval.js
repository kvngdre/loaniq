class Metrics {
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
        if(netValue >= loanAmount) throw new Error('Error: Net value should not be greater than loan amount');

        return netValue.toFixed(2);
    };

    ageValidator(dob) {
        const dobMSec = dob.getTime();
        const diff = Date.now() - dobMSec;
        const age = new Date(diff).getUTCFullYear() - 1970;

        return { 
            isValid: (age >= 21 && age <= 58), 
            age 
        };
    };

    serviceLengthValidator(doe) {
        const doeMSec = doe.getTime();
        const diff = Date.now() - doeMSec;
        const serviceLength = new Date(diff).getUTCFullYear() - 1970;

        return { 
            isValid: serviceLength <= 33, 
            yearsServed: serviceLength 
        };
    };

    netPayValidator(netPay, minNetPay) {
        return netPay >= minNetPay;
    };

    dtiRatioCalculator(repayment, netPay, maxDTI) {
        const value = repayment / netPay;

        return { 
            isValid: value < maxDTI, 
            value: value.toFixed(4) 
        };
    };
};

module.exports = Metrics;