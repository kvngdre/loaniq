const router = require('express').Router();
const verifyRole = require('../middleware/verifyRole');
const verifyToken = require('../middleware/verifyToken');
const bankValidators = require('../validators/bankValidator');
const bankController = require('../controllers/banksController');

router.post('/', verifyToken, verifyRole('origin-master'), async (req, res) => {
    const { error } = bankValidators.validateCreation(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const newBank = await bankController.create(req.body.name, req.body.code);
    if (newBank.errorCode || newBank instanceof Error)
        return res.status(newBank.errorCode || 500).send(newBank.message);

    return res.status(201).send(newBank);
});

router.get(
    '/',
    verifyToken,
    verifyRole([
        'origin-master',
        'Lender',
        'Admin',
        'Credit',
        'Operations',
        'Loan Agent',
    ]),
    async (req, res) => {
        const banks = await bankController.getAll();
        if (banks.errorCode || banks instanceof Error)
            return res.status(banks.errorCode || 500).send(banks.message);

        return res.status(200).send(banks);
    }
);

router.get(
    '/:id',
    verifyToken,
    verifyRole(['origin-master', 'Lender', 'Admin']),
    async (req, res) => {
        const bank = await bankController.getOne(req.params.id);
        if (bank.errorCode || bank instanceof Error)
            return res.status(bank.errorCode || 500).send(bank.message);

        return res.status(200).send(bank);
    }
);

router.patch(
    '/:id',
    verifyToken,
    verifyRole(['Admin', 'origin-master']),
    async (req, res) => {
        const { error } = bankValidators.validateEdit(req.body);
        if (error) return res.status(400).send(error.details[0].message);

        const modifiedBank = await bankController.update(
            req.params.id,
            req.body
        );
        if (modifiedBank.errorCode || modifiedBank instanceof Error)
            return res
                .status(modifiedBank.errorCode || 500)
                .send(modifiedBank.message);

        return res.status(200).send(modifiedBank);
    }
);

router.delete(
    '/:id',
    verifyToken,
    verifyRole('origin-master'),
    async (req, res) => {
        const deletedBank = await bankController.delete(req.params.id);
        if (deletedBank.errorCode || deletedBank instanceof Error)
            return res
                .status(deletedBank.errorCode || 500)
                .send(deletedBank.message);

        return res.status(204).send(deletedBank);
    }
);

module.exports = router;
