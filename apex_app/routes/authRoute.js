const router = require('express').Router();
const authViewController = require('../controllers/authController');

router.post('/', async (req, res) => {

    const token = await authViewController.getToken(req.body);
    if(token instanceof Error) res.status(400).send(token.message);

    res.status(200).send(token);
});

module.exports = router;
