const router = require('express').Router();
const bankController = require('../controllers/bank');
const verifyRole = require('../middleware/verifyRole');
const verifyToken = require('../middleware/verifyToken');
const bankValidators = require('../validators/bank');

router.post('/', verifyToken, verifyRole(['Lender', 'Admin', 'Master']), async (req, res) => {
    const { error } = bankValidators.validateCreation(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const newBank = await bankController.create(req.body.name, req.body.code);
    if (newBank.hasOwnProperty('errorCode'))
        return res.status(newBank.errorCode).send(newBank.message);

    return res.status(201).send(newBank);
});

router.get(
    '/',
    verifyToken,
    verifyRole([
        'Master',
        'Lender',
        'Admin',
        'Credit',
        'Operations',
        'Loan Agent',
    ]),
    async (req, res) => {
        const banks = await bankController.getAll();
        if (banks.hasOwnProperty('errorCode'))
            return res.status(banks.errorCode).send(banks.message);

        return res.status(200).send(banks);
    }
);

router.get(
    '/:id',
    verifyToken,
    verifyRole(['Master', 'Lender', 'Admin']),
    async (req, res) => {
        const bank = await bankController.getOne(req.params.id);
        if (bank.hasOwnProperty('errorCode'))
            return res.status(bank.errorCode).send(bank.message);

        return res.status(200).send(bank);
    }
);

router.patch(
    '/:id',
    verifyToken,
    verifyRole(['Lender', 'Admin', 'Master']),
    async (req, res) => {
        const { error } = bankValidators.validateEdit(req.body);
        if (error) return res.status(400).send(error.details[0].message);

        const bank = await bankController.update(req.params.id, req.body);
        if (bank.hasOwnProperty('errorCode'))
            return res.status(bank.errorCode).send(bank.message);

        return res.status(200).send(bank);
    }
);

router.delete('/:id', verifyToken, verifyRole('Master'), async (req, res) => {
    const deletedBank = await bankController.delete(req.params.id);
    if (deletedBank.hasOwnProperty('errorCode'))
        return res.status(deletedBank.errorCode).send(deletedBank.message);

    return res.status(204).send(deletedBank);
});

module.exports = router;
