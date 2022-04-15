require('dotenv').config();
const _ = require('lodash');
const router = require('express').Router();
const debug = require('debug')('app:loanRoute');
const verifyRole  = require('../middleware/verifyRole');
const verifyToken = require('../middleware/verifyToken');
const LoanValidators = require('../validators/loanValidator');
const lenderController = require('../controllers/lenderController');
const loanViewController = require('../controllers/loanController');
const customerValidators = require('../validators/customerValidator');
const customerController = require('../controllers/customerController');

router.post('/create-loan-request', verifyToken, verifyRole(['admin', 'loanAgent', 'guest']), async (req, res) => {
    const { loanMetrics, segments } = await lenderController.getSettings(req.body.slug ? { slug: req.body.slug } : { lenderId: req.user.lenderId } );
    const {
        minLoanAmount,
        maxLoanAmount,
        minTenor,
        maxTenor
    } = segments.find(settings => settings.segment.toString() === req.body.employmentInfo.segment);

    const requestValidator = new LoanValidators(loanMetrics.minNetPay, minLoanAmount, maxLoanAmount, minTenor, maxTenor);

    try{
        const customerObj = _.omit(req.body, ['loan']);
        const loanObj = req.body.loan;

        // customer validation
        var { error } = customerValidators.validateCreation(customerObj);
        if(error) throw error;
        
        // loan validation
        var { error }= requestValidator.loanRequestCreation(loanObj);
        if(error) throw error;

    }catch(exception) {
        debug(exception);
        return res.status(400).send(exception.message);
    };

    const loanRequest = await loanViewController.createLoanRequest(loanMetrics, req);
    if (loanRequest instanceof Error) {
        debug(loanRequest.message, loanRequest.stack);
        return res.status(400).send(loanRequest.message);
    };

    res.status(200).send(loanRequest);
});

router.get('/', verifyToken, verifyRole(['admin', 'credit', 'loanAgent']), async (req, res) => {
    const loans = await loanViewController.getAll(req.user);
    if(loans.length === 0) return res.status(404).send('No loans found.');

    res.status(200).send(loans);
});

router.get('/:id', verifyToken, verifyRole(['admin', 'credit', 'loanAgent']), async (req, res) => {
    const loan = await loanViewController.getOne(req.params.id, req.user);
    if(!loan) return res.status(404).send('Loan not found.');

    res.status(200).send(loan);
});

router.post('/create-loan', verifyToken, verifyRole(['admin', 'loanAgent']), async (req, res) => {
    // TODO: ask if front-end can pass the segment
    const customer = await customerController.get(req.user, { _id: req.body.customer } );
    if(customer instanceof Error) {
        debug(customer.message, customer.stack);
        return res.status(400).send(customer.message);
    };

    const { loanMetrics, segments } = await lenderController.getSettings( { lenderId: req.user.lenderId } );
    const {
        minLoanAmount,
        maxLoanAmount,
        minTenor,
        maxTenor
    } = segments.find(settings => settings.segment.toString() === customer.employmentInfo.segment.toString());
    
    const loanValidator = new LoanValidators(loanMetrics.minNetPay, minLoanAmount, maxLoanAmount, minTenor, maxTenor);

    const { error }= loanValidator.loanCreation(req.body);
    if(error) return res.status(400).send(error.details[0].message);

    const loan = await loanViewController.createLoan(customer, loanMetrics, req);
    if (loan instanceof Error) {
        debug(loan.message, loan.stack);
        return res.status(400).send(loan.message);
    };

    res.status(200).send(loan);
});

router.patch('/:id', verifyToken, verifyRole(['credit']), async (req, res) => {
    const customer = await customerController.get(req.user, { _id: req.body.customer } );
    if(customer instanceof Error) {
        debug(customer.message, customer.stack);
        return res.status(400).send(customer.message);
    };

    const { loanMetrics, segments } = await lenderController.getSettings( { lenderId: req.user.lenderId } );
    const {
        minLoanAmount,
        maxLoanAmount,
        minTenor,
        maxTenor
    } = segments.find(settings => settings.segment.toString() === customer.employmentInfo.segment.toString());
    
    const editValidator = new LoanValidators(loanMetrics.minNetPay, minLoanAmount, maxLoanAmount, minTenor, maxTenor);
    const { error } = editValidator.validateEdit(req.body);
    if(error) return res.status(400).send(error.details[0].message);

    const loan = await loanViewController.edit(req);
    if(loan instanceof Error) {
        debug(loan);
        return res.status(400).send(loan.message);
    };

    res.status(200).send(loan);
});

router.post('/disburse', verifyToken, verifyRole(['admin', 'credit']), async (req, res) => {
    const loans = await loanViewController.getDisbursement(req.user, req.body.fromDate);
    
    res.status(200).send(loans);
})

module.exports = router;
