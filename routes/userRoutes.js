const router = require('express').Router();
const auth = require('../controllers/auth');
const verifyRole = require('../middleware/verifyRole');
const verifyToken = require('../middleware/verifyToken');
const userValidators = require('../validators/userValidator');
const userController = require('../controllers/userController');

router.post(
    '/',
    verifyToken,
    verifyRole(['Lender', 'Admin']),
    async (req, res) => {
        const { error } = userValidators.validateSignUp(req.body);
        if (error) return res.status(400).send(error.details[0].message);

        const user = await userController.create(req.body, req.user);
        if (user.hasOwnProperty('errorCode'))
            return res.status(user.errorCode).send(user.message);

        return res.status(201).send(user);
    }
);

router.get(
    '/',
    verifyToken,
    verifyRole(['Lender', 'Admin']),
    async (req, res) => {
        const users = await userController.getAll(req.user.lenderId);
        if (users.hasOwnProperty('errorCode'))
            return res.status(users.errorCode).send(users.message);

        return res.status(200).send(users);
    }
);

router.get(
    '/:id',
    verifyToken,
    verifyRole(['Lender', 'Admin']),
    async (req, res) => {
        const user = await userController.getOne(req.params.id, {
            lenderId: req.user.lenderId,
        });
        if (user.hasOwnProperty('errorCode'))
            return res.status(user.errorCode).send(user.message);

        return res.status(200).send(user);
    }
);

router.patch(
    '/:id',
    verifyToken,
    verifyRole(['Admin', 'Credit', 'Operations', 'Loan Agent', 'Master']),
    async (req, res) => {
        const { error } = userValidators.validateEdit(req.body);
        if (error) return res.status(400).send(error.details[0].message);

        const user = await userController.update(req.params.id, req.body, {
            lenderId: req.user.lenderId,
        });
        if (user.hasOwnProperty('errorCode'))
            return res.status(user.errorCode).send(user.message);

        return res.status(200).send(user);
    }
);

router.post('/verify', async (req, res) => {
    const { error } = userValidators.validateUserVerification(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const response = await auth.verifyUser(req.body);
    if (response.hasOwnProperty('errorCode'))
        return res.status(response.errorCode).send(response.message);

    return res.status(200).send(response);
});

router.post('/login', async (req, res) => {
    const { error } = userValidators.validateLogin(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const response = await auth.login(req.body.email, req.body.password);
    if (response.hasOwnProperty('errorCode'))
        return res.status(response.errorCode).send(response.message);

    return res.status(200).send(response);
});

router.post('/password', async (req, res) => {
    const { error } = userValidators.validateChangePassword(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const response = await auth.changePassword(
        req.body.email,
        req.body.newPassword,
        req.body.otp,
        req.body.currentPassword
    );
    if (response.hasOwnProperty('errorCode'))
        return res.status(response.errorCode).send(response.message);

    return res.status(200).send(response);
});

router.post('/otp', async (req, res) => {
    const { error } = userValidators.validateEmail(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const response = await userController.sendOTP(
        req.body.email,
        req.body.name
    );
    if (response.hasOwnProperty('errorCode'))
        return res.status(response.errorCode).send(response.message);

    return res.status(200).send(response);
});

// router.delete('/:id', verifyToken, verifyRole('Admin'),  async (req, res) => {
//     const user = await userController.delete(req.params.id);
//     if(user instanceof Error) return res.status(401).send(user.message);

//     return res.status(204).send(user);
// })

module.exports = router;
