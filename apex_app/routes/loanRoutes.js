const _ = require('lodash');
const router = require('express').Router();
const debug = require('debug')('app:loanRoute');
const loanValidators = require('../validators/loanValidator');
const loanViewController = require('../controllers/loanController');
const customerValidators = require('../validators/customerValidator');

router.post('/create-request', async (req, res) => {
    // Joi validation
    try{
        const customerObj = _.omit(req.body, ['loan']);
        const loanObj = req.body.loan;

        var { error } = customerValidators.validateCreation(customerObj);
        if(error) throw error;
        
        var { error }= loanValidators.validateCreation(loanObj);
        if(error) throw error;

    }catch(exception) {
        debug(exception);
        return res.status(400).send(exception.message);
    };

    const loanRequest = await loanViewController.createLoan(req.body);
    debug(loanRequest.message, loanRequest.stack);
    if (loanRequest instanceof Error) return res.status(400).send(loanRequest.message);

    res.status(200).send(loanRequest);
});

router.get('/', async (req, res) => {
    const loans = await loanViewController.getAll();
    if(loans.length === 0) return res.status(404).send('No loans have been created.');

    res.status(200).send(loans);
});

router.get('/:id', async (req, res) => {
    const loan = await loanViewController.getOne(req.params.id);
    if(loan instanceof Error) return res.status(404).send('Loan does not exist.');

    res.status(200).send(loan);
})
module.exports = router;