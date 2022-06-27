const router = require('express').Router();
const authController = require('../controllers/authController');

router.post('/', async (req, res) => {

    const token = await authController.getToken(req.body);
    if(token instanceof Error) res.status(400).send(token.message);

    return res.status(200).send(token);
});


module.exports = router;
