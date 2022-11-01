const User = require('../models/userModel');
const Lender = require('../models/lenderModel');
const Customer = require('../models/customerModel');
const Loan = require('../models/loanModel');
const { loanStatus } = require('../utils/constants');
const ServerError = require('../errors/serverError');
const debug = require('debug')('dashController');
const logger = require('../utils/logger')('dashboardCtrl.js');

module.exports = {
    getLoanData: async (user, status) => {
        try {
            const currentYear = new Date().getUTCFullYear().toString();

            const approvedLoans = await Loan.aggregate([
                {
                    $match: {
                        creditUser: user.id,
                        status: loanStatus.approved,
                    }
                },
                {
                    $group: {
                        _id: {
                            year: currentYear,
                            month: { $month: '$createdAt' },
                        },
                        value: { $sum: '$recommendedAmount' },
                    },
                },
            ]);

            if (approvedLoans.length == 0)
                return new ServerError(404, 'No data');

            return {
                message: 'success',
                data: approvedLoans,
            };
        } catch (exception) {
            // logger.error({
            //     method:
            // })
            console.log(exception);
            debug(exception);
            return new ServerError(500, 'Something went wrong');
        }
    },
};
