const _ = require('lodash');
const mongoose = require('mongoose');
const Loan = require('../models/loanModel');
const State = require('../models/stateModel');
const Segment = require('../models/segmentModel');
const debug = require('debug')('app:customerCtrl');
const Customer = require('../models/customerModel');
const convertToDotNotation = require('../utils/convertToDotNotation');
const PendingEditController = require('../controllers/pendingEditController');


const customerCtrlFuncs = {
    create: async function(request) {
        try{
            // TODO: should the net pay be read at time of creation?
            const customerExists = await Customer.findOne( { 'employmentInfo.ippis': request.body.employmentInfo.ippis } );
            if(customerExists) throw new Error('Duplicate IPPIS NO. Customer already exists');
            // TODO: uncomment this later
            // request.body.passport.path = request.file.passport[0].path;
            // request.body.passport.originalName = request.file.passport[0].originalname;

            // request.body.idCard.path = request.file.idCard[0].path;
            // request.body.passport.originalName = request.file.idCard[0].originalname;

            const newCustomer = new Customer(request.body);
            if(newCustomer instanceof Error) throw(newCustomer.message);
            
            // newCustomer.validateSegment();
            
            await newCustomer.save();

            return newCustomer;

        }catch(exception) {
            debug(exception)
            if(exception.code===11000) {
                const baseString = "Error: Duplicate "
                let field = Object.keys(exception.keyPattern)[0]
                if(field === 'phone') field = 'phone number';
    
                return baseString + field;
            };
            return exception;
        };
    },
    
    getAll: async function(user, requestBody) {
        try{
            let customers = [];
            
            if(user.role === 'Loan Agent') {
                customers = await Loan.find( { loanAgent: user.id } )
                                 .populate({path: 'customer', model: Customer, populate:[{path: 'employmentInfo.segment', model: Segment, select: '-_id code'}, {path: 'employmentInfo.state', model: State}], select: [
                                     'name', 
                                     'dateOfBirth',
                                     'netPay',
                                     'employmentInfo.ippis',
                                     'employmentInfo.segment',
                                     'employmentInfo.dateOfEnlistment'
                                 ]})
                                 .select('-_id customer')
                                //  .distinct('customer')

                // customers = await Loan.aggregate([
                //     {
                //         $match: {
                //             lenderId: mongoose.Types.ObjectId(user.lenderId),
                //             loanAgent: mongoose.Types.ObjectId(user.id)
                //         }
                //     },
                //     {
                //         $group: {
                //             _id: "$customer"
                //         }
                //     },
                //     // {
                //     //     $lookup:{
                //     //         from: 'customers',
                //     //         localField: '_id',
                //     //         foreignField: '_id',
                //     //         as: 'customerData'
                //     //     }
                //     // },
                //     // {
                //     //     $project:{
                //     //         customerData: {createdAt: 0, updatedAt: 0, __v: 0}
                //     //     }
                //     // },
                //     // {
                //     //     $project:{
                //     //         customerData: {name: 1, dateOfBirth: 1, 'employmentInfo.ippis': 1}
                //     //     }
                //     // }
                // ]).exec()

            }else{
                let queryParams = _.omit(requestBody, ['start', 'end', 'segments', 'netPay', 'name']);
                
                if(requestBody.state) queryParams['residentialAddress.state'] = requestBody.state
                if(requestBody.netPay) queryParams['netPay.value'] = { $gte: requestBody.netPay }
                if(requestBody.segments) queryParams['employmentInfo.segment'] = { $in: requestBody.segments }
                if(requestBody.start) queryParams.createdAt = { $gte: requestBody.start, $lte: (requestBody.end ? requestBody.end : "2122-01-01") }

                customers = await Customer.find( queryParams )
                                          .select('-__v')
                                          .populate('employmentInfo.segment')
                                          .sort('-createdAt');
            };

            if(customers.length == 0) throw new Error('No customers found');
                
            return customers;
            
        }catch(exception) {
            debug(exception);
            return exception;
        }
    },

    getOne: async function(id) {
        try{
            const queryParam = mongoose.isValidObjectId(id) ? { _id: id } : { 'employmentInfo.ippis': id };

            const customer = await Customer.findOne( queryParam )
                                        //    .select([
                                        //        'name.firstName', 
                                        //        'name.lastName', 
                                        //        'dateOfBirth', 
                                        //        'employmentInfo.ippis', 
                                        //        'employmentInfo.segment', 
                                        //        'employmentInfo.dateOfEnlistment', 
                                        //        'netPay' ] );
            
            if(!customer) throw new Error('Customer not found');
            
            return customer;

        }catch(exception) {
            debug(exception)
            return exception;
        };
    },

    update: async function(customerId, user, requestBody) {
        try{
            requestBody = convertToDotNotation(requestBody);

            const customer = await Customer.findById(customerId)
            if(!customer) throw new Error('Customer not found');
            
            if(user.role !== 'Admin') {
                const newPendingEdit = await PendingEditController.create(user, customerId, 'customer', requestBody);
                if(!newPendingEdit || newPendingEdit instanceof Error) {
                    debug(newPendingEdit);
                    throw newPendingEdit;
                };

                return {
                    message: 'Submitted. Awaiting Review.',
                    alteration: newPendingEdit
                };
            };            
            
            customer.set(requestBody);
            await customer.save();

            return {
                message: 'Customer profile updated',
                editedDoc: customer
            };
            
        }catch(exception) {
            debug(exception)
            return exception;
        }
    },

    fetchCustomerCreation: async function(user, fromDate) {
        try{
            const result = await Loan.aggregate([
                {
                    $match: {
                        // TODO: Change status to approved
                        lenderId: mongoose.Types.ObjectId(user.lenderId),
                        status: 'pending',
                        createdAt: { $gte: new Date(fromDate) }
                    }
                },
                {
                    $group: {
                        _id: "$customer"
                    }
                },
                {
                    $lookup:{
                        from: 'customers',
                        localField: '_id',
                        foreignField: '_id',
                        as: 'customerData'
                    }
                },
                {
                    $project: {
                        customerData: {
                            name: 1, 
                            gender: 1, 
                            dateOfBirth: 1,
                            'residentialAddress.street': 1,
                            maritalStatus: 1,
                            'contact.phone': 1,
                            bvn: 1,
                            idCardInfo: 1,
                            employmentInfo: 1,
                            nok: 1,
                            accountInfo: 1
                        }
                    }
                }
            ]).exec();
            if(result.length === 0) throw new Error('No customers match filter.');
            // TODO: improved on this message.

            return result;

        }catch(exception) {
            debug(exception);
            return exception;
        }
    }
};

module.exports = customerCtrlFuncs;