const _ = require('lodash')
const router = require('express').Router();
const debug = require('debug')('app:loanRoute');
const verifyRole = require('../middleware/verifyRole');
const verifyToken = require('../middleware/verifyToken');
const loanController = require('../controllers/loanController');
const lenderController = require('../controllers/lenderController');
const customerValidators = require('../validators/customerValidator');
const customerController = require('../controllers/customerController');
const { LoanRequestValidators, loanValidators } = require('../validators/loanValidator');

// Get Loan Validators.
async function getValidator(request, customerSegment=null) {
    try{
        const { data: { loanMetrics, segments } } = await lenderController.getConfig(request.user.lenderId);
        const { minLoanAmount, maxLoanAmount, minTenor, maxTenor } = segments.find(
            (segmentSettings) => segmentSettings.segment.toString() === (customerSegment ? customerSegment.toString() : request.body.employmentInfo.segment)
        );

        const requestValidator = new LoanRequestValidators(
            loanMetrics.minNetPay,
            minLoanAmount,
            maxLoanAmount,
            minTenor,
            maxTenor
        );

        return { loanMetrics, requestValidator };

    }catch(exception) {
        debug(exception)
        return exception;
    };
};

// Get all loans
router.post('/all', verifyToken, verifyRole(['Lender', 'Admin', 'Credit', 'Loan Agent']), async (req, res) => {
    const loans = await loanController.getAll(req.user, req.body)
    if(loans instanceof Error) return res.status(404).send(loans.message);

    return res.status(200).send(loans);
});

router.get('/expiring', async (req, res) => {
  const loans = await loanController.expiring();

  return res.status(200).send(loans);
});

router.get('/:id', verifyToken, verifyRole(['Admin', 'Credit', 'Loan Agent']), async (req, res) => {
    // TODO: add all
    const loan = await loanController.getOne(req.user, req.params.id)
    if(loan instanceof Error) return res.status(400).send(loan.message);

    return res.status(200).send(loan);
});

router.post('/new/loan-request', verifyToken, verifyRole(['Admin', 'Credit', 'Loan Agent']), async (req, res) => {
    const validatorObj = await getValidator(req);
    if (validatorObj instanceof Error) return res.status(500).send('Error fetching loan and segment configurations.');

    const { loanMetrics, requestValidator } = validatorObj;

    const customerObj = _.omit(req.body, ['loan']);
    const loanObj = req.body.loan;

    var { error } = customerValidators.validateCreation(customerObj);
    if(error) return res.status(400).send(error.details[0].message);

    var { error } = requestValidator.loanRequestCreation(loanObj)
    if(error)return res.status(400).send(error.details[0].message);

    const loanRequest = await loanController.createLoanRequest(req.user, loanMetrics, customerObj, loanObj);
    if(loanRequest.hasOwnProperty('errorCode')) return res.status(loanRequest.errorCode).send(loanRequest.message);

    return res.status(200).send(loanRequest);
});

router.post('/new', verifyToken, verifyRole(['Admin', 'Loan Agent']), async (req, res) => {
    const customer = await customerController.getOne(req.body.customer)
    if(customer instanceof Error) return res.status(400).send(customer.message);

    const validatorObj = await getValidator(req, customer.employmentInfo.segment)
    if(validatorObj instanceof Error) return res.status(400).send('Error fetching loan and segment configurations');

    const { loanMetrics, requestValidator } = validatorObj

    const { error } = requestValidator.loanCreation(req.body)
    if(error) return res.status(400).send(error.details[0].message);

    const loan = await loanController.createLoan(customer, loanMetrics, req)
    if(loan instanceof Error) return res.status(400).send(loan.message);

    return res.status(200).send(loan);
});

router.patch('/:id', verifyToken, verifyRole(['Admin', 'Credit', 'Loan Agent']), async (req, res) => {
    const loan = await loanController.update(req.params.id, req.user, req.body)
    if(loan.hasOwnProperty('errorCode')) return res.status(loan.errorCode).send(loan.message);

    return res.status(200).send(loan);
      
});

router.post('/disburse', verifyToken, verifyRole(['Admin', 'Credit']), async (req, res) => {
    const { error } = loanValidators.validateDisbursement(req.body);
    if(error) return res.status(400).send(error.details[0].message);

    const loans = await loanController.getDisbursement(req.user, req.body);
    if(loans instanceof Error) return res.status(404).send(loans.message);

    return res.status(200).send(loans);
});

router.post('/booking', async (req, res) => {
  const { error } = loanValidators.validateDateTimeObj(req.body);
  if(error) return res.status(400).send(error.details[0].message);

  const loans = await loanController.getLoanBooking(req);
});

module.exports = router;