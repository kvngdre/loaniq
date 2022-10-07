const authController = require('../controllers/authController');
const authValidators = require('../validators/authValidator');
const router = require('express').Router();
const ServerError = require('../errors/serverError');


router.post('/login', async (req, res) => {
    const { error } = authValidators.login(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const response = await authController.login(
        req.body.email,
        req.body.password,
        req.cookies,
        res
    );
    if (response instanceof ServerError)
        return res.status(response.errorCode).send(response.message);
    
    return res.status(200).send(response);
});

router.get('/logout', async (req, res) => {
    const response = await authController.logout(req.cookies, res);
    if (response instanceof ServerError)
        return res.status(response.errorCode).send(response.message);

    return res.status(204).send(response.message);
});

router.post('/verify', async (req, res) => {
    const { error } = authValidators.verify(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const isVerified = await authController.verifySignUp(
        req.body.email,
        req.body.currentPassword,
        req.body.newPassword,
        req.body.otp,
        req.cookies,
        res
    );
    if (isVerified instanceof ServerError)
        return res.status(isVerified.errorCode).send(isVerified.message);

    return res.status(200).send(isVerified);
});

module.exports = router;
