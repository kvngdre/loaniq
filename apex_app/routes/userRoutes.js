const router = require('express').Router();
const debug = require('debug')('app:routes');
const userValidator = require('../validators/userValidator');
const userViewController  = require('../controllers/userController');

router.get('/', async (req, res) => {
    const users = await userViewController.getAll();

    if(users.length === 0) return res.status(400).send('No users registered.');

    res.status(200).send(users);
});

router.post('/register', async (req, res) => {
    const role = req.body.role;
    if (!role) return res.status(400).send('Role is required.');

    switch(role) {
        case "admin":
            var { error } = userValidator.validateAdminReg(req.body);
            if(error) return res.status(400).send(error.details[0].message);
            break;
        
        case "credit":
            var { error } = userValidator.validateCreditReg(req.body);
            if(error) return res.status(400).send(error.details[0].message);
            break;
        
        case "operations":
            var { error } = userValidator.validateOperationsReg(req.body);
            if(error) return res.status(400).send(error.details[0].message);
            break;

        case "loanAgent":
            var { error } = userValidator.validateLoanAgentReg(req.body);
            if (error) return res.status(400).send(error.details[0].message);
            break;
    };
    

    const user = await userViewController.create(req.body);
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

    res.status(200).send({message: 'Login successful.', user: isLoggedIn});
});

router.post('/forgot-password', async (req, res) => {
    const { error } = userValidator.validateForgotPassword(req.body);
    if(error) return res.status(400).send(error.details[0].message);

    const user = await userViewController.forgotPassword(req.body);
    if(user instanceof Error) return res.status(400).send(user.message);

    res.redirect(307, `http://localhost:8480/api/admins/change-password/`);
});

router.post('/change-password/', async (req, res) => {
    console.log(req.body.newPassword)
    const user = await userViewController.changePassword(req.body);
    if(user instanceof Error) return res.status(400).send(user.message);

    res.status(200).send(user);
});

module.exports = router;
