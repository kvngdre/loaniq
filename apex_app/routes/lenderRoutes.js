const router = require('express').Router();
const debug = require('debug')('app:lenderRoutes');
const verifyRole = require('../middleware/verifyRole');
const verifyToken = require('../middleware/verifyToken');
const lenderValidators = require('../validators/lenderValidator');
const lenderController = require('../controllers/lenderController');


router.post('/', async (req, res) => {
    const { error } = lenderValidators.creation(req.body);
    if(error) return res.status(404).send(error.details[0].message);

    const lender = await lenderController.create(req.body);
    if(lender instanceof Error) return res.status(400).send(lender.message);

    //TODO: generate lender url with auto increment field.
    return res.status(201).send(lender);
});

router.get('/', verifyToken, verifyRole('origin-master'), async (req, res) => {
    const lenders = await lenderController.getAll();
    if(lenders instanceof Error) return res.status(400).send(lenders.message);

    return res.status(200).send(lenders);
});

router.get('/settings', verifyToken, verifyRole('Lender'), async (req, res) => {
    const settings = await lenderController.getSettings( { lenderId: req.user.lenderId } );
    if(settings instanceof Error) return res.status(404).send(settings.message);

    return res.status(200).send(settings);
});

router.get('/:id', verifyToken, verifyRole(['Lender', 'origin-master']), async (req, res) => {
    const lender = await lenderController.getOne(req.params.id);
    if(lender instanceof Error) return res.status(404).send(lender.message);

    return res.status(200).send(lender);   
});

router.patch('/:id?', verifyToken, verifyRole('Lender'), async (req, res) => {
    const { error } = lenderValidators.update(req.body);
    if(error) return res.status(400).send(error.details[0].message);

    const id = req.params.id ? req.params.id : req.user.lenderId

    const lender = await lenderController.update(id, req.body)
    if(lender instanceof Error) return res.status(404).send(lender.message);
    
    return res.status(200).send(lender);
});

router.post('/verify', async (req, res) => {
    const { error } = lenderValidators.validateRegVerification(req.body);
    if(error) return res.status(400).send(error.details[0].message);

    const isVerified = await lenderController.verifyLender(req.body);
    if(isVerified instanceof Error) return res.status(400).send(isVerified.message);

    return res.status(200).send(isVerified);
});

router.post('/login', async (req, res) => {
    const { error } = lenderValidators.validateLogin(req.body);
    if(error) return res.status(400).send(error.details[0].message);

    const lender = await lenderController.login(req.body.email, req.body.password);
    if(lender instanceof Error) return res.status(400).send(lender.message);

    return res.status(200).send(lender);
});

router.post('/password', async (req, res) => {
    const { error } = lenderValidators.validateChangePassword(req.body);
    if(error) return res.status(400).send(error.details[0].message);
    
    const lender = await lenderController.changePassword(req.body.email, req.body.newPassword, req.body.otp, req.body.currentPassword);
    if(lender instanceof Error) return res.status(400).send(lender.message);

    return res.status(200).send(lender);
});

router.post('/admin/new', verifyToken, verifyRole('Lender'), async (req, res) => {
    const { error } = lenderValidators.adminCreation(req.body);
    if(error) return res.status(400).send(error.details[0].message);

    const adminUser = await lenderController.createAdmin(req);
    if(adminUser instanceof Error) return res.status(400).send(adminUser.message);

    return res.status(201).send(adminUser);
});

router.put('/settings', verifyToken, verifyRole('Lender'), async (req, res) => {
    const { error } = lenderValidators.validateSettings(req.body);
    if(error) return res.status(400).send(error.details[0].message);
    
    const settings = await lenderController.setConfig(req.user.lenderId, req.body);
    if(settings instanceof Error) return res.status(400).send(settings.message);

    return res.status(201).send(settings);
});

router.post('/otp', async (req, res) => {
    const { error } = lenderValidators.validateEmail(req.body);
    if(error) return res.status(400).send(error.details[0].message);
    
    const otp = await lenderController.sendOTP(req.body.email);
    if(otp instanceof Error) return res.status(400).send(otp.message);
    
    return res.status(200).send(otp);
});

// router.delete('/', verifyToken, verifyRole('unknown'), async (req, res) => {
//     const lender = await lenderController.delete(req.body);

//     if(lender instanceof Error) return res.status(400).send(lender.message);

//     return res.status(200).send(lender);
// });

module.exports = router;
