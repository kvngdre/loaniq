const _ = require('lodash');
const router = require('express').Router();
const debug = require('debug')('app:loanRoute');
const verifyRole = require('../middleware/verifyRole');
const verifyToken = require('../middleware/verifyToken');
const loanController = require('../controllers/loanController');
const lenderController = require('../controllers/lenderController');
const customerValidators = require('../validators/customerValidator');
const customerController = require('../controllers/customerController');
const { LoanRequestValidators, loanValidators } = require('../validators/loanValidator');

async function getValidator(req_, customerSegment = null) {
  try {
    const { loanMetrics, segments } = await lenderController.getSettings(
      req_.body.slug
        ? { slug: req_.body.slug }
        : { lenderId: req_.user.lenderId }
    );
    const { minLoanAmount, maxLoanAmount, minTenor, maxTenor } = segments.find(
      (settings) =>
        settings.segment.toString() ===
        (customerSegment
          ? customerSegment.toString()
          : req_.body.employmentInfo.segment)
    );
    const requestValidator = new LoanRequestValidators(
      loanMetrics.minNetPay,
      minLoanAmount,
      maxLoanAmount,
      minTenor,
      maxTenor
    );
    return { loanMetrics, requestValidator };
  } catch (exception) {
    debug(exception);
    return exception;
  }
}

router.get('/', verifyToken, verifyRole(['lender', 'admin', 'credit', 'loanAgent']), async (req, res) => {
    const loans = await loanController.getAll(req.user);
    if (loans.length === 0) return res.status(404).send('No loans found.');

    return res.status(200).send(loans);
  }
);

router.get('/expiring', async (req, res) => {
  const loans = await loanController.expiring();

  return res.status(200).send(loans);
});

router.get('/:id', verifyToken, verifyRole(['admin', 'credit', 'loanAgent']), async (req, res) => {
    // TODO: add all
    const loan = await loanController.getOne(req.user, {_id: req.params.id});
    if (!loan) return res.status(404).send('Loan not found.');

    return res.status(200).send(loan);
  }
);

router.post('/create-loan-request', verifyToken, verifyRole(['admin', 'loanAgent', 'guest']), async (req, res) => {
    const validatorObj = await getValidator(req);
    if (validatorObj instanceof Error)
      return res
        .status(400)
        .send('Error fetching loan and segment configurations');

    const { loanMetrics, requestValidator } = validatorObj;

    const customerObj = _.omit(req.body, ['loan']);

    req.body.loan.netPay = req.body.netPay.value;
    const loanObj = req.body.loan;

    var { error } = customerValidators.validateCreation(customerObj);
    if (error) throw error;

    var { error } = requestValidator.loanRequestCreation(loanObj);
    if (error) throw error;

    const loanRequest = await loanController.createLoanRequest(
      loanMetrics,
      req
    );
    if (loanRequest instanceof Error) {
      debug(loanRequest.message, loanRequest.stack);
      return res.status(400).send(loanRequest.message);
    }

    return res.status(200).send(loanRequest);
  }
);

router.post('/create-loan', verifyToken, verifyRole(['admin', 'loanAgent']), async (req, res) => {
    const customer = await customerController.get({ _id: req.body.customer });
    if (customer instanceof Error) {
      debug(customer.message, customer.stack);
      return res.status(400).send(customer.message);
    }

    const validatorObj = await getValidator(
      req,
      customer.employmentInfo.segment
    );
    if (validatorObj instanceof Error)
      return res
        .status(400)
        .send('Error fetching loan and segment configurations');

    const { loanMetrics, requestValidator } = validatorObj;

    const { error } = requestValidator.loanCreation(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const loan = await loanController.createLoan(customer, loanMetrics, req);
    if (loan instanceof Error) {
      debug(loan.message, loan.stack);
      return res.status(400).send(loan.message);
    }

    return res.status(200).send(loan);
  }
);

router.patch('/:id', verifyToken, verifyRole(['credit', 'loanAgent']), async (req, res) => {
    try {
      const {
        customer: {
          employmentInfo: { segment }
        }
      } = await loanController.getOne(req.user, { _id: req.params.id });

      const { requestValidator } = await getValidator(req, segment);

      const { error } = requestValidator.validateEdit(req.body);
      if (error) return res.status(400).send(error.details[0].message);

      const loan = await loanController.edit(req);
      if (loan instanceof Error) {
        debug(loan);
        return res.status(400).send(loan.message);
      }

      return res.status(200).send(loan);
    } catch (exception) {
      debug(exception);
      return res.status(404).send('Loan not found.');
    }
  }
);

router.post('/disburse', verifyToken, verifyRole(['admin', 'credit']), async (req, res) => {
    const { error } = loanValidators.validateDateTimeObj(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const loans = await loanController.getDisbursement(
      req.user,
      req.body.fromDate
    );

    return res.status(200).send(loans);
  }
);

router.post('/loan-booking', async (req, res) => {
  const { error } = loanValidators.validateDateTimeObj(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const loans = await loanController.getLoanBooking(req);
});

module.exports = router;
