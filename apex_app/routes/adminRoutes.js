const router = require('express').Router();
const debug = require('debug')('app:adminRoutes');
const adminValidator = require('../validators/userValidator');
const adminViewController  = require('../controllers/userController');

router.get('/', async (req, res) => {
    const users = await adminViewController.getAll();
    if(users.length === 0) return res.status(404).send('No admins registered.');

    res.status(200).send(users);
});

router.post('/register', async (req, res) => {
    // validate user data
    const { error } = adminValidator.validateRegistration(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const user = await adminViewController.create(req.body);
    if (user instanceof Error) return res.status(400).send(user.message);

    res.status(201).send(user);
});

router.post('/verify-user', async (req, res) => {
    const { error } = adminValidator.validateRegVerification(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const isVerified = await adminViewController.verifyRegister(req.body);
    if (isVerified instanceof Error) return res.status(400).send(isVerified.message);

    res.status(200).send(isVerified);
});

router.post('/login', async (req, res) => {
    const { error } = adminValidator.validateLogin(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const isLoggedIn = await adminViewController.login(req.body);
    
    if (isLoggedIn instanceof Error) {
        debug(isLoggedIn.message);
        return res.status(404).send('Email does not exist.');
    };

    res.status(200).send({message: 'Login successful.', user: isLoggedIn});
});

router.post('/forgot-password', async (req, res) => {
    const { error } = adminValidator.validateForgotPassword(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const user = await adminViewController.forgotPassword(req.body);
    if (user instanceof Error) return res.status(400).send(user.message);

    res.redirect(307, `http://localhost:8480/api/admins/change-password/`);
});

router.post('/change-password/', async (req, res) => {
    console.log(req.body.newPassword)
    const user = await adminViewController.changePassword(req.body);
    if (user instanceof Error) return res.status(400).send(user.message);

    res.status(200).send(user);

});

module.exports = router;
