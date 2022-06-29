const router = require('express').Router();
const debug = require('debug')('app:lenderRoutes');
const verifyRole = require('../middleware/verifyRole');
const verifyToken = require('../middleware/verifyToken');
const userValidators = require('../validators/userValidator');
const lenderValidators = require('../validators/lenderValidator');
const lenderController = require('../controllers/lenderController');

router.get('/', async (req, res) => {
    const lenders = await lenderController.getAll();
    if(lenders.length === 0) return res.status(404).send('No lenders found.');

    return res.status(200).send(lenders);
});

router.get('/settings', verifyToken, verifyRole('Lender'), async (req, res) => {
    const settings = await lenderController.getSettings( { lenderId: req.user.lenderId } );

    return res.status(200).send(settings);
});

router.get('/:id', async (req, res) => {
    const lender = await lenderController.get(req.params.id);
    if(!lender) return res.status(404).send('Lender not found.');

    return res.status(200).send(lender);   
});

router.post('/', async (req, res) => {
    const { error } = lenderValidators.creation(req.body);
    if(error) return res.status(404).send(error.details[0].message);

    const lender = await lenderController.createLender(req.body);
    if(lender instanceof Error) return res.status(400).send(lender.message);

    //TODO: generate lender url.
    return res.status(201).send(lender);
});

router.post('/verify-lender', async (req, res) => {
    const { error } = lenderValidators.validateRegVerification(req.body);
    if(error) return res.status(400).send(error.details[0].message);

    const isVerified = await lenderController.verifyLender(req.body);
    if(isVerified instanceof Error) return res.status(400).send(isVerified.message);

    return res.status(200).send(isVerified);
});

router.post('/login', async (req, res) => {
    const { error } = lenderValidators.validateLogin(req.body);
    if(error) return res.status(400).send(error.details[0].message);

    const isLoggedIn = await lenderController.login(req.body);
    
    if(isLoggedIn instanceof Error) {
        debug(isLoggedIn.message);
        return res.status(400).send(isLoggedIn.message);
    };

    return res.status(200).send({message: 'Login successful.', lender: isLoggedIn});
});

router.post('/forgot-password', async (req, res) => {
    const { error } = userValidators.validateForgotPassword(req.body);
    if(error) return res.status(400).send(error.details[0].message);

    const lender = await lenderController.forgotPassword(req.body);
    if(lender instanceof Error) return res.status(400).send(lender.message);

    // res.redirect(307, `http://localhost:8480/api/lenders/change-password/`);
    return res.status(200).send('Password reset OTP sent to email.');
});

router.post('/change-password', async (req, res) => {
    const { error } = userValidator.validateChangePassword(req.body);
    if(error) return res.status(400).send(error.details[0].message);
    
    const lender = await lenderController.changePassword(req.body);
    if(lender instanceof Error) return res.status(400).send(lender.message);

    return res.status(200).send(lender);
});

router.post('/create-admin', verifyToken, verifyRole('Lender'), async (req, res) => {
    const { error } = lenderValidators.adminCreation(req.body);
    if(error) return res.status(400).send(error.details[0].message);

    const adminUser = await lenderController.createAdmin(req);
    if(adminUser instanceof Error) return res.status(400).send(adminUser.message);

    return res.status(201).send(adminUser);
});

router.patch('/:id', verifyToken, verifyRole('Lender'), async (req, res) => {
    const { error } = lenderValidators.update(req.body);
    if(error) return res.status(400).send(error.details[0].message);

    const lender = await lenderController.update(req.params.id, req.body);
    if(lender instanceof Error) return res.status(404).send(lender.message);
    
    return res.status(200).send(lender);
});

router.put('/settings', verifyToken, verifyRole('Lender'), async (req, res) => {
    const { error } = lenderValidators.validateSettings(req.body);
    if(error) return res.status(400).send(error.details[0].message);
    
    const settings = await lenderController.setConfig(req.user.lenderId, req.body);
    if(settings instanceof Error) return res.status(400).send(settings.message);

    return res.status(201).send(settings);
});

router.delete('/', verifyToken, verifyRole('unknown'), async (req, res) => {
    const lender = await lenderController.delete(req.body);

    if(lender instanceof Error) return res.status(400).send(lender.message);

    return res.status(200).send(lender);
});

module.exports = router;
