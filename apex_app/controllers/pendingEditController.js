const mongoose = require('mongoose');
const Loan = require('../models/loanModel');
const debug = require('debug')('pendingEditCtrl');
const Customer = require('../models/customerModel');
const PendingEdit = require('../models/pendingEditModel');

const pendingEdit = {
    create: async function(user, documentId, type, alteration) {
        try{
            // consider if admins should be allowed to create pending edits.
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

    getAllEdits: async function() {
        try{
            const allPendingEdits = await PendingEdit.find({});
            if(allPendingEdits.length === 0) throw new Error('No pending edits');

            return allPendingEdits;

        }catch(exception) {
            debug(exception);
            return exception;
        }
    },

    getAll: async function(user) {
        try{
            const pendingCustomerEdits = await PendingEdit.aggregate([
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
                        lenderId: user.lenderId,
                        userId: user.role === 'admin' ? { $ne: null } : mongoose.Types.ObjectId(user.id),
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
                {
                    $sort: {
                        createdAt: -1
                    }
                }
            ]).exec()

            
            let pipeline$MatchObject;
            if(user.role === 'credit') {
                pipeline$MatchObject = {
                    $match: {
                        lenderId: user.lenderId,
                        type: 'loan',
                        loanData: {$elemMatch: {creditOfficer: mongoose.Types.ObjectId(user.id)}}
                    }
                }

            }else{
                pipeline$MatchObject = {
                    $match: {
                        lenderId: user.lenderId,
                        userId: user.role === 'admin' ? { $ne: null } : mongoose.Types.ObjectId(user.id),
                        type: 'loan',
                    }
                }
            };

            // Aggregation pipeline for fetching pending loan edits.
            const PendingLoanEdits = await PendingEdit.aggregate([
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
                pipeline$MatchObject,
                {
                    $project: {
                        _id: 1,
                        lenderId: 1,
                        type: 1,
                        alteration: 1,
                        documentId: 1,
                        status: 1,
                        userId: 1,
                        createdAt: 1
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
                {
                    $sort: {
                        createdAt: -1
                    }
                }
            ]).exec()

            console.log(PendingLoanEdits)

            const pendingEdits = [...pendingCustomerEdits, ...PendingLoanEdits];

        return pendingEdits;

        }catch(exception) {
            debug(exception);
            return exception;
        };
    },

    getOne: async function(id, user) {
        try{
            const pendingCustomerEdit = await PendingEdit.aggregate([
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
                        userId: user.role === 'admin' ? { $ne: null } : mongoose.Types.ObjectId(user.id),
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


            if(pendingCustomerEdit.length === 0) {

                let Pipeline$MatchObject;
                if(user.role === 'credit') {
                    Pipeline$MatchObject = {
                        $match: {
                            _id: mongoose.Types.ObjectId(id),
                            lenderId: user.lenderId, 
                            status: 'pending',
                            type: 'loan',
                            loanData: {$elemMatch: {creditOfficer: mongoose.Types.ObjectId(user.id)}}
                        }
                    }
                }else{
                    Pipeline$MatchObject = {
                        $match: {
                            _id: mongoose.Types.ObjectId(id),
                            lenderId: user.lenderId,
                            userId: user.role === 'admin' ? { $ne: null } : mongoose.Types.ObjectId(user.id),
                            status: 'pending',
                            type: 'loan',
                        }
                    }
                };
                
                const pendingLoanEdit = await PendingEdit.aggregate([
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
                    Pipeline$MatchObject,
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

                return pendingLoanEdit;
            }

            return pendingCustomerEdit;

        }catch(exception) {
            debug(exception);
            return exception;
        };
    },

    updateStatus: async function(id, user, requestBody) {
        try{
            const editedDoc = await PendingEdit.findOneAndUpdate(
                { _id: id, lenderId: user.lenderId, status: 'pending' }, 
                requestBody, 
                { new: true }
            );
            if(!editedDoc) throw new Error('Document not found');
            
            if(editedDoc.status === "approved") {
                if(editedDoc.type === 'customer') {
                    const customer = await Customer.findById(editedDoc.documentId);
                    
                    customer.set( editedDoc.alteration );
                    await customer.save();
                }
                else {
                    await Loan.updateOne({ _id: editedDoc.documentId }, editedDoc.alteration );
                };
            };

            return editedDoc;

        }catch(exception) {
            debug(exception);
            return exception;
        };
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