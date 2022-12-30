const router = require('express').Router();
const dashboardController = require('../controllers/dashboardController');
const ServerError = require('../errors/serverError');
const verifyToken = require('../middleware/verifyToken');

router.get('/charts', verifyToken, async (req, res) => {
    const data = await dashboardController.getLoanData(req.user);
    if(data instanceof ServerError) return res.status(data.errorCode).send(data.message);

    return res.status(200).send(data);
})

module.exports = router;