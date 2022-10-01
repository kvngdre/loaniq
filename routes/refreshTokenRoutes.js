const router = require('express').Router();
const refreshTokenController = require('../controllers/refreshTokenController');

router.get('/', async (req, res) => {
    const response = await refreshTokenController.handleRefreshToken(
        req.cookies,
        res
    );
    if (response.hasOwnProperty('errorCode'))
        return res.status(response.errorCode).send(response.message);

    return res.status(200).send(response);
});

module.exports = router;
