const { loanStatus } = require('../utils/constants');
const Customer = require('../models/customerModel');
const debug = require('debug')('dashController');
const Lender = require('../models/lenderModel');
const Loan = require('../models/loanModel');
const logger = require('../utils/logger')('dashboardCtrl.js');
const ServerError = require('../errors/serverError');
const User = require('../models/userModel');

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
                return new ServerError(404, 'No data available');

            return {
                message: 'success',
                data: approvedLoans,
            };
        } catch (exception) {
            logger.error({
                method: 'get_loan_data',
                message: exception.message,
                meta: exception.stack
            })
            debug(exception);
            return new ServerError(500, 'Something went wrong');
        }
    },
};
