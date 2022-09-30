const _ = require('lodash');
const convertToDotNotation = require('../../utils/convertToDotNotation');
const Customer = require('../../models/customerModel');
const customerController = require('../../controllers/customerController');
const debug = require('debug')('app:loanMgr');
const Lender = require('../../models/lenderModel');
const Loan = require('../../models/loan');
const logger = require('../../utils/logger')('loanManager.js');
const Origin = require('../../models/origin');
const PendingEdit = require('../../models/pendingEdit');
const PendingEditController = require('../../controllers/pendingEditController');
const pickRandomUser = require('../../utils/pickRandomUser');
const Segment = require('../../models/segment');
const updateLoanStatus = require('../../utils/loanStatus');
const userController = require('../../controllers/userController');

const manager = {
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
                    user,
                    customerPayload
                );

                if (response.hasOwnProperty('errorCode')) {
                    logger.error({
                        method: 'createLoanReq',
                        message: 'Failed to create customer.',
                        meta: {
                            lenderId: user.lenderId,
                            response: response.message,
                            customer: customerPayload,
                        },
                    });
                    return response;
                }
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

            //
            loanPayload.lenderId = user.lenderId;
            loanPayload.customer = customer._id;
            if (!loanPayload.loanAgent) loanPayload.loanAgent = agent._id;
            if (!loanPayload.creditOfficer)
                loanPayload.creditOfficer = creditOfficer._id;

            // Setting loan metrics
            loanPayload.interestRate = loanParams.interestRate;
            loanPayload.upfrontFeePercent = loanParams.upfrontFeePercent;
            loanPayload.transferFee = loanParams.transferFee;

            // Setting parameters used to evaluate loan
            loanPayload.params = { dob: customer.dateOfBirth };
            loanPayload.params.doe = customer.employmentInfo.dateOfEnlistment;
            loanPayload.params.netPay = { value: customer.netPay };
            loanPayload.params.minNetPay = loanParams.minNetPay;
            loanPayload.params.maxDti = loanParams.maxDti;

            // await customer.save();
            const newLoan = await Loan.create(loanPayload);
            // TODO: charge customer
            await Lender.updateOne(
                { _id: user.lenderId },
                { $inc: { requestCount: 1 } }
            );

            return {
                message: 'Loan request submitted.',
                data: {
                    customer,
                    loan: newLoan,
                },
            };
        } catch (exception) {
            logger.error({
                method: 'createLoanRequest',
                message: exception.message,
                meta: exception.stack,
            });
            debug(exception);
            return { errorCode: 500, message: 'Something went wrong.' };
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
                            // select: '-_id code name',
                        },
                    ],
                })
                .sort('-createdAt');
            if (loans.length == 0)
                return { errorCode: 404, message: 'No loans found' };

            return {
                message: 'Success',
                data: loans,
            };
        } catch (exception) {
            logger.error({
                method: 'getAll',
                message: exception.message,
                meta: exception.stack,
            });
            debug(exception);
            return { errorCode: 500, message: 'Something went wrong.' };
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

            return {
                message: 'Success',
                data: loan,
            };
        } catch (exception) {
            logger.error({
                method: 'getOne',
                message: exception.message,
                meta: exception.stack,
            });
            debug(exception);
            return { errorCode: 500, message: 'Something went wrong.' };
        }
    },

    update: async function (user, loan, payload) {
        try {
            payload = convertToDotNotation(payload);

            // Reassignment of Loan agent or Credit officer.
            if (
                ['Lender', 'Admin'].includes(user.role) &&
                Object.keys(payload).some((path) =>
                    ['creditOfficer', 'loanAgent'].includes(path)
                )
            ) {
                if (payload.creditOfficer)
                    loan.set({ creditOfficer: payload.creditOfficer });
                if (payload.loanAgent)
                    loan.set({ loanAgent: payload.loanAgent });
                await loan.save();
            }

            // If not a Credit user, create a pending edit.
            if (user.role !== 'Credit') {
                const newPendingEdit = new PendingEdit({
                    lenderId: user.lenderId,
                    userId: user.id,
                    docId: loan._id,
                    type: 'Loan',
                    modifiedBy: {
                        id: user.id,
                        name: user.fullName,
                        role: user.role,
                        timestamp: new Date(),
                    },
                    alteration: payload,
                });

                await newPendingEdit.save();

                return {
                    message: 'Submitted. Awaiting review.',
                    body: newPendingEdit,
                };
            }

            if (payload.status) loan = await updateLoanStatus(payload, loan);
            else {
                loan.set(payload);
            }

            await loan.save();

            return {
                message: 'Loan Updated.',
                data: loan,
            };
        } catch (exception) {
            logger.error({
                method: 'update',
                message: exception.message,
                meta: exception.stack,
            });
            debug(exception);

            // MongoDB Validation Error
            if (exception.name === 'ValidationError') {
                const field = Object.keys(exception.errors)[0];
                return {
                    errorCode: 400,
                    message: exception.errors[field].message.replace(
                        'Path',
                        ''
                    ),
                };
            }

            return { errorCode: 500, message: 'Something went wrong.' };
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
            logger.error({ message: exception.message, meta: exception.stack });
            debug(exception);
            return { errorCode: 500, message: 'Something went wrong.' };
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
            logger.error({ message: exception.message, meta: exception.stack });
            debug(exception);
            return { errorCode: 500, message: 'Something went wrong.' };
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
            logger.error({ message: exception.message, meta: exception.stack });
            debug(exception);
            return { errorCode: 500, message: 'Something went wrong.' };
        }
    },
};

module.exports = manager;
