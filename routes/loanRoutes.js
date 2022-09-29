const _ = require('lodash');
const router = require('express').Router();
const concatErrorMsg = require('../utils/concatMsg');
const loanController = require('../controllers/loanController');
const verifyRole = require('../middleware/verifyRole');
const { loanValidators } = require('../validators/loan');
const verifyToken = require('../middleware/verifyToken');
const customerValidators = require('../validators/customerValidator');

router.post(
    '/new/loan-request',
    verifyToken,
    verifyRole(['Admin', 'Credit', 'Loan Agent']),
    async (req, res) => {
        const { error } = customerValidators.create(req.body.customer);
        if (error) {
            const errorResponse = concatErrorMsg(
                error.details[0].context.message
            );
            return res.status(400).send(errorResponse);
        }

        const response = await loanController.createLoanReq(req.user, req.body);
        if (response.hasOwnProperty('errorCode'))
            return res.status(response.errorCode).send(response.message);

        return res.status(200).send(response);
    }
);

// Get all loans
router.post(
    '/all',
    verifyToken,
    verifyRole(['Lender', 'Admin', 'Credit', 'Loan Agent']),
    async (req, res) => {
        const loans = await loanController.getAll(req.user, req.body);
        if (loans.hasOwnProperty('errorCode'))
            return res.status(loans.errorCode).send(loans.message);

        return res.status(200).send(loans);
    }
);

router.get('/expiring', async (req, res) => {
    const loans = await loanController.expiring();

    return res.status(200).send(loans);
});

router.get(
    '/:id',
    verifyToken,
    verifyRole(['Admin', 'Credit', 'Loan Agent']),
    async (req, res) => {
        // TODO: add all
        const loan = await loanController.getOne(req.user, req.params.id);
        if (loan instanceof Error) return res.status(400).send(loan.message);

        return res.status(200).send(loan);
    }
);

router.patch(
    '/:id',
    verifyToken,
    verifyRole(['Admin', 'Credit', 'Loan Agent']),
    async (req, res) => {
        const loan = await loanController.update(
            req.params.id,
            req.user,
            req.body
        );
        if (loan.hasOwnProperty('errorCode'))
            return res.status(loan.errorCode).send(loan.message);

        return res.status(200).send(loan);
    }
);

router.post(
    '/disburse',
    verifyToken,
    verifyRole(['Admin', 'Credit']),
    async (req, res) => {
        const { error } = loanValidators.validateDisbursement(req.body);
        if (error) return res.status(400).send(error.details[0].message);

        const loans = await loanController.getDisbursement(req.user, req.body);
        if (loans instanceof Error) return res.status(404).send(loans.message);

        return res.status(200).send(loans);
    }
);

router.post('/booking', async (req, res) => {
    const { error } = loanValidators.validateDateTimeObj(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const loans = await loanController.getLoanBooking(req);
});

module.exports = router;
