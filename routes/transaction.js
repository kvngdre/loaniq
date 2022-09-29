const router = require('express').Router();
const verifyRole = require('../middleware/verifyRole');
const verifyToken = require('../middleware/verifyToken');
const transactionValidators = require('../validators/transaction');
const transactionController = require('../controllers/transactionController');

router.post('/', async (req, res) => {
    const newTransaction = await transactionController.create(req.body);
    if (newTransaction.hasOwnProperty('errorCode'))
        return res
            .status(newTransaction.errorCode)
            .send(newTransaction.message);

    return res.status(201).send(newTransaction);
});

// Get all transactions
router.post(
    '/all',
    verifyToken,
    verifyRole(['Admin', 'Lender']),
    async (req, res) => {
        const { error } = transactionValidators.validateFilters(req.body);
        if (error) return res.status(400).send(error.details[0].message);

        const transactions = await transactionController.getAll(
            req.user,
            req.body
        );
        if (transactions.hasOwnProperty('errorCode'))
            return res
                .status(transactions.errorCode)
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
        if (transaction.hasOwnProperty('errorCode'))
            return res.status(transaction.errorCode).send(transaction.message);

        return res.status(200).send(transaction);
    }
);

module.exports = router;
