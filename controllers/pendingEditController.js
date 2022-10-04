const { roles } = require('../utils/constants');
const Customer = require('../models/customerModel');
const debug = require('debug')('app:pendingEditCtrl');
const flattenObject = require('../utils/flattenObj');
const Loan = require('../models/loanModel');
const logger = require('../utils/logger')('pendingEditCtrl.js');
const mongoose = require('mongoose');
const PendingEdit = require('../models/pendingEditModel');
const ServerError = require('../errors/serverError');
const User = require('../models/userModel');

module.exports = {
    create: async function (user, payload) {
        try {
            const newPendingEdit = new PendingEdit({
                lenderId: user.lenderId,
                docId: payload.docId,
                type: payload.type,
                createdBy: user.id,
                modifiedBy: user.id,
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
                return new ServerError(
                    400,
                    exception.errors[field].message.replace('Path', '')
                );
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
                        createdBy: ![roles.agent, roles.credit].includes(
                            user.role
                        )
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
                        localField: 'createdBy',
                        foreignField: '_id',
                        as: 'createdBy',
                    },
                },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'modifiedBy',
                        foreignField: '_id',
                        as: 'modifiedBy',
                    },
                },
                {
                    $project: {
                        _id: 1,
                        lenderId: 1,
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
                        createdBy: { fullName: 1, jobTitle: 1, role: 1 },
                        modifiedBy: { fullName: 1, jobTitle: 1, role: 1 },
                    },
                },
            ]).exec();

            let pipeline$Match = null;
            if (user.role === 'Credit') {
                // Fetch loans assigned to credit user.
                pipeline$Match = {
                    $match: {
                        lenderId: user.lenderId,
                        type: 'Loan',
                        loan: {
                            $elemMatch: {
                                creditUser: mongoose.Types.ObjectId(user.id),
                            },
                        },
                    },
                };
            } else {
                // Fetch all loans or loan edits created by the user.
                pipeline$Match = {
                    $match: {
                        lenderId: user.lenderId,
                        createdBy: ![roles.agent, roles.operations].includes(
                            user.role
                        )
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
                        localField: 'createdBy',
                        foreignField: '_id',
                        as: 'createdBy',
                    },
                },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'modifiedBy',
                        foreignField: '_id',
                        as: 'modifiedBy',
                    },
                },
                {
                    $project: {
                        _id: 1,
                        lenderId: 1,
                        createdBy: 1,
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
                        createdBy: { fullName: 1, jobTitle: 1, role: 1 },
                        modifiedBy: { fullName: 1, jobTitle: 1, role: 1 },
                    },
                },
            ]).exec();

            const pendingEdits = [...customerEdits, ...loanEdits];
            if (pendingEdits.length === 0)
                return new ServerError(404, 'No pending edits');

            // sort in descending order by createdAt field
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
                method: 'get_all',
                message: exception.message,
                meta: exception.stack,
            });
            debug(exception);
            return new ServerError(500, 'Something went wrong');
        }
    },

    getOne: async function (id, user) {
        try {
            const customerEdit = await PendingEdit.aggregate([
                {
                    $lookup: {
                        from: 'users',
                        localField: 'createdBy',
                        foreignField: '_id',
                        as: 'createdBy',
                    },
                },
                {
                    $match: {
                        _id: mongoose.Types.ObjectId(id),
                        lenderId: user.lenderId,
                        createdBy: ![roles.agent, roles.credit].includes(
                            user.role
                        )
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
                        localField: 'modifiedBy',
                        foreignField: '_id',
                        as: 'modifiedBy',
                    },
                },
                {
                    $project: {
                        _id: 1,
                        lenderId: 1,
                        docId: 1,
                        createdBy: 1,
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
                        createdBy: { fullName: 1, jobTitle: 1, role: 1 },
                        modifiedBy: { fullName: 1, jobTitle: 1, role: 1 },
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
                            loan: {
                                $elemMatch: {
                                    creditUser: mongoose.Types.ObjectId(
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
                            createdBy: ![
                                roles.agent,
                                roles.operations,
                            ].includes(user.role)
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
                            createdBy: { fullName: 1, jobTitle: 1, role: 1 },
                            modifiedBy: { fullName: 1, jobTitle: 1, role: 1 },
                        },
                    },
                ]).exec();

                return {
                    message: 'success',
                    data: loanEdit,
                };
            }

            return {
                message: 'success',
                data: customerEdit,
            };
        } catch (exception) {
            logger.error({
                method: 'get_one',
                message: exception.message,
                meta: exception.stack,
            });
            debug(exception);
            return new ServerError(500, 'Something went wrong');
        }
    },

    update: async function (id, user, payload) {
        try {
            const queryParams = ![roles.credit, roles.operations].includes(
                user.role
            )
                ? { _id: id, createdBy: user.id }
                : { _id: id };

            const foundEditRequest = await PendingEdit.findOne(queryParams);
            if (!foundEditRequest)
                return new ServerError(404, 'Edit request not found');
            if (foundEditRequest.status !== 'Pending')
                return new ServerError(403, 'Cannot perform update operation');

            payload = flattenObject(payload);

            // User role is loan agent
            if (user.role === 'Loan Agent') {
                foundEditRequest.set(payload);
                foundEditRequest.modifiedBy = user.id;

                await foundEditRequest.save();
                return {
                    message: 'Request has been updated',
                    data: foundEditRequest,
                };
            }

            if (payload.status === 'Approved') {
                if (foundEditRequest.type === 'Customer') {
                    // TODO: call the controllers in case of error
                    const foundCustomer = await Customer.findById(
                        foundEditRequest.docId
                    );
                    if (!foundCustomer)
                        return new ServerError(
                            404,
                            'Operation failed. Customer not found.'
                        );

                    foundCustomer.set(foundEditRequest.alteration);
                    await foundCustomer.save();
                } else {
                    const foundLoan = await Loan.findById(
                        foundEditRequest.docId
                    );
                    if (!foundLoan)
                        return new ServerError(
                            404,
                            'Operation failed. Loan not found.'
                        );

                    foundLoan.set(foundEditRequest.alteration);
                    await foundLoan.save();
                }
            }
            foundEditRequest.set(payload);
            return {
                message: 'Request has been pdated.',
                data: foundEditRequest,
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
                exception.errors[field].message.replace('Path', '');
                const errorMessage = exception.errors[field].message.replace(
                    'modifiedBy',
                    ''
                );
                return new ServerError(400, errorMessage);
            }
            return new ServerError(500, 'Something went wrong');
        }
    },

    delete: async function (id, user) {
        try {
            const queryParams = ![roles.credit, roles.operations].includes(
                user.role
            )
                ? { _id: id, createdBy: user.id }
                : { _id: id };

            const foundPendingEdit = await PendingEdit.findOne(queryParams);
            if (!foundPendingEdit)
                return new ServerError(404, 'Edit request not found');
            if (foundPendingEdit.status !== 'Pending')
                return new ServerError(403, 'Cannot perform delete operation');

            await foundPendingEdit.delete();

            return {
                message: 'Document deleted.',
                data: foundPendingEdit,
            };
        } catch (exception) {
            logger.error({
                method: 'delete',
                message: exception.message,
                meta: exception.stack,
            });
            debug(exception);
            return new ServerError(500, 'Something went wrong');
        }
    },
};
