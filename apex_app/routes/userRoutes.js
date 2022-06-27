const router = require('express').Router();
const debug = require('debug')('app:userRoutes');
const verifyRole  = require('../middleware/verifyRole');
const verifyToken = require('../middleware/verifyToken');
const userValidator = require('../validators/userValidator');
const userController  = require('../controllers/userController');

router.get('/', verifyToken, verifyRole(['lender', 'admin']), async (req, res) => {
    const users = await userController.getAll( { lenderId: req.user.lenderId } );
    if(users.length === 0) return res.status(404).send('No users registered.');

    return res.status(200).send(users);
});

router.get('/:id', verifyToken, verifyRole(['lender', 'admin']), async (req, res) => {
    const user = await userController.get( { _id: req.params.id, lenderId: req.user.lenderId } );
    if(!user) return res.status(404).send('User not found.');

    return res.status(200).send(user);
});

router.post('/create-user', verifyToken,verifyRole(['lender', 'admin']), async (req, res) => {
    const role = req.body.role;

    if (!role) return res.status(400).send('Role is required.');

    switch(role) {
        case "admin":
            var { error } = userValidator.validateRegistration.admin(req.body);
            if(error) return res.status(400).send(error.details[0].message);
            break;
        
        case "credit":
            var { error } = userValidator.validateRegistration.credit(req.body);
            if(error) return res.status(400).send(error.details[0].message);
            break;
        
        case "operations":
            var { error } = userValidator.validateRegistration.operations(req.body);
            if(error) return res.status(400).send(error.details[0].message);
            break;

        case "loanAgent":
            var { error } = userValidator.validateRegistration.loanAgent(req.body);
            if (error) return res.status(400).send(error.details[0].message);
            break;
    };  
    

    const user = await userController.create(role, req.body, req.user);
    if(user instanceof Error) {
        debug(user);
        return res.status(400).send(user.message);
    };

    return res.status(200).send(user);
});

router.post('/verify-user', async (req, res) => {
    const { error } = userValidator.validateRegVerification(req.body);
    if(error) return res.status(400).send(error.details[0].message);

    const isVerified = await userController.verifyRegister(req.body);
    if(isVerified instanceof Error) return res.status(400).send(isVerified.message);

    return res.status(200).send(isVerified);
});

router.post('/login', async (req, res) => {
    const { error } = userValidator.validateLogin(req.body);
    if(error) return res.status(400).send(error.details[0].message);

    const isLoggedIn = await userController.login(req.body);
    
    if(isLoggedIn instanceof Error) {
        debug(isLoggedIn.message);
        return res.status(400).send(isLoggedIn.message);
    };

    return res.status(200).send({message: 'Login successful.', user: isLoggedIn});
});

router.post('/forgot-password', async (req, res) => {
    const { error } = userValidator.validateEmail(req.body);
    if(error) return res.status(400).send(error.details[0].message);

    const user = await userController.forgotPassword(req.body);
    if(user instanceof Error) return res.status(400).send(user.message);

    // return res.redirect(307, `http://localhost:8480/api/users/change-password/`);
    return res.status(200).send('Password reset OTP sent to email.');
});

router.post('/change-password', async (req, res) => {
    const { error } = userValidator.validateChangePassword(req.body);
    if(error) return res.status(400).send(error.details[0].message);

    const user = await userController.changePassword(req.body);
    if(user instanceof Error) return res.status(400).send(user.message);

    return res.status(200).send(user);
});

router.patch('/:id', verifyToken, verifyRole('admin'), async (req, res) => {
    const { error } = userValidator.validateEdit(req.body);
    if(error)  return res.status(400).send(error.details[0].message);
    
    const user = await userController.update(req.params.id, req.user, req.body);
    if(user instanceof Error) return res.status(400).send(user.message);

    return res.status(200).send({message: 'Update Successful', user})
});

router.post('/send-otp', async (req, res) => {
    const { error } = userValidator.validateEmail(req.body);
    if(error) return res.status(400).send(error.details[0].message);
    
    const otp = await userController.sendOTP(req.body.email, req.body.name);
    if(otp instanceof Error) return res.status(400).send(response.message);
    
    return res.status(200).send(otp);
});

router.delete('/:id', verifyToken, verifyRole('admin'),  async (req, res) => {
    const user = await userController.delete(req.params.id);
    if(user instanceof Error) return res.status(401).send(user.message);

    return res.status(200).send(user);
});

module.exports = router;
