const _ = require('lodash');
const debug = require('debug')('app:loanMgr');
const Bank = require('../../models/bankModel');
const Loan = require('../../models/loanModel');
const Origin = require('../../models/originModel');
const Segment = require('../../models/segmentModel');
const Customer = require('../../models/customerModel');
const updateLoanStatus = require('../../utils/loanStatus');
const pickRandomUser = require('../../utils/pickRandomUser');
const userController = require('../../controllers/userController');
const convertToDotNotation = require('../../utils/convertToDotNotation');
const customerController = require('../../controllers/customerController');
const PendingEditController = require('../../controllers/pendingEditController');

const manager = {
    createLoan: async function (customer, loanMetrics, request) {
        try {
            const customerOrigin = await Origin.findOne({
                ippis: customer.employmentInfo.ippis,
            });
            if (customerOrigin) {
                customer.set({
                    'netPay.value':
                        customerOrigin.netPays[0] || request.body.netPay,
                    'netPay.updatedAt': new Date(),
                });
                request.body.netPay = customer.netPay.value;
            }

            const loans = await Loan.find({
                customer: customer._id,
                lenderId: request.user.lenderId,
                active: true,
            })
                .sort('-createdAt')
                .limit(1);
            if (loans.length > 0) request.body.loanType = 'Top Up';

            let agent = null;
            if (request.user.role === 'Loan Agent') {
                agent = await userController.getOne(request.user.id, {
                    lenderId: request.user.lenderId,
                    segments: customer.employmentInfo.segment,
                });
            }

            if ((!agent || agent instanceof Error) && loans.length == 0) {
                agent = await pickRandomUser(
                    request.user.lenderId,
                    'Loan Agent',
                    customer.employmentInfo.segment
                );
            }

            if ((!agent || agent instanceof Error) && loans.length > 0)
                agent = await userController.getOne(loans[0].loanAgent);
            if (!agent || agent instanceof Error)
                return {
                    errorCode: 500,
                    message: 'Failed to assign loan agent',
                };

            const creditOfficer = await pickRandomUser(
                request.user.lenderId,
                'Credit',
                customer.employmentInfo.segment
            );
            if (!creditOfficer)
                return {
                    errorCode: 500,
                    message: 'Failed to assign credit officer',
                };

            request.body.loanAgent = agent._id;
            request.body.netPay = customer.netPay.value;
            request.body.lenderId = request.user.lenderId;
            request.body.creditOfficer = creditOfficer._id;
            request.body.transferFee = loanMetrics.transferFee;
            request.body.interestRate = loanMetrics.interestRate;
            request.body.params = { dob: customer.dateOfBirth };
            request.body.params.minNetPay = loanMetrics.minNetPay;
            request.body.upfrontFeePercent = loanMetrics.upfrontFeePercent;
            request.body.params.dtiThreshold = loanMetrics.dtiThreshold;
            request.body.params.doe = customer.employmentInfo.dateOfEnlistment;

            const newLoan = await Loan.create(request.body);
            await customer.save();

            return newLoan;
        } catch (exception) {
            debug(exception);
            return exception;
        }
    },

    createLoanRequest: async function (
        user,
        loanParams,
        customerPayload,
        loanPayload
    ) {
        try {
            let response = await customerController.getOne(
                customerPayload.employmentInfo.ippis,
                user
            );

            // If customer not found, create new customer.
            if (response.hasOwnProperty('errorCode')) {
                response = await customerController.create(
                    customerPayload,
                    user
                );
            }
            if (response.hasOwnProperty('errorCode')) {
                // TODO: log error
                return customer;
            }
            const customer = response.data;

            const loans = await Loan.find({
                active: true,
                customer: customer._id,
                lenderId: user.lenderId,
            })
                .sort('-createdAt')
                .limit(1);
            if (loans.length > 0) loanPayload.loanType = 'Top Up';

            let agent = null;
            if (user.role === 'Loan Agent') {
                agent = await userController.getOne(user.id, {
                    lenderId: user.lenderId,
                    segments: customer.employmentInfo.segment,
                });
            }
            console.log(customer)
            // If no agent was found and customer has no active loan, pick an agent at random.
            if ((!agent || agent.errorCode) && loans.length == 0) {
                agent = await pickRandomUser(
                    user.lenderId,
                    'Loan Agent',
                    customer.employmentInfo.segment
                );
            }

            // if no agent was found and customer has an active loan, use the agent on that loan.
            if ((!agent || agent.errorCode) && loans.length > 0)
                agent = await userController.getOne(loans[0].loanAgent);

            // TODO: review the http status code.
            // If no loan agent still. Fail.
            if (!agent)
                return {
                    errorCode: 424,
                    message: 'Failed to assign loan agent.',
                };

            // Assign a credit officer at random.
            const creditOfficer = await pickRandomUser(
                user.lenderId,
                'Credit',
                customer.employmentInfo.segment
            );
            if (!creditOfficer)
                return {
                    errorCode: 424,
                    message: 'Failed to assign credit officer.',
                };

            loanPayload.loanAgent = agent._id;
            loanPayload.customer = customer._id;
            loanPayload.lenderId = user.lenderId;
            loanPayload.netPay = customer.netPay.value;
            loanPayload.creditOfficer = creditOfficer._id;
            loanPayload.transferFee = loanParams.transferFee;
            loanPayload.interestRate = loanParams.interestRate;
            loanPayload.params = { dob: customer.dateOfBirth };
            loanPayload.params.minNetPay = loanParams.minNetPay;
            loanPayload.upfrontFeePercent = loanParams.upfrontFeePercent;
            loanPayload.params.dtiThreshold = loanParams.dtiThreshold;
            loanPayload.params.doe = customer.employmentInfo.dateOfEnlistment;

            // await customer.save();
            const newLoan = await Loan.create(loanPayload);

            return { customer, loan: newLoan };
        } catch (exception) {
            // TODO: log error
            // customerController.delete(customerPayload.employmentInfo.ippis);
            debug(exception);
            return { errorCode: 500, message: 'Something went wrong.'};
        }
    },

    getAll: async function (queryParams) {
        try {
            const loans = await Loan.find(queryParams)
                .populate({
                    path: 'customer',
                    model: Customer,
                    populate: [
                        {
                            path: 'employmentInfo.segment',
                            model: Segment,
                            select: '-_id code name',
                        },
                    ],
                })
                .sort('-createdAt');
            if (loans.length == 0)
                return { errorCode: 404, message: 'No loans found' };

            return loans;
        } catch (exception) {
            debug(exception);
            return exception;
        }
    },

    getOne: async function (queryParams) {
        try {
            const loan = await Loan.findOne(queryParams).populate({
                path: 'customer',
                model: Customer,
                populate: [
                    {
                        path: 'employmentInfo.segment',
                        model: Segment,
                        // select: '_id code name',
                    },
                ],
            });
            if (!loan) return { errorCode: 404, message: 'Loan not found' };

            return loan;
        } catch (exception) {
            debug(exception);
            return exception;
        }
    },

    edit: async function (user, loan, payload) {
        try {
            payload = convertToDotNotation(payload);

            // If not a credit user, create a pending edit.
            if (user.role !== 'Credit') {
                const result = await Loan.findOne({
                    _id: id,
                    lenderId: user.lenderId,
                });
                if (!result) throw new Error('Loan not found');

                const newPendingEdit = await PendingEditController.create(
                    user,
                    loan._id,
                    'Loan',
                    payload
                );
                if (!newPendingEdit.hasOwnProperty('errorCode')) {
                    debug(newPendingEdit);
                    return newPendingEdit;
                }

                return {
                    message: 'Submitted. Awaiting Review',
                    body: newPendingEdit,
                };
            }

            if (payload.hasOwnProperty('status'))
                loan = await updateLoanStatus(payload, loan);
            else {
                loan.set(payload);
            }
            
            await loan.save();

            return loan;
        } catch (exception) {
            debug(exception);
            return exception;
        }
    },

    getDisbursement: async function (user, queryParams) {
        try {
            let loans = [];
            if (user.role !== 'Loan Agent') {
                loans = await Loan.find(queryParams)
                    .select(
                        '_id customer recommendedAmount recommendedTenor interestRate repayment netPay upfrontFee transferFee netValue totalRepayment metrics.debtToIncomeRatio.value status createdAt dateApprovedOrDenied lenderId'
                    )
                    .populate({
                        path: 'customer',
                        model: Customer,
                        populate: [
                            {
                                path: 'employmentInfo.segment',
                                model: Segment,
                                select: '-_id code name',
                            },
                        ],
                        select: '-_id bvn employmentInfo.ippis accountInfo bank',
                    })
                    .sort('-createdAt');
            } else {
                queryParams.loanAgent = user.id;
                loans = await Loan.find(queryParams).sort('_id');
            }

            if (loans.length === 0)
                throw new Error('You have no pending disbursements');

            return loans;
        } catch (exception) {
            debug(exception);
            return exception;
        }
    },

    getLoanBooking: async function (queryParam) {
        try {
            const loans = await Loans.find(queryParam).select([
                'dateApprovedOrDenied',
                'status',
                'loanType',
                'recommendedAmount',
                'recommendedTenor',
                'interestRate',
                'Loan Agent',
                // 'bank', 'account number'
            ]);
            if (loans.length === 0) throw new Error('No loans found');

            return loans;
        } catch (exception) {
            debug(exception);
            return exception;
        }
    },

    closeExpiringLoans: async function () {
        try {
            // TODO: Convert time to UTC
            const today = new Date().toLocaleDateString();
            // const loans = await Loan.find( { active: true, maturityDate: {$gt: today} } );
            const loans = await Loan.updateMany(
                {
                    status: 'Approved',
                    active: true,
                    maturityDate: { $gte: today },
                },
                { status: 'Completed', active: false }
            );

            return loans;
        } catch (exception) {
            debug(exception);
            return exception;
        }
    },
};

module.exports = manager;
