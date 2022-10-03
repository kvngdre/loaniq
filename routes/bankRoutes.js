const { roles } = require('../utils/constants');
const bankController = require('../controllers/bankController');
const bankValidators = require('../validators/bankValidator');
const router = require('express').Router();
const verifyRole = require('../middleware/verifyRole');
const verifyToken = require('../middleware/verifyToken');

router.post(
    '/',
    verifyToken,
    verifyRole([roles.admin, roles.lender, roles.master]),
    async (req, res) => {
        const { error } = bankValidators.create(req.body);
        if (error) return res.status(400).send(error.details[0].message);

        const newBank = await bankController.create(
            req.body.name,
            req.body.code
        );
        if (newBank.hasOwnProperty('errorCode'))
            return res.status(newBank.errorCode).send(newBank.message);

        return res.status(201).send(newBank);
    }
);

router.get('/', async (req, res) => {
    const banks = await bankController.getAll();
    if (banks.hasOwnProperty('errorCode'))
        return res.status(banks.errorCode).send(banks.message);

    return res.status(200).send(banks);
});

router.get('/:id', verifyToken, async (req, res) => {
    const bank = await bankController.getOne(req.params.id);
    if (bank.hasOwnProperty('errorCode'))
        return res.status(bank.errorCode).send(bank.message);

    return res.status(200).send(bank);
});

router.patch(
    '/:id',
    verifyToken,
    verifyRole([roles.admin, roles.lender, roles.master]),
    async (req, res) => {
        const { error } = bankValidators.update(req.body);
        if (error) return res.status(400).send(error.details[0].message);

        const bank = await bankController.update(req.params.id, req.body);
        if (bank.hasOwnProperty('errorCode'))
            return res.status(bank.errorCode).send(bank.message);

        return res.status(200).send(bank);
    }
);

router.delete(
    '/:id',
    verifyToken,
    verifyRole(roles.master),
    async (req, res) => {
        const deletedBank = await bankController.delete(req.params.id);
        if (deletedBank.hasOwnProperty('errorCode'))
            return res.status(deletedBank.errorCode).send(deletedBank.message);

        return res.status(204).send(deletedBank);
    }
);

module.exports = router;
