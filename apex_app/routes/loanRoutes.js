const _ = require('lodash');
const router = require('express').Router();
const debug = require('debug')('app:loanRoute');
const verifyRole  = require('../middleware/verifyRole');
const verifyToken = require('../middleware/verifyToken');
const loanValidators = require('../validators/loanValidator');
const loanViewController = require('../controllers/loanController');
const customerValidators = require('../validators/customerValidator');

router.get('/', verifyToken, async (req, res) => {
    const loans = await loanViewController.getAll();
    if(loans.length === 0) return res.status(404).send('No loans have been created.');

    res.status(200).send(loans);
});

router.get('/:id', verifyToken, async (req, res) => {
    const loan = await loanViewController.getOne(req.params.id);
    if(loan instanceof Error) return res.status(404).send('Loan does not exist.');

    res.status(200).send(loan);
});

router.post('/create-loan-request', verifyToken, verifyRole(['admin', 'loanAgent']), async (req, res) => {
    try{
        const customerObj = _.omit(req.body, ['loan']);
        const loanObj = req.body.loan;

        // customer validation
        var { error } = customerValidators.validateCreation(customerObj);
        if(error) throw error;
        
        // loan validation
        var { error }= loanValidators.validateCreation.loanRequest(loanObj);
        if(error) throw error;

    }catch(exception) {
        debug(exception);
        return res.status(400).send(exception.message);
    };

    const loanRequest = await loanViewController.createLoanRequest(req.body);
    debug(loanRequest.message, loanRequest.stack);
    if (loanRequest instanceof Error) return res.status(400).send(loanRequest.message);

    res.status(200).send(loanRequest);
});

router.post('/create-loan', verifyToken, verifyRole(['admin', 'loanAgent']), async (req, res) => {
    const { error }= loanValidators.validateCreation.loan(loanObj);
    if(error) return res.status(400).send(error.details[0].message);

    const loan = await loanViewController.createLoan(req.body);
    debug(loan.message, loan.stack);
    if (loan instanceof Error) return res.status(400).send(loan.message);

    res.status(200).send(loan);
});

router.put('/:id', verifyToken, verifyRole(['admin', 'credit']), (req, res) => {

});

module.exports = router;
