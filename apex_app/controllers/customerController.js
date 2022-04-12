const debug = require('debug')('app:customerContr');
const ObjectId = require('mongoose').Types.ObjectId;
const Customer = require('../models/customerModel');
const User = require('../models/userModel');
const pickRandomAgent = require('../utils/pickRandomAgent');

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

    get: async function(user, queryParam) {
        try{
            if(user.role !== 'loanAgent') {
                const customer = await Customer.findOne( queryParam )
                                               .select({'name': 1, 'dateOfBirth': 1, 'employmentInfo.ippis': 1, 'employmentInfo.segment': 1, 'employmentInfo.dateOfEnlistment': 1, 'netPay': 1 } );

                if(!customer) throw new Error('Customer not found.');

                return customer; 
            };

            const customer = await Customer.findOne( ObjectId.isValid(id) ? { _id: id, 'loanAgent.id': user.id } : { 'employmentInfo.ippis': id, 'loanAgent.id': user.id } )
                                           .select( [ 'name.firstName', 'name.lastName', 'employmentInfo.ippis', 'employmentInfo.segment', 'netPay', 'loanAgent' ] );
            if(!customer) {
                debug(customer.message, customer.stack);     
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

            const newCustomer = await Customer.create(request.body);
            if(newCustomer instanceof Error) throw(newCustomer.message);
            
            newCustomer.validateSegment();

            // assigning agent
            // let agent
            // if(!request.body.loanAgent && request.user.role !== 'loanAgent' ) {
            //     console.log('branch 1');
            //     agent =  await pickRandomAgent('loanAgent', newCustomer.employmentInfo.segment);
            //     if(!agent) {
            //         debug(agent);
            //         throw new Error('Agent does not exist or is inactive.');
            //     };
            // }else if (request.body.loanAgent && request.user.role !== 'loanAgent') {
            //     console.log('branch 2');
            //     agent = await User.findOne( { _id: request.body.loanAgent, active: true, segments: request.body.employmentInfo.segment } );
            //     if(!agent) {
            //         debug(agent);
            //         throw new Error('Agent does not exist or is inactive.');
            //     };
            // }else{
            //     console.log('is loan agent');
            //     agent = await User.findOne( { _id: request.user.id, active: true, segments: request.body.employmentInfo.segment  } );
            //     if(!agent) {
            //         debug(agent);
            //         throw new Error('You are not allowed to create a customer in this segment.');
            //     };
            // };
            
            // newCustomer.loanAgent.id = agent._id.toString();
            // newCustomer.loanAgent.firstName = agent.name.firstName;
            // newCustomer.loanAgent.lastName = agent.name.lastName;
            // newCustomer.loanAgent.phone = agent.phone;
            
            await newCustomer.save();                                                                                                                                                                                                                                                                                                                                                                    

            return newCustomer;

        }catch(exception) {
            debug(exception);
            return exception;
        };
    },

    update: async function(id, requestBody) {
        try{
            const customer = await Customer.findByIdAndUpdate( { _id: id }, requestBody, { new: true } );
            if(!customer) {
                    debug(customer);
                throw new Error('Customer not found.')
            };

            return customer;
            
        }catch(exception) {
            return exception;
        }
    },

};

module.exports = customer;
