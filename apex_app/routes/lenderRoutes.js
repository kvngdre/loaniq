const router = require('express').Router();
const debug = require('debug')('app:lenderRoutes');
const verifyRole = require('../middleware/verifyRole');
const verifyToken = require('../middleware/verifyToken');
const lenderValidators = require('../validators/lenderValidator');
const lenderViewController = require('../controllers/lenderController');



router.post('/', async (req, res) => {
    const { error } = lenderValidators.creation(req.body);
    if(error) return res.status(400).send(error.details[0].message);

    const lender = await lenderViewController.createLender(req.body);
    if(lender instanceof Error) return res.status(400).send(lender.message);

    //TODO: generate lender url.
    res.status(201).send(lender);
});

router.get('/', async (req, res) => {
    const lenders = await lenderViewController.getAll();
    if(lenders.length === 0) return res.status(404).send('No lenders found.');

    res.status(200).send(lenders);
});

router.get('/:id', async (req, res) => {
    const lender = await lenderViewController.get(req.params.id);
    if(!lender) return res.status(404).send('Lender not found.');

    res.status(200).send(lender);
});

router.post('/verify-lender', async (req, res) => {
    const { error } = lenderValidators.validateRegVerification(req.body);
    if(error) return res.status(400).send(error.details[0].message);

    const isVerified = await lenderViewController.verifyRegister(req.body);
    if(isVerified instanceof Error) return res.status(400).send(isVerified.message);

    res.status(200).send(isVerified);
});

router.post('/login', async (req, res) => {
    const { error } = lenderValidators.validateLogin(req.body);
    if(error) return res.status(400).send(error.details[0].message);

    const isLoggedIn = await lenderViewController.login(req.body);
    
    if(isLoggedIn instanceof Error) {
        debug(isLoggedIn.message);
        return res.status(400).send(isLoggedIn.message);
    };

    res.status(200).send({message: 'Login successful.', lender: isLoggedIn});
});

router.post('/forgot-password', async (req, res) => {
    const { error } = lenderValidators.validateForgotPassword(req.body);
    if(error) return res.status(400).send(error.details[0].message);

    const lender = await lenderViewController.forgotPassword(req.body);
    if(lender instanceof Error) return res.status(400).send(lender.message);

    res.redirect(307, `http://localhost:8480/api/lenders/change-password/`);
});

router.post('/change-password/', async (req, res) => {
    const lender = await lenderViewController.changePassword(req.body);
    if(lender instanceof Error) return res.status(400).send(lender.message);

    res.status(200).send(lender);
});

router.post('/create-admin', verifyToken, verifyRole('lender'), async (req, res) => {
    const { error } = lenderValidators.adminCreation(req.body);
    if(error) return res.status(400).send(error.details[0].message);

    const adminUser = await lenderViewController.createAdmin(req);
    if(adminUser instanceof Error) return res.status(400).send(adminUser.message);

    res.status(201).send(adminUser);
});

router.patch('/:id', verifyToken, verifyRole('lender'), async (req, res) => {
    const { error } = lenderValidators.update(req.body);
    if(error) return res.status(400).send(error.details[0].message);

    const lender = await lenderViewController.update(req.params.id, req.body);
    if(lender instanceof Error) return res.status(404).send(lender.message);
    
    res.status(200).send(lender);
});

router.put('/settings', verifyToken, verifyRole('lender'), async (req, res) => {
    const { error } = lenderValidators.validateSettings(req.body);
    if(error) return res.status(400).send(error.details[0].message);

    const settings = await lenderViewController.setConfig("622b84182dda2a2a7dac756d", req.body);
    if(settings instanceof Error) return res.status(400).send(settings.message);

    res.status(201).send(settings);
});

router.delete('/', verifyToken, verifyRole('unknown'), async (req, res) => {
    const lender = await lenderViewController.delete(req.body);

    if(lender instanceof Error) return res.status(400).send(lender.message);

    res.status(200).send(lender);
});

module.exports = router;
