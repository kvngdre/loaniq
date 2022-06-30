const router = require('express').Router();
const verifyRole = require('../middleware/verifyRole');
const verifyToken = require('../middleware/verifyToken');
const transactionValidators = require('../validators/transactionValidator');
const transactionController = require('../controllers/transactionController');

router.get('/', verifyToken, verifyRole('Admin'), async (req, res) => {
    const transactions = await transactionController.getAll(req.user);
    if(transactions instanceof Error) return res.status(404).send(transactions.message);

    return res.status(200).send(transactions);
});

router.get('/:id', verifyToken, verifyRole('Admin'), async (req, res) => {
    const transaction = await transactionController.getOne(req.params.id, req.user);
    if(transaction instanceof Error) return res.status(404).send(transaction.message);

    return res.status(200).send(transaction);
});

module.exports = router;