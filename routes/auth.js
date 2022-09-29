const router = require('express').Router();
const authValidators = require('../validators/auth');
const authController = require('../controllers/authController');

router.post('/:type/login', async (req, res) => {
    const type = req.params.type;
    if (!['lenders', 'users'].includes(type)) return res.sendStatus(400);

    const { error } = authValidators.login(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const response = await authController.login(
        type,
        req.body.email,
        req.body.password,
        req.cookies,
        res
    );
    if (response.hasOwnProperty('errorCode'))
        return res.status(response.errorCode).send(response.message);

    return res.status(200).send(response);
});

router.get('/:type/logout', async (req, res) => {
    const type = req.params.type;
    if (!['lenders', 'users'].includes(type)) return res.sendStatus(400);

    const response = await authController.logout(type, req.cookies, res);
    if (response.hasOwnProperty('errorCode'))
        return res.status(response.errorCode).send(response.message);

    return res.status(204).send(response);
});

module.exports = router;
