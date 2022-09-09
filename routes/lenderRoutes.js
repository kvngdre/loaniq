const router = require('express').Router();
const verifyRole = require('../middleware/verifyRole');
const verifyToken = require('../middleware/verifyToken');
const lenderValidators = require('../validators/lenderValidator');
const lenderController = require('../controllers/lenderController');
const settingsController = require('../controllers/settingsController');

router.post('/', async (req, res) => {
    const { error } = lenderValidators.creation(req.body);
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

router.get('/:id', verifyToken, verifyRole('Master'), async (req, res) => {
    const lender = await lenderController.getOne(req.params.id);
    if (lender.hasOwnProperty('errorCode'))
        return res.status(404).send(lender.message);

    return res.status(200).send(lender);
});

router.patch('/:id?', verifyToken, verifyRole('Lender'), async (req, res) => {
    const { error } = lenderValidators.update(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const id = req.params.id ? req.params.id : req.user.lenderId;

    const lender = await lenderController.update(id, req.body);
    if (lender.hasOwnProperty('errorCode'))
        return res.status(404).send(lender.message);

    return res.status(200).send(lender);
});

router.post('/verify', async (req, res) => {
    const { error } = lenderValidators.validateRegVerification(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const isVerified = await lenderController.verifyLender(req.body);
    if (isVerified.hasOwnProperty('errorCode'))
        return res.status(400).send(isVerified.message);

    return res.status(200).send(isVerified);
});

router.post('/login', async (req, res) => {
    const { error } = lenderValidators.validateLogin(req.body);
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
        const { error } = lenderValidators.adminCreation(req.body);
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
        const { value, error } = lenderValidators.setConfigSettings(req.body);
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
        const { value, error } = lenderValidators.settings(req.body);
        if (error) return res.status(400).send(error.details[0].message);
        console.log(value);
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
    const { error } = lenderValidators.validateEmail(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const otp = await lenderController.sendOTP(req.body.email);
    if (otp.hasOwnProperty('errorCode'))
        return res.status(otp.errorCode).send(otp.message);

    return res.status(200).send(otp);
});

router.get(
    '/deactivate/:id',
    verifyToken,
    verifyRole(['Lender', 'Master']),
    async (req, res) => {
        const response = await lenderController.deactivate(req.params.id);
        if (response.hasOwnProperty('errorCode'))
            return res.status(response.errorCode).send(response.message);

        return res.status(200).send(response);
    }
);

module.exports = router;
