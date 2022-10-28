const _ = require('lodash');
const { roles } = require('../utils/constants');
const concatErrorMsg = require('../utils/concatMsg');
const customerValidators = require('../validators/customerValidator');
const loanController = require('../controllers/loanController');
const router = require('express').Router();
const ServerError = require('../errors/serverError');
const verifyRole = require('../middleware/verifyRole');
const verifyToken = require('../middleware/verifyToken');

router.post('/', verifyToken, async (req, res) => {
    const { value, error } = customerValidators.create(
        req.user,
        req.body.customer
    );
    if (error) {
        const errorResponse = concatErrorMsg(error.details[0].context.message);
        return res.status(400).send(errorResponse);
    }

    const newLoan = await loanController.create(req.user, value, req.body.loan);
    if (newLoan instanceof ServerError)
        return res.status(newLoan.errorCode).send(newLoan.message);

    return res.status(200).send(newLoan);
});

/**
 * @queryParam status Filter by loan status.
 * @queryParam minA Filter by loan amount. Min value.
 * @queryParam maxA Filter by loan amount. Max value.
 * @queryParam minT Filter by loan tenor. Min value.
 * @queryParam maxT Filter by loan tenor. Max value.
 * @queryParam start Filter by date the loan was created. start date.
 * @queryParam end Filter by date the loan was created. end date.
 * @queryParam sort Sort order. Defaults to 'first name'. [asc, desc, first, last]
 */
router.get('/', verifyToken, async (req, res) => {
    const loans = await loanController.getAll(req.user, req.query);
    if (loans instanceof ServerError)
        return res.status(loans.errorCode).send(loans.message);

    return res.status(200).send(loans);
});

router.get(
    '/disburse',
    verifyToken,
    verifyRole([roles.admin, roles.credit, roles.master, roles.owner]),
    async (req, res) => {
        const loans = await loanController.getDisbursement(req.user, req.query);
        if (loans instanceof ServerError)
            return res.status(loans.errorCode).send(loans.message);

        return res.status(200).send(loans);
    }
);

router.get('/:id', verifyToken, async (req, res) => {
    // TODO: add all
    const loan = await loanController.getOne(req.params.id);
    if (loan instanceof ServerError)
        return res.status(loan.errorCode).send(loan.message);

    return res.status(200).send(loan);
});

router.patch('/:id', verifyToken, async (req, res) => {
    const loan = await loanController.update(req.params.id, req.user, req.body);
    if (loan instanceof ServerError)
        return res.status(loan.errorCode).send(loan.message);

    return res.status(200).send(loan);
});

router.delete(
    '/:id',
    verifyToken,
    verifyRole([roles.master, roles.owner]),
    async (req, res) => {
        const deletedLoan = await loanController.delete(req.params.id);
        if (deletedLoan instanceof ServerError)
            return res.status(deletedLoan.errorCode).send(deletedLoan.message);

        return res.status(204).send(deletedLoan);
    }
);

module.exports = router;
