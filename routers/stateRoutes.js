const { roles } = require('../utils/constants');
const router = require('express').Router();
const ServerError = require('../errors/serverError');
const stateController = require('../controllers/stateController');
const stateValidators = require('../validators/stateValidator');
const verifyRole = require('../middleware/verifyRole');
const verifyToken = require('../middleware/verifyToken');

router.post('/', verifyToken, verifyRole(roles.master), async (req, res) => {
    const { error } = stateValidators.create(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const newState = await stateController.create(req.body);
    if (newState instanceof ServerError) {
        return res.status(newState.errorCode).send(newState.message);
    }

    return res.status(201).send(newState);
});

router.get('/', async (req, res) => {
    const states = await stateController.getAll(req.query);
    if (states instanceof ServerError)
        return res.status(states.errorCode).send(states.message);

    return res.status(200).send(states);
});

router.get('/:id', verifyToken, async (req, res) => {
    const state = await stateController.getOne(req.params.id);
    if (state instanceof ServerError)
        return res.status(state.errorCode).send(state.message);

    return res.status(200).send(state);
});

router.patch(
    '/:id',
    verifyToken,
    verifyRole(roles.master),
    async (req, res) => {
        const { error } = stateValidators.update(req.body);
        if (error) return res.status(400).send(error.details[0].message);

        const state = await stateController.update(req.params.id, req.body);
        if (state instanceof ServerError)
            return res.status(state.errorCode).send(state.message);

        return res.status(200).send(state);
    }
);

router.delete(
    '/:id',
    verifyToken,
    verifyRole(roles.master),
    async (req, res) => {
        const state = await stateController.delete(req.params.id);
        if (state instanceof ServerError)
            return res.status(state.errorCode).send(state.message);

        return res.status(204).send(state);
    }
);

module.exports = router;
