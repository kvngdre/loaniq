const router = require('express').Router();
const flwCtrl = require('../utils/flutterwave');
const webhooks = require('../controllers/webhook');

router.post('/paystack', async (req, res) => {
    if(!req.headers['x-paystack-signature']) return res.sendStatus(401);

    const response = await webhooks.paystack(req.headers['x-paystack-signature'], req.body);
    return res.sendStatus(response);
});

router.post('/flutterwave', async (req, res) => {
    if(!req.headers['verif-hash']) return res.sendStatus(401);

    const response = await webhooks.flutterwave(req.headers['verif-hash'], req.body);
    return res.sendStatus(response);
});

router.get('/flutterwave/banks', async (req, res) => {

    const response = await flwCtrl.getBanks();
    return res.status(200).send(response);
});

module.exports = router;