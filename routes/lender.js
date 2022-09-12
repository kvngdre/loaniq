const router = require('express').Router();
const verifyRole = require('../middleware/verifyRole');
const verifyToken = require('../middleware/verifyToken');
const lenderValidators = require('../validators/lender');
const lenderController = require('../controllers/lender');
const settingsController = require('../controllers/settings');

router.post('/', async (req, res) => {
    const { error } = lenderValidators.create(req.body);
    if (error) return res.status(404).send(error.details[0].message);

    const lender = await lenderController.create(req.body);
    if (lender.hasOwnProperty('errorCode'))
        return res.status(lender.errorCode).send(lender.message);

    //TODO: generate lender url with auto increment field.
    return res.status(201).send(lender);
});

router.get('/', verifyToken, verifyRole('Master'), async (req, res) => {
    const lenders = await lenderController.getAll();
    if (lenders.hasOwnProperty('errorCode'))
        return res.status(lenders.errorCode).send(lenders.message);

    return res.status(200).send(lenders);
});

router.get(
    '/:id',
    verifyToken,
    verifyRole(['Lender', 'Master']),
    async (req, res) => {
        const lender = await lenderController.getOne(req.params.id);
        if (lender.hasOwnProperty('errorCode'))
            return res.status(404).send(lender.message);

        return res.status(200).send(lender);
    }
);

router.patch('/:id', verifyToken, verifyRole('Lender'), async (req, res) => {
    const { error } = lenderValidators.update(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const id = req.params.id ? req.params.id : req.user.lenderId;

    const lender = await lenderController.update(id, req.body);
    if (lender.hasOwnProperty('errorCode'))
        return res.status(404).send(lender.message);

    return res.status(200).send(lender);
});

router.post('/verify', async (req, res) => {
    const { error } = lenderValidators.verifyReg(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const isVerified = await lenderController.verifyLender(req.body);
    if (isVerified.hasOwnProperty('errorCode'))
        return res.status(400).send(isVerified.message);

    return res.status(200).send(isVerified);
});

router.post('/login', async (req, res) => {
    const { error } = lenderValidators.login(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const lender = await lenderController.login(
        req.body.email,
        req.body.password
    );
    if (lender.hasOwnProperty('errorCode'))
        return res.status(lender.errorCode).send(lender.message);

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
    verifyRole('Lender'),
    async (req, res) => {
        const { error } = lenderValidators.createAdmin(req.body);
        if (error) return res.status(400).send(error.details[0].message);

        const adminUser = await lenderController.createAdmin(req);
        if (adminUser.hasOwnProperty('errorCode'))
            return res.status(adminUser.errorCode).send(adminUser.message);

        return res.status(201).send(adminUser);
    }
);

router.post(
    '/settings',
    verifyToken,
    verifyRole(['Lender', 'Master']),
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
    '/settings/:id',
    verifyToken,
    verifyRole(['Lender', 'Master']),
    async (req, res) => {
        const settings = await settingsController.getOne(req.params.id);
        if (settings.hasOwnProperty('errorCode'))
            return res.status(settings.errorCode).send(settings.message);

        return res.status(200).send(settings);
    }
);

router.get('/settings', verifyToken, verifyRole('Master'), async (req, res) => {
    const settings = await settingsController.getAll(req.user);
    if (settings.hasOwnProperty('errorCode'))
        return res.status(settings.errorCode).send(settings.message);

    return res.status(200).send(settings);
});

router.patch(
    '/settings/:id',
    verifyToken,
    verifyRole(['Lender', 'Master']),
    async (req, res) => {
        const { value, error } = lenderValidators.updateSettings(req.body);
        if (error) return res.status(400).send(error.details[0].message);

        const settings = await settingsController.update(
            req.params.id,
            req.body
        );
        if (settings.hasOwnProperty('errorCode'))
            return res.status(settings.errorCode).send(settings.message);

        return res.status(200).send(settings);
    }
);

router.post('/otp', async (req, res) => {
    const { error } = lenderValidators.otp(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const otp = await lenderController.sendOTP(req.body.email);
    if (otp.hasOwnProperty('errorCode'))
        return res.status(otp.errorCode).send(otp.message);

    return res.status(200).send(otp);
});

router.get(
    '/balance/:id',
    verifyToken,
    verifyRole(['Admin', 'Lender', 'Master']),
    async (req, res) => {
        const balance = await lenderController.getBalance(req.params.id);
        if (balance.hasOwnProperty('errorCode'))
            return res.status(balance.errorCode).send(balance.message);

        return res.status(200).send(balance);
    }
);

router.post(
    '/fund/:id?',
    verifyToken,
    verifyRole(['Admin', 'Lender', 'Master']),
    async (req, res) => {
        const { error } = lenderValidators.fundAccount(req.body);
        if (error) return res.status(400).send(error.details[0].message);
        console.log(req.user)
        const response = await lenderController.getPaymentLink({
            id: req.params.id !== undefined ? req.params.id : req.user.lenderId,
            email: req.user.email,
            amount: req.body.amount,
            choice: req.body.choice,
        });
        console.log({
            id: req.params.id !== undefined ? req.params.id : req.user.lenderId,
            email: req.user.email,
            amount: req.body.amount,
            choice: req.body.choice,
        })
        if (response.hasOwnProperty('errorCode'))
            return res.status(response.errorCode).send(response.message);

        return res.status(200).send(response);
    }
);

router.post(
    '/deactivate/:id',
    verifyToken,
    verifyRole(['Lender', 'Master']),
    async (req, res) => {
        const { error } = lenderValidators.deactivate(req.body);
        if (error) return res.status(400).send(error.details[0].message);

        const response = await lenderController.deactivate(
            req.params.id,
            req.body.password
        );
        if (response.hasOwnProperty('errorCode'))
            return res.status(response.errorCode).send(response.message);

        return res.status(204).send(response);
    }
);

module.exports = router;
