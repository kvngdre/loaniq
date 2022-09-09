class Params {
    calcUpfrontFee(loanAmount, upfrontFeePercent) {
        const upfrontFee = loanAmount * upfrontFeePercent;
        return upfrontFee.toFixed(2);
    };

    calcRepayment(recommendedAmount, interestRate, recommendedTenor) {
        const repayment =  (recommendedAmount * interestRate) + (recommendedAmount / recommendedTenor);
        return repayment.toFixed(2);
    };

    calcTotalRepayment(repayment, loanTenor) {
        const totalRepayment = repayment * loanTenor;
        return (totalRepayment).toFixed(2);
    };

    calcNetValue(loanAmount, upfrontFee, transferFee) {
        const netValue = (loanAmount - upfrontFee) - transferFee;
        if(netValue >= loanAmount) throw new Error('Error: Net value should not be greater than loan amount.');

        return netValue.toFixed(2);
    };

    calcDti(repayment, netPay) {
        const dti = repayment / netPay;
        console.log(dti)
        
        return (dti).toFixed(4) ;
    };

    age(dob) {
        const dobMs = dob.getTime();
        const diff = Date.now() - dobMs;
        const age = new Date(diff).getUTCFullYear() - 1970;

        return { 
            isValid: (age >= 21 && age <= 58), 
            age 
        };
    };

    serviceLength(doe) {
        const doeMs = doe.getTime();
        const diff = Date.now() - doeMs;
        const serviceLength = new Date(diff).getUTCFullYear() - 1970;

        return { 
            isValid: serviceLength <= 33, 
            yearsServed: serviceLength 
        };
    };
};

module.exports = Params;