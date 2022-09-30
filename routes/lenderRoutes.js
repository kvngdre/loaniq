const { getPaymentLink } = require('../controllers/paymentController');
const { roles } = require('../utils/constants');
const lenderController = require('../controllers/lenderController');
const lenderValidators = require('../validators/lenderValidator');
const router = require('express').Router();
const verifyRole = require('../middleware/verifyRole');
const verifyToken = require('../middleware/verifyToken');

router.post('/', async (req, res) => {
    const { error } = lenderValidators.signUp(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const newLender = await lenderController.create(req.body);
    if (newLender.hasOwnProperty('errorCode'))
        return res.status(newLender.errorCode).send(newLender.message);

    return res.status(201).send(newLender);
});

router.post(
    '/:id/verify',
    verifyToken,
    verifyRole([roles.master, roles.owner]),
    async (req, res) => {
        const lender = await lenderController.verify(req.params.id, req.otp);
        if (lender.hasOwnProperty('errorCode'))
            return res.status(lender.errorCode).send(lender.message);

        return res.status(200).send(lender);
    }
);

router.get('/', verifyToken, verifyRole(roles.master), async (req, res) => {
    const lenders = await lenderController.getAll();
    if (lenders.hasOwnProperty('errorCode'))
        return res.status(lenders.errorCode).send(lenders.message);

    return res.status(200).send(lenders);
});

router.get(
    '/:id',
    verifyToken,
    verifyRole([roles.master, roles.owner]),
    async (req, res) => {
        const lender = await lenderController.getOne(req.params.id);
        if (lender.hasOwnProperty('errorCode'))
            return res.status(lender.errorCode).send(lender.message);

        return res.status(200).send(lender);
    }
);

router.patch(
    '/:id',
    verifyToken,
    verifyRole([roles.master, roles.owner]),
    async (req, res) => {
        const { error } = lenderValidators.update(req.body);
        if (error) return res.status(400).send(error.details[0].message);

        const lender = await lenderController.update(req.params.id, req.body);
        if (lender.hasOwnProperty('errorCode'))
            return res.status(lender.errorCode).send(lender.message);

        return res.status(200).send(lender);
    }
);

router.patch(
    '/:id/settings',
    verifyToken,
    verifyRole([roles.owner, roles.master, roles.admin]),
    async (req, res) => {
        const { error } = lenderValidators.updateSettings(req.body);
        if (error) return res.status(400).send(error.details[0].message);

        const lender = await lenderController.updateSettings(req.params.id, req.body);
        if (lender.hasOwnProperty('errorCode'))
            return res.status(lender.errorCode).send(lender.message);

        return res.status(200).send(lender);
    }
);

router.get(
    '/otp',
    verifyToken,
    verifyRole([roles.master, roles.owner]),
    async (req, res) => {
        const response = await lenderController.sendOTP(req.user.lenderId);
        if (response.hasOwnProperty('errorCode'))
            return res.status(response.errorCode).send(response.message);

        return res.status(200).send(response);
    }
);

router.get(
    '/:id/balance',
    verifyToken,
    verifyRole([roles.admin, roles.owner, roles.master]),
    async (req, res) => {
        const balance = await lenderController.getBalance(req.params.id);
        if (balance.hasOwnProperty('errorCode'))
            return res.status(balance.errorCode).send(balance.message);

        return res.status(200).send(balance);
    }
);

router.post(
    '/:id/fund',
    verifyToken,
    verifyRole(roles.owner),
    async (req, res) => {
        const { error } = lenderValidators.fundAccount(req.body);
        if (error) return res.status(400).send(error.details[0].message);

        const response = await getPaymentLink({
            id: req.params.id,
            email: req.user.email,
            amount: req.body.amount,
        });
        if (response.hasOwnProperty('errorCode'))
            return res.status(response.errorCode).send(response.message);

        return res.status(200).send(response);
    }
);

router.post(
    '/:id/deactivate',
    verifyToken,
    verifyRole([roles.owner, roles.master]),
    async (req, res) => {
        const response = await lenderController.deactivate(
            req.params.id,
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
