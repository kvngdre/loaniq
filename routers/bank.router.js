const { roles } = require('../utils/constants');
const bankController = require('../controllers/bank.controller');
const router = require('express').Router();
const validateObjectId = require('../middleware/validateObjectId');
const verifyRole = require('../middleware/verifyRole');
const verifyToken = require('../middleware/verifyToken');

const { admin, master, owner } = roles;

router.post(
    '/',
    [verifyToken, verifyRole(admin, owner, master)],
    async (req, res) => {
        const response = await bankController.create(req.body);
        return res.status(response.code).send(response.payload);
    }
);

router.get('/', async (req, res) => {
    const response = await bankController.getBanks();
    return res.status(response.code).send(response.payload);
});

router.get('/:id', [verifyToken, validateObjectId], async (req, res) => {
    const response = await bankController.getBank(req.params.id);
    return res.status(response.code).send(response.payload);
});

router.patch(
    '/:id',
    [verifyToken, verifyRole(admin, master, owner), validateObjectId],
    async (req, res) => {
        const response = await bankController.updateBank(
            req.params.id,
            req.body
        );
        return res.status(response.code).send(response.payload);
    }
);

router.delete(
    '/:id',
    [verifyToken, verifyRole(roles.master), validateObjectId],
    async (req, res) => {
        const response = await bankController.deleteBank(req.params.id);
        return res.status(response.code).send(response.payload);
    }
);

module.exports = router;
