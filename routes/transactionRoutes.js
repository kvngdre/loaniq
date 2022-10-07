const { roles } = require('../utils/constants');
const router = require('express').Router();
const ServerError = require('../errors/serverError');
const txnController = require('../controllers/transactionController');
const txnValidators = require('../validators/transactionValidator');
const verifyRole = require('../middleware/verifyRole');
const verifyToken = require('../middleware/verifyToken');

router.post('/', verifyToken, verifyRole(roles.master), async (req, res) => {
    const { error } = txnValidators.create(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const newTransaction = await txnController.create(req.user, req.body);
    if (newTransaction instanceof ServerError)
        return res
            .status(newTransaction.errorCode)
            .send(newTransaction.message);

    return res.status(201).send(newTransaction);
});

/**
 * @queryParam status Filter by transaction status.
 * @queryParam min Filter by transaction amount. Min value.
 * @queryParam max Filter by transaction amount. Max value.
 * @queryParam type Filter by transaction type.
 * @queryParam lender Filter by lender.
 */
router.get(
    '/',
    verifyToken,
    verifyRole([roles.admin, roles.master, roles.operations, roles.owner]),
    async (req, res) => {
        const transactions = await txnController.getAll(req.user, req.query);
        if (transactions instanceof ServerError)
            return res
                .status(transactions.errorCode)
                .send(transactions.message);

        return res.status(200).send(transactions);
    }
);

router.get(
    '/:id',
    verifyToken,
    verifyRole([roles.admin, roles.master, roles.operations, roles.owner]),
    async (req, res) => {
        const transaction = await txnController.getOne(req.params.id, req.user);
        if (transaction instanceof ServerError)
            return res.status(transaction.errorCode).send(transaction.message);

        return res.status(200).send(transaction);
    }
);

router.patch(
    '/:id',
    verifyToken,
    verifyRole(roles.master),
    async (req, res) => {
        const { error } = txnValidators.update(req.body);
        if (error) return res.status(400).send(error.details[0].message);

        const transaction = await txnController.update(
            req.params.id,
            req.user,
            req.body
        );
        if (transaction instanceof ServerError)
            return res.status(transaction.errorCode).send(transaction.message);

        return res.status(200).send(transaction);
    }
);

module.exports = router;
