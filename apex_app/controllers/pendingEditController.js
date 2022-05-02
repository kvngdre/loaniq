const res = require('express/lib/response');
const mongoose = require('mongoose');
const debug = require('debug')('pendingEditCtrl');
const PendingEdit = require('../models/pendingEditModel');
const convertToDotNotation = require('../utils/convertToDotNotation');

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
                {
                    $lookup: {
                        from: 'users',
                        localField: 'userId',
                        foreignField: '_id',
                        as: 'userData'
                    }
                },
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
                        customerData: 1,
                        userData: {name: 1}
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
                    {
                        $lookup: {
                            from: 'users',
                            localField: 'userId',
                            foreignField: '_id',
                            as: 'userData'
                        }
                    },
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
                            loanData: 1, 
                            userData: {name: 1}}
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
                // console.log(output1, mongoose.Types.ObjectId(user.id))
                // return output1
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
                {
                    $lookup: {
                        from: 'customers',
                        localField: 'documentId',
                        foreignField: '_id',
                        as: 'customerData'
                    }
                },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'userId',
                        foreignField: '_id',
                        as: 'userData'
                    }
                },
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
                        customerData: 1,
                        userData: {name: 1}
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
                    {
                        $lookup: {
                            from: 'users',
                            localField: 'userId',
                            foreignField: '_id',
                            as: 'userData'
                        }
                    },
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
                            loanData: 1, 
                            userData: {name: 1}}
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
            const editedDoc = await PendingEdit.findByOneAndUpdate({ _id: id, lenderId: user.lenderId }, requestBody, {new: true});
            if(!editedDoc) throw new Error('Document not found.');

            return editedDoc;

        }catch(exception) {
            debug(exception);
            return exception;
        }
    },

    deleteApproved: async function() {
        try{
            console.log('delete running');
            return 'jk'
            // const count = await PendingEdit.deleteMany({status: 'approved'});
        }catch(exception) {
            debug(exception);
            return exception;
        }
    }
}

module.exports = pendingEdit;