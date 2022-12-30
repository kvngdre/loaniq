const authController = require('../controllers/auth.controller');
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
    return res.status(response.code).send(response.payload);
});

router.get('/logout', async (req, res) => {
    const response = await authController.logout(req.cookies, res);
    return res.status(response.code).send(response.message);
});

module.exports = router;
