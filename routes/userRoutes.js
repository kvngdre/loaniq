const router = require('express').Router();
const verifyRole  = require('../middleware/verifyRole');
const verifyToken = require('../middleware/verifyToken');
const userValidators = require('../validators/userValidator');
const userController  = require('../controllers/userController');


router.post('/', verifyToken, verifyRole(['Lender', 'Admin']), async (req, res) => {
    const { error } = userValidators.validateSignUp(req.body)
    if(error) return res.status(400).send(error.details[0].message);

    const user = await userController.create(req.body, req.user)
    if(user instanceof Error) return res.status(400).send(user.message);

    return res.status(201).send(user);
})

router.get('/', verifyToken, verifyRole(['Lender', 'Admin']), async (req, res) => {
    const users = await userController.getAll(req.user.lenderId);
    if(users instanceof Error) return res.status(404).send(users.message);

    return res.status(200).send(users);
})

router.get('/:id', verifyToken, verifyRole(['Lender', 'Admin']), async (req, res) => {
    const user = await userController.getOne(req.params.id, {lenderId: req.user.lenderId})
    if(user instanceof Error) return res.status(404).send(user.message);

    return res.status(200).send(user);
})

router.patch('/:id', verifyToken, verifyRole(['Admin', 'Credit', 'Operations', 'Loan Agent', 'origin-master']), async (req, res) => {
    const { error } = userValidators.validateEdit(req.body)
    if(error) return res.status(400).send(error.details[0].message);
    
    const modifiedUser = await userController.update(req.params.id, req.body, {lenderId: req.user.lenderId})
    if(modifiedUser instanceof Error) return res.status(400).send(modifiedUser.message);

    return res.status(200).send(modifiedUser);
})

router.post('/verify', async (req, res) => {
    const { error } = userValidators.validateUserVerification(req.body);
    if(error) return res.status(400).send(error.details[0].message);

    const isVerified = await userController.verifyUser(req.body);
    if(isVerified instanceof Error) return res.status(400).send(isVerified.message);

    return res.status(200).send(isVerified);
})

router.post('/login', async (req, res) => {
    const { error } = userValidators.validateLogin(req.body)
    if(error) return res.status(400).send(error.details[0].message);

    const isLoggedIn = await userController.login(req.body.email, req.body.password)
    if(isLoggedIn instanceof Error) return res.status(400).send(isLoggedIn.message);

    return res.status(200).send(isLoggedIn);
})

router.post('/password', async (req, res) => {
    const { error } = userValidators.validateChangePassword(req.body);
    if(error) return res.status(400).send(error.details[0].message);

    const user = await userController.changePassword(req.body.email, req.body.newPassword, req.body.otp, req.body.currentPassword);
    if(user instanceof Error) return res.status(400).send(user.message);

    return res.status(200).send(user);
})

router.post('/otp', async (req, res) => {
    const { error } = userValidators.validateEmail(req.body);
    if(error) return res.status(400).send(error.details[0].message);
    
    const otp = await userController.sendOTP(req.body.email, req.body.name);
    if(otp instanceof Error) return res.status(400).send(otp.message);
    
    return res.status(200).send(otp);
})

// router.delete('/:id', verifyToken, verifyRole('Admin'),  async (req, res) => {
//     const user = await userController.delete(req.params.id);
//     if(user instanceof Error) return res.status(401).send(user.message);

//     return res.status(200).send(user);
// })

module.exports = router;