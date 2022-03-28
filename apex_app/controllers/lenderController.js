const Lender = require('../models/lenderModel');
const userViewController = require('../controllers/userController');
const { admin } = require('googleapis/build/src/apis/admin');

const lender = {
    createLender: async function(requestBody) {
        try{
            const doesExist = await Lender.findOne( {email: requestBody.email} );
            if(doesExist) throw new Error('Email has already been taken.');

            const newLender = await Lender.create(requestBody);

            return newLender;

        }catch(exception) {
            return exception;
        };
    },

    createAdmin: async function(lenderID, requestBody){
        try{
            const adminUsers = await userViewController.getAll( {role: 'admin'} );
            if(adminUsers.length > 0) throw new Error('Admin user already created.')

            const adminUser = await userViewController.create(requestBody,null,lenderID);
            if(!adminUser) throw new Error(adminUser.message);
            adminUser.lenderId = lenderID;

            return adminUser;

        }catch(exception) {
            return exception;
        }
    },

    update: async function(id, requestBody) {
        try{
            const lender = await Lender.findOneAndUpdate(
                 {_id: id}, requestBody, options={new: true}
                );
            if(!lender) throw new Error('Lender not found.');

            return lender;

        }catch(exception) {
            return exception;
        };
    },

    delete: async function(requestBody) {
        try{
            const lender = await Lender.findOneAndDelete( {email: requestBody.email} );
            if(!lender) throw new Error('Lender does not exist.');

            return lender;

        }catch(exception) {
            return exception;
        };
    }
}

module.exports = lender;
