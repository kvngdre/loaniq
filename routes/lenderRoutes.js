const { roles } = require('../utils/constants');
const lenderController = require('../controllers/lenderController');
const lenderValidators = require('../validators/lender');
const paymentController = require('../controllers/paymentController');
const router = require('express').Router();
const settingsController = require('../controllers/settingsController');
const userValidators = require('../validators/user');
const verifyRole = require('../middleware/verifyRole');
const verifyToken = require('../middleware/verifyToken');

router.post('/', async (req, res) => {
    const { error } = lenderValidators.signUp(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const lender = await lenderController.signUp(req.body);
    if (lender.hasOwnProperty('errorCode'))
        return res.status(lender.errorCode).send(lender.message);

    //TODO: generate lender url with auto increment field.
    return res.status(201).send(lender);
});

router.get('/', verifyToken, verifyRole(roles.master), async (req, res) => {
    const lenders = await lenderController.getAll();
    if (lenders.hasOwnProperty('errorCode'))
        return res.status(lenders.errorCode).send(lenders.message);

    return res.status(200).send(lenders);
});

router.get(
    '/:id?',
    verifyToken,
    verifyRole([roles.lender, roles.master]),
    async (req, res) => {
        const id = req.params.id !== undefined ? req.params.id : req.user.id;

        const lender = await lenderController.getOne(id);
        if (lender.hasOwnProperty('errorCode'))
            return res.status(404).send(lender.message);

        return res.status(200).send(lender);
    }
);

router.patch('/:id?', verifyToken, verifyRole(roles.lender), async (req, res) => {
    const { error } = lenderValidators.update(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const id = req.params.id !== undefined ? req.params.id : req.user.id;

    const lender = await lenderController.update(id, req.body);
    if (lender.hasOwnProperty('errorCode'))
        return res.status(404).send(lender.message);

    return res.status(200).send(lender);
});

router.post('/password', async (req, res) => {
    const { error } = lenderValidators.changePassword(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const lender = await lenderController.changePassword(
        req.body.email,
        req.body.newPassword,
        req.body.otp,
        req.body.currentPassword
    );
    if (lender.hasOwnProperty('errorCode'))
        return res.status(lender.errorCode).send(lender.message);

    return res.status(200).send(lender);
});

router.post(
    '/admin/new',
    verifyToken,
    verifyRole(roles.lender),
    async (req, res) => {
        const { error } = userValidators.validateSignUp(req.body);
        if (error) return res.status(400).send(error.details[0].message);

        const adminUser = await lenderController.createAdmin(req.body, req.user);
        if (adminUser.hasOwnProperty('errorCode'))
            return res.status(adminUser.errorCode).send(adminUser.message);

        return res.status(201).send(adminUser);
    }
);

router.post(
    '/settings',
    verifyToken,
    verifyRole([roles.lender, roles.master]),
    async (req, res) => {
        const { value, error } = lenderValidators.createSettings(req.body);
        if (error) return res.status(400).send(error.details[0].message);

        const settings = await settingsController.create(req.user, value);
        if (settings.hasOwnProperty('errorCode'))
            return res.status(settings.errorCode).send(settings.message);

        return res.status(201).send(settings);
    }
);

router.get(
    '/settings/:id?',
    verifyToken,
    verifyRole([roles.lender, roles.master]),
    async (req, res) => {
        const id = req.params.id !== undefined ? req.params.id : req.user.id;

        const settings = await settingsController.getOne(id);
        if (settings.hasOwnProperty('errorCode'))
            return res.status(settings.errorCode).send(settings.message);

        return res.status(200).send(settings);
    }
);

router.get('/settings', verifyToken, verifyRole(roles.master), async (req, res) => {
    const settings = await settingsController.getAll(req.user);
    if (settings.hasOwnProperty('errorCode'))
        return res.status(settings.errorCode).send(settings.message);

    return res.status(200).send(settings);
});

router.patch(
    '/settings/:id?',
    verifyToken,
    verifyRole([roles.lender, roles.master]),
    async (req, res) => {
        const id = req.params.id !== undefined ? req.params.id : req.user.id;

        const { value, error } = lenderValidators.updateSettings(req.body);
        if (error) return res.status(400).send(error.details[0].message);

        const settings = await settingsController.update(id, req.body);
        if (settings.hasOwnProperty('errorCode'))
            return res.status(settings.errorCode).send(settings.message);

        return res.status(200).send(settings);
    }
);

router.post('/otp', async (req, res) => {
    const { error } = lenderValidators.email(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const otp = await lenderController.sendOTP(req.body.email);
    if (otp.hasOwnProperty('errorCode'))
        return res.status(otp.errorCode).send(otp.message);

    return res.status(200).send(otp);
});

router.get(
    '/balance/:id?',
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
