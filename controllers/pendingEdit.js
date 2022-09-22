const mongoose = require('mongoose');
const Loan = require('../models/loan');
const Customer = require('../models/customer');
const PendingEdit = require('../models/pendingEdit');
const debug = require('debug')('app:pendingEditCtrl');
const logger = require('../utils/logger')('pendingEditCtrl.js');

const ctrlFuncs = {
    create: async function (user, payload) {
        try {
            const pendingEdit = new PendingEdit({
                lenderId: user.lenderId,
                userId: user.id,
                docId: payload.docId,
                type: payload.type,
                alteration: payload.alteration,
            });

            await pendingEdit.save();

            return {
                message: 'Pending edit created.',
                data: pendingEdit,
            };
        } catch (exception) {
            logger.error({ message: exception.message, meta: exception.stack });
            debug(exception);
            return { errorCode: 500, message: 'Something went wrong.' };
        }
    },

    getAllAdmin: async function () {
        try {
            const allPendingEdits = await PendingEdit.find({});
            if (allPendingEdits.length == 0)
                return { errorCode: 404, message: 'No pending edits.' };

            return {
                message: 'Success',
                data: allPendingEdits
            };
        } catch (exception) {
            logger.error({ message: exception.message, meta: exception.stack });
            debug(exception);
            return { errorCode: 500, message: 'Something went wrong.' };
        }
    },

    getAll: async function (user) {
        try {
            const pendingCustomerEdits = await PendingEdit.aggregate([
                {
                    $lookup: {
                        from: 'customers',
                        localField: 'docId',
                        foreignField: '_id',
                        as: 'customer'
                    }
                },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'userId',
                        foreignField: '_id',
                        as: 'user',
                    },
                },
                {
                    $match: {
                        lenderId: user.lenderId,
                        userId:
                            user.role === 'Admin'
                                ? { $ne: null }
                                : mongoose.Types.ObjectId(user.id),
                        type: 'Customer',
                    },
                },
                {
                    $project: {
                        _id: 1,
                        lenderId: 1,
                        docId: 1,
                        type: 1,
                        alteration: 1,
                        status: 1,
                        userId: 1,
                        customer: 1,
                        // userData: { displayName: 1 },
                        userData: 1,
                    },
                },
                {
                    $project: {
                        __v: 0,
                        'customer.createdAt': 0,
                        'customer.updatedAt': 0,
                    },
                },
                {
                    $sort: {
                        createdAt: -1,
                    },
                },
            ]).exec();

            let pipeline$Match = null;
            if (user.role === 'Credit') {
                pipeline$Match = {
                    $match: {
                        lenderId: user.lenderId,
                        type: 'Loan',
                        loan: {
                            $elemMatch: {
                                creditOfficer: mongoose.Types.ObjectId(user.id),
                            },
                        },
                    },
                };
            } else {
                pipeline$Match = {
                    $match: {
                        lenderId: user.lenderId,
                        userId:
                            user.role === 'Admin'
                                ? { $ne: null }
                                : mongoose.Types.ObjectId(user.id),
                        type: 'Loan',
                    },
                };
            }

            // Aggregation pipeline for fetching pending loan edits.
            const PendingLoanEdits = await PendingEdit.aggregate([
                {
                    $lookup: {
                        from: 'loans',
                        localField: 'docId',
                        foreignField: '_id',
                        as: 'loan',
                    },
                },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'userId',
                        foreignField: '_id',
                        as: 'user',
                    },
                },
                pipeline$Match,
                {
                    $project: {
                        _id: 1,
                        lenderId: 1,
                        type: 1,
                        alteration: 1,
                        documentId: 1,
                        status: 1,
                        userId: 1,
                        createdAt: 1,
                        loan: 1,
                        userData: { displayName: 1 },
                    },
                },
                {
                    $project: {
                        __v: 0,
                        'loanData.createdAt': 0,
                        'loanData.updatedAt': 0,
                    },
                },
                {
                    $sort: {
                        createdAt: -1,
                    },
                },
            ]).exec();

            const pendingEdits = [...pendingCustomerEdits, ...PendingLoanEdits];
            if (pendingEdits.length == 0)
                return { errorCode: 404, message: 'No pending edits.' };

            return {
                message: 'Success',
                data: pendingEdits
            };
        } catch (exception) {
            logger.error({ message: exception.message, meta: exception.stack });
            debug(exception);
            return { errorCode: 500, message: 'Something went wrong.' };
        }
    },

    getOne: async function (id, user) {
        try {
            const pendingCustomerEdit = await PendingEdit.aggregate([
                {
                    $lookup: {
                        from: 'customers',
                        localField: 'docId',
                        foreignField: '_id',
                        as: 'customer',
                    },
                },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'userId',
                        foreignField: '_id',
                        as: 'user',
                    },
                },
                {
                    $match: {
                        _id: mongoose.Types.ObjectId(id),
                        lenderId: user.lenderId,
                        userId:
                            user.role === 'Admin'
                                ? { $ne: null }
                                : mongoose.Types.ObjectId(user.id),
                        type: 'Customer',
                    },
                },
                {
                    $project: {
                        _id: 1,
                        lenderId: 1,
                        userId: 1,
                        type: 1,
                        alteration: 1,
                        docId: 1,
                        status: 1,
                        customer: 1,
                        // userData: { displayName: 1 },
                        userData: 1,
                    },
                },
                {
                    $project: {
                        __v: 0,
                        'customerData.createdAt': 0,
                        'customerData.updatedAt': 0,
                    },
                },
            ]).exec();

            if (pendingCustomerEdit.length === 0) {
                let Pipeline$MatchObject;
                if (user.role === 'Credit') {
                    Pipeline$MatchObject = {
                        $match: {
                            _id: mongoose.Types.ObjectId(id),
                            lenderId: user.lenderId,
                            status: 'Pending',
                            type: 'Loan',
                            loanData: {
                                $elemMatch: {
                                    creditOfficer: mongoose.Types.ObjectId(
                                        user.id
                                    ),
                                },
                            },
                        },
                    };
                } else {
                    Pipeline$MatchObject = {
                        $match: {
                            _id: mongoose.Types.ObjectId(id),
                            lenderId: user.lenderId,
                            userId:
                                user.role === 'Admin'
                                    ? { $ne: null }
                                    : mongoose.Types.ObjectId(user.id),
                            status: 'Pending',
                            type: 'Loan',
                        },
                    };
                }

                const pendingLoanEdit = await PendingEdit.aggregate([
                    {
                        $lookup: {
                            from: 'loans',
                            localField: 'docId',
                            foreignField: '_id',
                            as: 'loan',
                        },
                    },
                    {
                        $lookup: {
                            from: 'users',
                            localField: 'userId',
                            foreignField: '_id',
                            as: 'user',
                        },
                    },
                    Pipeline$MatchObject,
                    {
                        $project: {
                            _id: 1,
                            lenderId: 1,
                            type: 1,
                            alteration: 1,
                            docId: 1,
                            status: 1,
                            userId: 1,
                            loan: 1,
                            // userData: { displayName: 1 },
                            user: 1,
                        },
                    },
                    {
                        $project: {
                            __v: 0,
                            'loanData.createdAt': 0,
                            'loanData.updatedAt': 0,
                        },
                    },
                ]).exec();

                return pendingLoanEdit;
            }

            return {
                message: 'Success',
                data: pendingCustomerEdit
            };
        } catch (exception) {
            logger.error({ message: exception.message, meta: exception.stack });
            debug(exception);
            return { errorCode: 500, message: 'Something went wrong.' };
        }
    },

    updateStatus: async function (id, user, payload) {
        try {
            const doc = await PendingEdit.findOneAndUpdate(
                { _id: id, lenderId: user.lenderId, status: 'Pending' },
                payload,
                { new: true }
            );
            if (!doc)
                return { errorCode: 404, message: 'Document not found.' };

            if (doc.status === 'Approved') {
                if (doc.type === 'Customer') {
                    const customer = await Customer.findById(
                        doc.docId
                    );

                    customer.set(doc.alteration);
                    await customer.save();
                } else {
                    await Loan.updateOne(
                        { _id: doc.docId },
                        doc.alteration
                    );
                }
            }

            return {
                message: 'Updated.',
                data: doc
            };
        } catch (exception) {
            logger.error({ message: exception.message, meta: exception.stack });
            debug(exception);
            return { errorCode: 500, message: 'Something went wrong.' };
        }
    },

    deleteApproved: async function () {
        try {
            const count = await PendingEdit.deleteMany({ status: 'Approved' });
        } catch (exception) {
            logger.error({ message: exception.message, meta: exception.stack });
            debug(exception);
            return { errorCode: 500, message: 'Something went wrong.' };
        }
    },
};

module.exports = ctrlFuncs;
