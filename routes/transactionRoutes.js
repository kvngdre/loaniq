const router = require('express').Router();
const verifyRole = require('../middleware/verifyRole');
const verifyToken = require('../middleware/verifyToken');
const transactionValidators = require('../validators/transactionValidator');
const transactionController = require('../controllers/transactionController');

router.get(
    '/',
    verifyToken,
    verifyRole(['Admin', 'Lender']),
    async (req, res) => {
        const { error } = transactionValidators.validateFilters(req.body);
        if (error) return res.status(400).send(error.details[0].message);

        const transactions = await transactionController.getAll(
            req.user,
            req.body
        );
        if (transactions.errorCode || transactions instanceof Error)
            return res
                .status(transactions.errorCode || 500)
                .send(transactions.message);

        return res.status(200).send(transactions);
    }
);

router.get(
    '/:id',
    verifyToken,
    verifyRole(['Admin', 'Lender']),
    async (req, res) => {
        const transaction = await transactionController.getOne(
            req.params.id,
            req.user
        );
        if (transaction.errorCode || transaction instanceof Error)
            return res
                .status(transaction.errorCode || 500)
                .send(transaction.message);

        return res.status(200).send(transaction);
    }
);

module.exports = router;
