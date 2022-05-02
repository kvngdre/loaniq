const mongoose = require('mongoose');
const Loan = require('../models/loanModel');
const Segment = require('../models/segmentModel');
const debug = require('debug')('app:customerContr');
const Customer = require('../models/customerModel');
const convertToDotNotation = require('../utils/convertToDotNotation');
const PendingEditController = require('../controllers/pendingEditController');

const customer = {
    getAll: async function(user, queryParam={}) {
        if(user.role !== 'loanAgent') {
            return await Customer.find(queryParam)
                                 .select('-createdAt -updatedAt -__v')
                                 .populate('employmentInfo.segment')
                                 .sort('_id');
        };

        return await Customer.find( { 'loanAgents.id': user.id } )
                             .select('-createdAt -updatedAt -__v')
                             .sort('_id');
    },

    get: async function(user, id) {
        try{
            if(user.role === 'loanAgent') {
                const customer = await Loan.findOne( { customer: id } )
                                           .populate({path: 'customer', model: Customer, populate:[{path: 'employmentInfo.segment', model: Segment, select: '-_id code'}], select: [
                                               'name', 
                                               'dateOfBirth',
                                               'netPay',
                                               'employmentInfo.ippis',
                                               'employmentInfo.segment',
                                               'employmentInfo.dateOfEnlistment'
                                            ]})
                                           .select('-_id customer')
                                        //    .select({'name': 1, 'dateOfBirth': 1, 'employmentInfo.ippis': 1, 'employmentInfo.segment': 1, 'employmentInfo.dateOfEnlistment': 1, 'netPay': 1 } );

                if(!customer) throw new Error('Customer not found.');

                return customer; 
            };

            const customer = await Customer.findOne( queryParam )
                                           .select( [ 'name.firstName', 'name.lastName', 'employmentInfo.ippis', 'employmentInfo.segment', 'netPay', 'loanAgent' ] );
                                      //    .select({'name': 1, 'dateOfBirth': 1, 'employmentInfo.ippis': 1, 'employmentInfo.segment': 1, 'employmentInfo.dateOfEnlistment': 1, 'netPay': 1 } );
            console.log(customer)
            if(!customer) {
                debug(customer?.message, customer?.stack);     
                throw new Error('Customer not found.');
            };
            
            return customer;

        }catch(exception) {
            return exception;
        };
    },

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

};

module.exports = customer;
