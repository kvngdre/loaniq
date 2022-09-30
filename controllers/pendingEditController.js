const Customer = require('../models/customerModel');
const debug = require('debug')('app:pendingEditCtrl');
const flattenObject = require('../utils/convertToDotNotation');
const Loan = require('../models/loan');
const logger = require('../utils/logger')('pendingEditCtrl.js');
const mongoose = require('mongoose');
const PendingEdit = require('../models/pendingEdit');
const ServerError = require('../errors/serverError');
const User = require('../models/user');

module.exports = {
    create: async function (user, payload) {
        try {
            const newPendingEdit = new PendingEdit({
                lenderId: user.lenderId,
                userId: user.id,
                docId: payload.docId,
                type: payload.type,
                modifiedBy: {
                    id: user.id,
                    name: user.fullName || user.id,
                    role: user.role,
                    timestamp: new Date(),
                },
                alteration: payload.alteration,
            });

            await newPendingEdit.save();

            return {
                message: 'Edit request submitted.',
                data: newPendingEdit,
            };
        } catch (exception) {
            logger.error({
                method: 'create',
                message: exception.message,
                meta: exception.stack,
            });
            debug(exception);

            // if exception is a validation error
            if (exception.name === 'ValidationError') {
                const field = Object.keys(exception.errors)[0];
                return new ServerError(400, exception.errors[field].message.replace('Path', ''));
            }
            return new ServerError(500, 'Something went wrong');
        }
    },

    getAll: async function (user) {
        try {
            const customerEdits = await PendingEdit.aggregate([
                {
                    $match: {
                        lenderId: user.lenderId,
                        userId: ['Admin', 'Operations'].includes(user.role)
                            ? { $ne: null }
                            : mongoose.Types.ObjectId(user.id),
                        type: 'Customer',
                    },
                },
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
                    $project: {
                        _id: 1,
                        lenderId: 1,
                        userId: 1,
                        docId: 1,
                        type: 1,
                        status: 1,
                        createdAt: 1,
                        updatedAt: 1,
                        alteration: 1,
                        state: {
                            $function: {
                                body: function (alteration, self) {
                                    const fieldsToProject = {};

                                    Object.keys(alteration).forEach(
                                        (key) =>
                                            (fieldsToProject[key] =
                                                self[0][key])
                                    );
                                    return fieldsToProject;
                                },
                                args: ['$alteration', '$customer'],
                                lang: 'js',
                            },
                        },
                        user: { name: 1, fullName: 1, displayName: 1, role: 1 },
                    },
                },
            ]).exec();

            let pipeline$Match = null;
            if (user.role === 'Credit') {
                // Fetch loans assigned to credit user for review.
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
                // Fetch all loans or loan edits created by the user.
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
            const loanEdits = await PendingEdit.aggregate([
                {
                    $lookup: {
                        from: 'loans',
                        localField: 'docId',
                        foreignField: '_id',
                        as: 'loan',
                    },
                },
                pipeline$Match,
                {
                    $lookup: {
                        from: 'users',
                        localField: 'userId',
                        foreignField: '_id',
                        as: 'user',
                    },
                },
                {
                    $project: {
                        _id: 1,
                        lenderId: 1,
                        userId: 1,
                        docId: 1,
                        type: 1,
                        status: 1,
                        createdAt: 1,
                        updatedAt: 1,
                        alteration: 1,
                        state: {
                            $function: {
                                body: function (alteration, self) {
                                    const fieldsToProject = {};

                                    Object.keys(alteration).forEach(
                                        (key) =>
                                            (fieldsToProject[key] =
                                                self[0][key])
                                    );

                                    return fieldsToProject;
                                },
                                args: ['$alteration', '$loan'],
                                lang: 'js',
                            },
                        },
                        user: { name: 1, fullName: 1, displayName: 1, role: 1 },
                    },
                },
            ]).exec();

            const pendingEdits = [...customerEdits, ...loanEdits];
            if (pendingEdits.length === 0)
                return { errorCode: 404, message: 'No pending edits.' };

            // sort in descending order
            pendingEdits.sort((a, b) => {
                if (a.createdAt > b.createdAt) return -1;
                if (a.createdAt < b.createdAt) return 1;
                return 0;
            });

            return {
                message: 'Success',
                data: pendingEdits,
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

    getOne: async function (id, user) {
        try {
            const pendingCustomerEdit = await PendingEdit.aggregate([
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
                        userId: ['Admin', 'Operations'].includes(user.role)
                            ? { $ne: null }
                            : mongoose.Types.ObjectId(user.id),
                        type: 'Customer',
                    },
                },
                {
                    $lookup: {
                        from: 'customers',
                        localField: 'docId',
                        foreignField: '_id',
                        as: 'customer',
                    },
                },
                {
                    $project: {
                        _id: 1,
                        lenderId: 1,
                        docId: 1,
                        userId: 1,
                        type: 1,
                        alteration: 1,
                        status: 1,
                        customer: 1,
                        state: {
                            $function: {
                                body: function (alteration, self) {
                                    const fieldsToProject = {};

                                    Object.keys(alteration).forEach(
                                        (key) =>
                                            (fieldsToProject[key] =
                                                self[0][key])
                                    );

                                    return fieldsToProject;
                                },
                                args: ['$alteration', '$customer'],
                                lang: 'js',
                            },
                        },
                        user: { name: 1, fullName: 1, displayName: 1, role: 1 },
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

                const loanEdit = await PendingEdit.aggregate([
                    {
                        $lookup: {
                            from: 'loans',
                            localField: 'docId',
                            foreignField: '_id',
                            as: 'loan',
                        },
                    },
                    Pipeline$MatchObject,
                    {
                        $lookup: {
                            from: 'users',
                            localField: 'userId',
                            foreignField: '_id',
                            as: 'user',
                        },
                    },
                    {
                        $project: {
                            _id: 1,
                            lenderId: 1,
                            userId: 1,
                            docId: 1,
                            type: 1,
                            alteration: 1,
                            status: 1,
                            loan: {
                                $function: {
                                    body: function (alteration, self) {
                                        const fieldsToProject = {};

                                        Object.keys(alteration).forEach(
                                            (key) =>
                                                (fieldsToProject[key] =
                                                    self[0][key])
                                        );

                                        return fieldsToProject;
                                    },
                                    args: ['$alteration', '$loan'],
                                    lang: 'js',
                                },
                            },
                            user: {
                                name: 1,
                                fullName: 1,
                                displayName: 1,
                                role: 1,
                            },
                        },
                    },
                ]).exec();

                return loanEdit;
            }

            return {
                message: 'Success',
                data: customerEdit,
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

    update: async function (id, user, payload) {
        try {
            const queryParams = { _id: id, userId: user.id };

            const pendingEdit = await PendingEdit.findOne(queryParams);
            if (!pendingEdit)
                return { errorCode: 404, message: 'Document not found.' };
            if (pendingEdit.status !== 'Pending')
                return {
                    errorCode: 403,
                    message: 'Cannot modify a reviewed document.',
                };

            payload = flattenObject(payload);

            // User role is loan agent
            if (user.role === 'Loan Agent') {
                pendingEdit.set(payload);
                pendingEdit.modifiedBy = {
                    id: user.id,
                    name: user.fullName,
                    role: user.role,
                    // timestamp: new Date(),
                };

                await pendingEdit.save();
                return {
                    message: 'Document updated.',
                    data: pendingEdit,
                };
            }

            if (payload.status === 'Approved') {
                if (pendingEdit.type === 'Customer') {
                    // TODO: call the controllers in case of error
                    const customer = await Customer.findById(pendingEdit.docId);

                    customer.set(pendingEdit.alteration);
                    await customer.save();
                } else {
                    const loan = await Loan.findById(pendingEdit.docId);
                    loan.set(pendingEdit.alteration);

                    await loan.save();
                }
            }
            pendingEdit.set(payload);
            return {
                message: 'Updated.',
                data: pendingEdit,
            };
        } catch (exception) {
            logger.error({
                method: 'update',
                message: exception.message,
                meta: exception.stack,
            });
            debug(exception);

            // Validation error
            if (exception.name === 'ValidationError') {
                const field = Object.keys(exception.errors)[0];
                exception.errors[field].message.replace('Path', '')
                const errorMessage = exception.errors[field].message.replace('modifiedBy', '')
                return {
                    errorCode: 400,
                    message: errorMessage,
                };
            }
            return { errorCode: 500, message: 'Something went wrong.' };
        }
    },

    delete: async function (id, user) {
        try {
            const queryParams = { _id: id, userId: user.id };

            const pendingEdit = await PendingEdit.findOne(queryParams);
            if (!pendingEdit)
                return { errorCode: 404, message: 'No document found.' };
            if (pendingEdit.status !== 'Pending')
                return {
                    errorCode: 403,
                    message: 'Cannot delete a reviewed document.',
                };

            await pendingEdit.delete();

            return {
                message: 'Document deleted.',
            };
        } catch (exception) {
            logger.error({
                method: 'delete',
                message: exception.message,
                meta: exception.stack,
            });
            debug(exception);
            return { errorCode: 500, message: 'Something went wrong.' };
        }
    },
};
