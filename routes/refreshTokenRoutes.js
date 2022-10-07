const refreshTokenController = require('../controllers/refreshTokenController');
const router = require('express').Router();
const ServerError = require('../errors/serverError');

router.get('/', async (req, res) => {
    const response = await refreshTokenController.handleRefreshToken(
        req.cookies,
        res
    );
    if (response instanceof ServerError)
        return res.status(response.errorCode).send(response.message);

    return res.status(200).send(response);
});

module.exports = router;
