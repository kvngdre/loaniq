const config = require("config");

class Metrics {
    constructor() {
        this.netPay = netPay
    }

    ageValidator(dob) {
        const dobMilliSec = new Date(dob).getTime();
        
        const diff = Date.now() - dobMilliSec;

        const diff_year = new Date(diff).getUTCFullYear();

        const age = diff_year - 1970;

        return { result: age >= 21 && age <= 57, value: age };
    };

    serviceLengthValidator(doe) {
        const doeMilliSec = new Date(doe).getTime();

        const diff = Date.now() - doeMilliSec;

        const diff_year = new Date(diff).getUTCFullYear();

        const serviceLength = diff_year - 1970;

        return { result: serviceLength <= 33, value: serviceLength };
    };

    netPayValidator() {
        return { result: this.netPay >= config.get('loanMetrics.minNetPay') };
    };

    dtiRatioCalculator(repayment) {
        const value = repayment / this.netPay;

        return { result: value < config.get('loanMetrics.dtiThreshold'), value }

    }

};

module.exports = Metrics;