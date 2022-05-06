const mongoose = require('mongoose');
const Loan = require('../models/loanModel');
const debug = require('debug')('pendingEditCtrl');
const Customer = require('../models/customerModel');
const PendingEdit = require('../models/pendingEditModel');

const pendingEdit = {
    create: async function(user, documentId, type, alteration) {
        try{
            const newPendingEdit = new PendingEdit({
                lenderId: user.lenderId,
                userId: user.id,
                documentId,
                type,
                alteration
            });

            await newPendingEdit.save();
    
            return newPendingEdit;

        }catch(exception) {
            debug(exception);
            return exception;
        };
    },

    getAll: async function(user) {
        try{
            let result = await PendingEdit.aggregate([
                {
                    $lookup: {
                        from: 'customers',
                        localField: 'documentId',
                        foreignField: '_id',
                        as: 'customerData'
                    }
                },
                // {
                //     $lookup: {
                //         from: 'users',
                //         localField: 'userId',
                //         foreignField: '_id',
                //         as: 'userData'
                //     }
                // },
                {
                    $match: {
                        lenderId: user.lenderId,
                        status: 'pending',
                        type: 'customer'
                    }
                },
                {
                    $project: {
                        _id: 1,
                        lenderId: 1,
                        type: 1,
                        alteration: 1,
                        documentId: 1,
                        status: 1,
                        userId: 1,
                        // customerData: 1,
                        // userData: {name: 1}
                    }
                },
                {
                    $project: {
                        __v: 0, 
                        'customerData.createdAt': 0, 
                        'customerData.updatedAt': 0
                    }
                },
                ]).exec()

            
            if(user.role === 'credit') {
                const output = await PendingEdit.aggregate([
                    {
                        $lookup: {
                            from: 'loans',
                            localField: 'documentId',
                            foreignField: '_id',
                            as: 'loanData'
                        }
                    },
                    // {
                    //     $lookup: {
                    //         from: 'users',
                    //         localField: 'userId',
                    //         foreignField: '_id',
                    //         as: 'userData'
                    //     }
                    // },
                    {
                        $match: {
                            lenderId: user.lenderId, 
                            status: 'pending',
                            type: 'loan',
                            loanData: {$elemMatch: {creditOfficer: mongoose.Types.ObjectId(user.id)}}
                        }
                    },
                    {
                        $project: {
                            _id: 1,
                            lenderId: 1,
                            type: 1,
                            alteration: 1,
                            documentId: 1,
                            status: 1,
                            userId: 1,
                            // loanData: 1, 
                            // userData: {name: 1}
                        }
                    },
                    {
                        $project: {
                            __v: 0, 
                            'loanData.createdAt': 0, 
                            'loanData.updatedAt': 0
                        }
                    },
                    ]).exec()

                result.push(...output)
            }
            return result;
        }catch(exception) {
            debug(exception);
            return exception;
        };
    },

    getOne: async function(id, user) {
        try{
            let result = await PendingEdit.aggregate([
                // {
                //     $lookup: {
                //         from: 'customers',
                //         localField: 'documentId',
                //         foreignField: '_id',
                //         as: 'customerData'
                //     }
                // },
                // {
                //     $lookup: {
                //         from: 'users',
                //         localField: 'userId',
                //         foreignField: '_id',
                //         as: 'userData'
                //     }
                // },
                {
                    $match: {
                        _id: mongoose.Types.ObjectId(id),
                        lenderId: user.lenderId,
                        status: 'pending',
                        type: 'customer'
                    }
                },
                {
                    $project: {
                        _id: 1,
                        lenderId: 1,
                        type: 1,
                        alteration: 1,
                        documentId: 1,
                        status: 1,
                        userId: 1,
                        // customerData: 1,
                        // userData: {name: 1}
                    }
                },
                {
                    $project: {
                        __v: 0, 
                        'customerData.createdAt': 0, 
                        'customerData.updatedAt': 0
                    }
                },
                ]).exec()

            
            if(user.role === 'credit') {
                const output = await PendingEdit.aggregate([
                    {
                        $lookup: {
                            from: 'loans',
                            localField: 'documentId',
                            foreignField: '_id',
                            as: 'loanData'
                        }
                    },
                    // {
                    //     $lookup: {
                    //         from: 'users',
                    //         localField: 'userId',
                    //         foreignField: '_id',
                    //         as: 'userData'
                    //     }
                    // },
                    {
                        $match: {
                            _id: mongoose.Types.ObjectId(id),
                            lenderId: user.lenderId, 
                            status: 'pending',
                            type: 'loan',
                            loanData: {$elemMatch: {creditOfficer: mongoose.Types.ObjectId(user.id)}}
                        }
                    },
                    {
                        $project: {
                            _id: 1,
                            lenderId: 1,
                            type: 1,
                            alteration: 1,
                            documentId: 1,
                            status: 1,
                            userId: 1,
                            // loanData: 1, 
                            // userData: {name: 1}
                        }
                    },
                    {
                        $project: {
                            __v: 0, 
                            'loanData.createdAt': 0, 
                            'loanData.updatedAt': 0
                        }
                    },
                    ]).exec()

                result.push(...output)
            }
            return result;
        }catch(exception) {
            debug(exception);
            return exception;
        };
    },

    updateStatus: async function(id, user, requestBody) {
        try{
            const editedDoc = await PendingEdit.findOneAndUpdate({ _id: id, lenderId: user.lenderId, status: 'pending' }, requestBody, {new: true});
            if(!editedDoc) throw new Error('Document not found.');
            
            if(editedDoc.status === "approved") {
                if(editedDoc.type === 'customer') {
                    const customer = await Customer.findById(editedDoc.documentId);
                    
                    customer.set( editedDoc.alteration );
                    customer.save();
                }
                else {
                    await Loan.updateOne({ _id: editedDoc.documentId }, editedDoc.alteration );
                };
            }

            return editedDoc;

        }catch(exception) {
            debug(exception);
            return exception;
        }
    },

    deleteApproved: async function() {
        try{
                const count = await PendingEdit.deleteMany({status: 'approved'});
        }catch(exception) {
            debug(exception);
            return exception;
        };
    }
}

module.exports = pendingEdit;