const mongoose = require('mongoose');
const Loan = require('../models/loanModel');
const Segment = require('../models/segmentModel');
const debug = require('debug')('app:customerContr');
const Customer = require('../models/customerModel');
const convertToDotNotation = require('../utils/convertToDotNotation');
const PendingEditController = require('../controllers/pendingEditController');

const customer = {
    create: async function(request) {
        try{
            const customerExists = await Customer.findOne( { 'employmentInfo.ippis': request.body.employmentInfo.ippis } );
            if(customerExists) throw new Error('Duplicate IPPIS NO. Customer already exists');

            const newCustomer = new Customer(request.body);
            if(newCustomer instanceof Error) throw(newCustomer.message);
            
            newCustomer.validateSegment();
            
            await newCustomer.save();                                                                                                                                                                                                                                                                                                                                                                     

            return newCustomer;

        }catch(exception) {
            debug(exception);
            return exception;
        };
    },
    
    getAll: async function(user, queryParam={}) {
        if(user.role === 'loanAgent') {
            // return await Loan.find( { loanAgent: user.id } )
            //                  .populate({path: 'customer', model: Customer, populate:[{path: 'employmentInfo.segment', model: Segment, select: '-_id code'}], select: [
            //                      'name', 
            //                      'dateOfBirth',
            //                      'netPay',
            //                      'employmentInfo.ippis',
            //                      'employmentInfo.segment',
            //                      'employmentInfo.dateOfEnlistment'
            //                  ]})
            //                  .select('-_id customer')
            //                 //  .distinct('customer')
            const result = await Loan.aggregate([
                {
                    $match: {
                        lenderId: mongoose.Types.ObjectId(user.lenderId),
                        loanAgent: mongoose.Types.ObjectId(user.id)
                    }
                },
                {
                    $group: {
                        _id: "$customer"
                    }
                },
                // {
                //     $lookup:{
                //         from: 'customers',
                //         localField: '_id',
                //         foreignField: '_id',
                //         as: 'customerData'
                //     }
                // },
                // {
                //     $project:{
                //         customerData: {createdAt: 0, updatedAt: 0, __v: 0}
                //     }
                // },
                // {
                //     $project:{
                //         customerData: {name: 1, dateOfBirth: 1, 'employmentInfo.ippis': 1}
                //     }
                // }
            ]).exec()

            return result
                             
        };
        
        return await Customer.find(queryParam)
                             .select('-createdAt -updatedAt -__v')
                            //  .populate('employmentInfo.segment')
                             .sort('_id');
    },

    get: async function(queryParam) {
        try{
            const customer = await Customer.findOne(queryParam)
                                        //    .select([
                                        //        'name.firstName', 
                                        //        'name.lastName', 
                                        //        'dateOfBirth', 
                                        //        'employmentInfo.ippis', 
                                        //        'employmentInfo.segment', 
                                        //        'employmentInfo.dateOfEnlistment', 
                                        //        'netPay' ] );
                                      //    .select({'name': 1, 'dateOfBirth': 1, 'employmentInfo.ippis': 1, 'employmentInfo.segment': 1, 'employmentInfo.dateOfEnlistment': 1, 'netPay': 1 } );
            
            if(!customer) throw new Error('Customer not found.');
            
            return customer;

        }catch(exception) {
            debug(exception.stack, exception.message);
            return exception;
        };
    },

    update: async function(customerId, user, requestBody) {
        try{
            requestBody = convertToDotNotation(requestBody);

            const customer = await Customer.findById(customerId);
            if(!customer) {
                debug(customer);
                throw new Error('Customer not found.');
            }; 
            
            if(user.role === 'loanAgent') {
                const newPendingEdit = await PendingEditController.create(user, customerId, 'customer', requestBody);
                if(!newPendingEdit || newPendingEdit instanceof Error) {
                    debug(newPendingEdit);
                    throw newPendingEdit;
                }

                return {
                    message: 'Submitted. Awaiting Review.',
                    alteration: newPendingEdit
                }
            };            
            
            customer.set(requestBody);
            await customer.save();

            return customer;
            
        }catch(exception) {
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

module.exports = customer;
