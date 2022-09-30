const { roles } = require('../utils/constants');
const lenderController = require('../controllers/lenderController');
const lenderValidators = require('../validators/lenderValidator');
const paymentController = require('../controllers/paymentController');
const router = require('express').Router();
const settingsController = require('../controllers/settingsController');
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

router.post('/:id/verify', verifyToken, verifyRole([roles.master, roles.owner]), async (req, res) => {
    const lender = await lenderController.verify(req.params.id, req.otp);
    if (lender.hasOwnProperty('errorCode'))
        return res.status(lender.errorCode).send(lender.message);

    return res.status(200).send(lender);
});



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

router.patch('/:id', verifyToken, verifyRole([roles.master, roles.owner]), async (req, res) => {
    const { error } = lenderValidators.update(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const lender = await lenderController.update(req.params.id, req.body);
    if (lender.hasOwnProperty('errorCode'))
        return res.status(lender.errorCode).send(lender.message);

    return res.status(200).send(lender);
});

router.patch(
    '/:id/settings',
    verifyToken,
    verifyRole([roles.lender, roles.master]),
    async (req, res) => {
        const { error } = lenderValidators.updateSettings(req.body);
        if (error) return res.status(400).send(error.details[0].message);

        const lender = await settingsController.update(req.params.id, req.body);
        if (lender.hasOwnProperty('errorCode'))
            return res.status(lender.errorCode).send(lender.message);

        return res.status(200).send(lender);
    }
);

router.get('/:id/otp', async (req, res) => {
    const response = await lenderController.sendOTP(req.params.id);
    if (response.hasOwnProperty('errorCode'))
        return res.status(response.errorCode).send(response.message);

    return res.status(200).send(response);
});

router.get(
    '/:id/balance',
    verifyToken,
    verifyRole([roles.admin, roles.lender, roles.master]),
    async (req, res) => {
        const id = req.params.id !== undefined ? req.params.id : req.user.id;

        const balance = await lenderController.getBalance(id);
        if (balance.hasOwnProperty('errorCode'))
            return res.status(balance.errorCode).send(balance.message);

        return res.status(200).send(balance);
    }
);

router.post(
    '/fund/:id?',
    verifyToken,
    verifyRole([roles.admin, roles.lender, roles.master]),
    async (req, res) => {
        const { error } = lenderValidators.fundAccount(req.body);
        if (error) return res.status(400).send(error.details[0].message);

        const response = await paymentController.getPaymentLink({
            id: req.params.id !== undefined ? req.params.id : req.user.id,
            email: req.user.email,
            amount: req.body.amount,
            choice: req.body.choice,
        });
        if (response.hasOwnProperty('errorCode'))
            return res.status(response.errorCode).send(response.message);

        return res.status(200).send(response);
    }
);

router.post(
    '/deactivate/:id?',
    verifyToken,
    verifyRole([roles.lender, roles.master]),
    async (req, res) => {
        const { error } = lenderValidators.deactivate(req.body);
        if (error) return res.status(400).send(error.details[0].message);

        const id = req.params.id !== undefined ? req.params.id : req.user.id;

        const response = await lenderController.deactivate(
            id,
            user,
            req.body.password
        );
        if (response.hasOwnProperty('errorCode'))
            return res.status(response.errorCode).send(response.message);

        return res.status(204).send(response);
    }
);

router.post('/forms/:id', async (req, res) => {
    const response = await lenderController.guestLoanReq(req.body);
});
router.get('/:lenderId/support');

router.post(
    '/reactivate/:id?',
    verifyToken,
    verifyRole(roles.master),
    async (req, res) => {}
);

module.exports = router;
