const authController = require('../controllers/auth.controller');
const router = require('express').Router();

router.post('/login', async (req, res) => {
    const response = await authController.login(
        req.body,
        req.cookies,
        res
    );
    return res.status(response.code).send(response.payload);
});

router.get('/logout', async (req, res) => {
    const response = await authController.logout(req.cookies, res);
    return res.status(response.code).send(response.payload);
});

module.exports = router;
