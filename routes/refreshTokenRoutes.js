const router = require('express').Router();
const refreshTokenController = require('../controllers/refreshTokenController');


router.get('/:type/', async (req, res) => {
    const type = req.params.type;
    if(!['lenders', 'users'].includes(type)) return res.sendStatus(400);

    const response = await refreshTokenController.handleRefreshToken(type, req.cookies, res);
    if(response.hasOwnProperty('errorCode')) return res.status(response.errorCode).send(response.message);

    return res.status(200).send(response);
});

module.exports = router;