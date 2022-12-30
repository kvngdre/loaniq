const refreshTokenController = require('../controllers/refreshToken.controller');
const router = require('express').Router();

router.get('/', async (req, res) => {
    const response = await refreshTokenController.handleRefreshToken(
        req.cookies,
        res
    );
    return res.status(response.code).send(response.payload);
});

module.exports = router;
