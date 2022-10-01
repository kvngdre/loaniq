const { roles } = require('../utils/constants');
const lenderController = require('../controllers/lenderController');
const lenderValidators = require('../validators/lenderValidator');
const router = require('express').Router();
const verifyRole = require('../middleware/verifyRole');
const verifyToken = require('../middleware/verifyToken');

router.post('/', async (req, res) => {
    const { error } = lenderValidators.create(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const newLender = await lenderController.create(req.body);
    if (newLender.hasOwnProperty('errorCode'))
        return res.status(newLender.errorCode).send(newLender.message);

    return res.status(201).send(newLender);
});

router.post(
    '/activate/:id?',
    verifyToken,
    verifyRole([roles.master, roles.owner]),
    async (req, res) => {
        const lenderId =
            req.params.id !== undefined ? req.params.id : req.user.lenderId;

        const { error } = lenderValidators.activate(req.body);
        if (error) return res.status(400).send(error.details[0].message);

        const lender = await lenderController.activate(lenderId, req.body);
        if (lender.hasOwnProperty('errorCode'))
            return res.status(lender.errorCode).send(lender.message);

        return res.status(200).send(lender);
    }
);

router.get('/', verifyToken, verifyRole([roles.master, roles.owner]), async (req, res) => {
    const lenders = await lenderController.getAll();
    if (lenders.hasOwnProperty('errorCode'))
        return res.status(lenders.errorCode).send(lenders.message);

    return res.status(200).send(lenders);
});

router.get(
    '/otp/:id?',
    verifyToken,
    verifyRole([roles.master, roles.owner]),
    async (req, res) => {
        const lenderId =
            req.params.id !== undefined ? req.params.id : req.user.lenderId;
        
        const response = await lenderController.sendOtp(lenderId);
        if (response.hasOwnProperty('errorCode'))
            return res.status(response.errorCode).send(response.message);

        return res.status(200).send(response);
    }
);

router.get(
    '/balance/:id?',
    verifyToken,
    verifyRole([roles.admin, roles.owner, roles.master]),
    async (req, res) => {
        const lenderId =
            req.params.id !== undefined ? req.params.id : req.user.lenderId;

        const balance = await lenderController.getBalance(lenderId);
        if (balance.hasOwnProperty('errorCode'))
            return res.status(balance.errorCode).send(balance.message);

        return res.status(200).send(balance);
    }
);

router.get(
    '/:id?',
    verifyToken,
    verifyRole([roles.master, roles.owner]),
    async (req, res) => {
        const lenderId =
            req.params.id !== undefined ? req.params.id : req.user.lenderId;

        const lender = await lenderController.getOne(lenderId);
        if (lender.hasOwnProperty('errorCode'))
            return res.status(lender.errorCode).send(lender.message);

        return res.status(200).send(lender);
    }
);

router.patch(
    '/settings/:id?',
    verifyToken,
    verifyRole([roles.owner, roles.master, roles.admin]),
    async (req, res) => {
        const lenderId =
            req.params.id !== undefined ? req.params.id : req.user.lenderId;

        const { error } = lenderValidators.updateSettings(req.body);
        if (error) return res.status(400).send(error.details[0].message);

        const lender = await lenderController.updateSettings(
            lenderId,
            req.body
        );
        if (lender.hasOwnProperty('errorCode'))
            return res.status(lender.errorCode).send(lender.message);

        return res.status(200).send(lender);
    }
);

router.patch(
    '/:id?',
    verifyToken,
    verifyRole([roles.master, roles.owner]),
    async (req, res) => {
        const lenderId =
            req.params.id !== undefined ? req.params.id : req.user.lenderId;

        const { error } = lenderValidators.update(req.body);
        if (error) return res.status(400).send(error.details[0].message);

        const lender = await lenderController.update(lenderId, req.body);
        if (lender.hasOwnProperty('errorCode'))
            return res.status(lender.errorCode).send(lender.message);

        return res.status(200).send(lender);
    }
);

router.post(
    '/fund/:id?',
    verifyToken,
    verifyRole(roles.owner),
    async (req, res) => {
        const lenderId =
            req.params.id !== undefined ? req.params.id : req.user.lenderId;

        const { error } = lenderValidators.fundAccount(req.body);
        if (error) return res.status(400).send(error.details[0].message);

        const response = await lenderController.fundWallet(lenderId, req.body.amount);
        if (response.hasOwnProperty('errorCode'))
            return res.status(response.errorCode).send(response.message);

        return res.status(200).send(response);
    }
);

router.post(
    'deactivate/:id?',
    verifyToken,
    verifyRole([roles.owner, roles.master]),
    async (req, res) => {
        const lenderId =
            req.params.id !== undefined ? req.params.id : req.user.lenderId;

        const response = await lenderController.deactivate(
            lenderId,
            req.user,
            req.body.password
        );
        if (response.hasOwnProperty('errorCode'))
            return res.status(response.errorCode).send(response.message);

        return res.status(200).send(response);
    }
);

router.post('/forms/:id', async (req, res) => {
    const response = await lenderController.guestLoanReq(req.body);
});
router.get('/:id/support');

router.post(
    '/reactivate/:id?',
    verifyToken,
    verifyRole(roles.master),
    async (req, res) => {}
);

module.exports = router;
