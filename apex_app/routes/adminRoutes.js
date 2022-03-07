const userViewController  = require('../controllers/adminController');
const userValidator = require('../validators/adminValidator');
const router = require('express').Router();
const debug = require('debug')('app:routes');

router.get('/', async (req, res) => {
    const users = await userViewController.getAll();

    if(users.length === 0) return res.status(400).send('No users registered.');

    res.status(200).send(users);
});

router.post('/register', async (req, res) => {
    // validate user data
    const { error } = userValidator.validateRegistration(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const user = await userViewController.register(req.body);
    if(user instanceof Error) return res.status(400).send(user.message);

    res.status(200).send(user);
});

router.post('/verify-user', async (req, res) => {
    const { error } = userValidator.validateRegVerification(req.body);
    if(error) return res.status(400).send(error.details[0].message);

    const isVerified = await userViewController.verifyRegister(req.body);
    if(isVerified instanceof Error) return res.status(400).send(isVerified.message);

    res.status(200).send(isVerified);
});

router.post('/login', async (req, res) => {
    const { error } = userValidator.validateLogin(req.body);
    if(error) return res.status(400).send(error.details[0].message);

    const isLoggedIn = await userViewController.login(req.body);
    
    if(isLoggedIn instanceof Error) {
        debug(isLoggedIn.message);
        return res.status(400).send('Email does not exist.');
    };

    res.status(200).send({message: 'Login successful', user: isLoggedIn});
});

router.post('/forgot-password', async (req, res) => {
    const { error } = userValidator.validateEmail(req.body);
    if(error) return res.status(400).send(error.details[0].message);

    const user = await userViewController.forgotPassword(req.body);
    if(user instanceof Error) return res.status(400).send(user.message);
    
    res.redirect(`/change-password/?email=${user.email}`);
});

router.post('/change-password/', async (req, res) => {
    const userEmail = req.query.email;
    res.status(200).send(userEmail);

});

module.exports = router;
