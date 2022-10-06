const { roles } = require('../utils/constants');
const ServerError = require('../errors/serverError');
const _ = require('lodash');
const router = require('express').Router();
const concatErrorMsg = require('../utils/concatMsg');
const loanController = require('../controllers/loanController');
const verifyRole = require('../middleware/verifyRole');
const { loanValidators } = require('../validators/loanValidator');
const verifyToken = require('../middleware/verifyToken');
const customerValidators = require('../validators/customerValidator');

router.post(
    '/',
    verifyToken,
    async (req, res) => {
        const { error } = customerValidators.create(req.body.customer);
        if (error) {
            const errorResponse = concatErrorMsg(
                error.details[0].context.message
            );
            return res.status(400).send(errorResponse);
        }

        const newLoan = await loanController.create(req.user, req.body);
        if (newLoan instanceof ServerError)
            return res.status(newLoan.errorCode).send(newLoan.message);

        return res.status(200).send(newLoan);
    }
);


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
router.get(
    '/',
    verifyToken,
    async (req, res) => {
        const loans = await loanController.getAll(req.user, req.query);
        if (loans instanceof ServerError)
            return res.status(loans.errorCode).send(loans.message);

        return res.status(200).send(loans);
    }
);

router.get(
    '/:id',
    verifyToken,
    async (req, res) => {
        // TODO: add all
        const loan = await loanController.getOne(req.user, req.params.id);
        if (loan instanceof ServerError) return res.status(400).send(loan.message);

        return res.status(200).send(loan);
    }
);

router.patch(
    '/:id',
    verifyToken,
    async (req, res) => {
        const loan = await loanController.update(
            req.params.id,
            req.user,
            req.body
        );
        if (loan instanceof ServerError)
            return res.status(loan.errorCode).send(loan.message);

        return res.status(200).send(loan);
    }
);

router.delete('/:id', verifyToken, verifyRole([roles.master, roles.owner]), async (req, reß) => {

});

router.post(
    '/disburse',
    verifyToken,
    verifyRole(['Admin', 'Credit']),
    async (req, res) => {
        const { error } = loanValidators.validateDisbursement(req.body);
        if (error) return res.status(400).send(error.details[0].message);

        const loans = await loanController.getDisbursement(req.user, req.body);
        if (loans instanceof ServerError) return res.status(404).send(loans.message);

        return res.status(200).send(loans);
    }
);


module.exports = router;
