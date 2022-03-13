const _ = require('lodash');
const router = require('express').Router();
const debug = require('debug')('loanRoute');
const loanValidators = require('../validators/loanValidator');
const loanViewController = require('../controllers/loanController');
const customerValidators = require('../validators/customerValidator');

router.post('/create-request', async (req, res) => {
    try{
        const customerObj = _.omit(req.body, ['loan']);
        const loanObj = req.body.loan;

        var { error } = customerValidators.validateCreation(customerObj);
        if(error) throw error;
        
        var { error } = loanValidators.validateCreation(loanObj);
        if(error) throw error;

    }catch(exception) {
        return res.status(400).send(exception.details[0].message);
    };

    const loanRequest = await loanViewController.createLoan(req.body);
    debug(loanRequest.message, loanRequest.stack);
    if (loanRequest instanceof Error) return res.status(200).send(loanRequest.message);

    res.status(200).send(loanRequest);
});

router.get('/', async (req, res) => {
    const loans = await loanViewController.getAll();
    if(loans instanceof Error) return loans.message;

    res.status(200).send(loans);
});

module.exports = router;