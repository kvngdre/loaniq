const { roles } = require('../utils/constants');
const lenderController = require('../controllers/lenderController');
const lenderValidators = require('../validators/lenderValidator');
const router = require('express').Router();
const ServerError = require('../errors/serverError');
const verifyRole = require('../middleware/verifyRole');
const verifyToken = require('../middleware/verifyToken');

router.post('/', async (req, res) => {
    const { error } = lenderValidators.create(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const newLender = await lenderController.create(req.body);
    if (newLender instanceof ServerError)
        return res.status(newLender.errorCode).send(newLender.message);

    return res.status(201).send(newLender);
});

router.post(
    '/activate/:id?',
    verifyToken,
    verifyRole([roles.master, roles.owner]),
    async (req, res) => {
        const id =
            req.params.id !== undefined ? req.params.id : req.user.lender;

        const { error } = lenderValidators.activate(req.body);
        if (error) return res.status(400).send(error.details[0].message);

        const lender = await lenderController.activate(id, req.body);
        if (lender instanceof ServerError)
            return res.status(lender.errorCode).send(lender.message);

        return res.status(200).send(lender);
    }
);

/**
 * @queryParam name Filter by name.
 * @queryParam min Filter by min balance.
 * @queryParam max Filter by max balance.
 * @queryParam sort Field to sort by. Defaults to 'company name'.
 */
router.get('/all', verifyToken, verifyRole(roles.master), async (req, res) => {
    const lenders = await lenderController.getAll(req.query);
    if (lenders instanceof ServerError)
        return res.status(lenders.errorCode).send(lenders.message);

    return res.status(200).send(lenders);
});

router.get(
    '/balance/:id?',
    verifyToken,
    verifyRole([roles.admin, roles.owner, roles.master]),
    async (req, res) => {
        const lender =
            req.params.id !== undefined ? req.params.id : req.user.lender;

        const balance = await lenderController.getBalance(lender);
        if (balance instanceof ServerError)
            return res.status(balance.errorCode).send(balance.message);

        return res.status(200).send(balance);
    }
);

router.get(
    '/otp/:id?',
    verifyToken,
    verifyRole([roles.master, roles.owner]),
    async (req, res) => {
        console.log('here otp')
        const lender =
            req.params.id !== undefined ? req.params.id : req.user.lender;

        const response = await lenderController.requestOtp(lender);
        if (response instanceof ServerError)
            return res.status(response.errorCode).send(response.message);

        return res.status(200).send(response);
    }
);

router.get(
    '/public-url/:id?',
    verifyToken,
    verifyRole([roles.master, roles.owner]),
    async (req, res) => {
        console.log('here')
        const lender =
            req.params.id !== undefined ? req.params.id : req.user.lender;

        const publicUrl = await lenderController.genPublicUrl(lender);
        if (publicUrl instanceof ServerError)
            return res.status(publicUrl.errorCode).send(publicUrl.message);

        return res.status(200).send(publicUrl);
    }
);


router.get(
    '/:id?',
    verifyToken,
    verifyRole([roles.master, roles.owner]),
    async (req, res) => {
        console.log('here get')
        const id =
            req.params.id !== undefined ? req.params.id : req.user.lender;

        const lender = await lenderController.getOne(id);
        if (lender instanceof ServerError)
            return res.status(lender.errorCode).send(lender.message);

        return res.status(200).send(lender);
    }
);

router.patch(
    '/settings/:id?',
    verifyToken,
    verifyRole([roles.owner, roles.master, roles.admin]),
    async (req, res) => {
        const id =
            req.params.id !== undefined ? req.params.id : req.user.lender;

        const { error } = lenderValidators.updateSettings(req.body);
        if (error) return res.status(400).send(error.details[0].message);

        const lender = await lenderController.updateSettings(id, req.body);
        if (lender instanceof ServerError)
            return res.status(lender.errorCode).send(lender.message);

        return res.status(200).send(lender);
    }
);

router.patch(
    '/:id?',
    verifyToken,
    verifyRole([roles.master, roles.owner]),
    async (req, res) => {
        const id =
            req.params.id !== undefined ? req.params.id : req.user.lender;

        const { error } = lenderValidators.update(req.body);
        if (error) return res.status(400).send(error.details[0].message);

        const lender = await lenderController.update(id, req.body);
        if (lender instanceof ServerError)
            return res.status(lender.errorCode).send(lender.message);

        return res.status(200).send(lender);
    }
);

router.post('/:shortUrl', async (req, res) => {
    // TODO: loan req
    const response = await lenderController.guestLoanReq(req.body);
});

router.post(
    '/fund/:id?',
    verifyToken,
    verifyRole(roles.owner),
    async (req, res) => {
        const lender =
            req.params.id !== undefined ? req.params.id : req.user.lender;

        const { error } = lenderValidators.fundAccount(req.body);
        if (error) return res.status(400).send(error.details[0].message);

        const response = await lenderController.fundWallet(
            lender,
            req.body.amount
        );
        if (response instanceof ServerError)
            return res.status(response.errorCode).send(response.message);

        return res.status(200).send(response);
    }
);

router.post(
    'deactivate/:id?',
    verifyToken,
    verifyRole([roles.owner, roles.master]),
    async (req, res) => {
        const lender =
            req.params.id !== undefined ? req.params.id : req.user.lender;

        const response = await lenderController.deactivate(
            lender,
            req.user,
            req.body.password
        );
        if (response instanceof ServerError)
            return res.status(response.errorCode).send(response.message);

        return res.status(200).send(response);
    }
);


router.get('/:id/support');

router.post(
    '/reactivate/:id?',
    verifyToken,
    verifyRole(roles.master),
    async (req, res) => {}
);

module.exports = router;
