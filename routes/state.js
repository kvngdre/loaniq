const router = require('express').Router();
const debug = require('debug')('app:stateRoutes');
const verifyRole = require('../middleware/verifyRole');
const stateController = require('../controllers/state');
const verifyToken = require('../middleware/verifyToken');
const stateValidators = require('../validators/stateValidator');

router.post('/', verifyToken, verifyRole('Master'), async (req, res) => {
    const { error } = stateValidators.validateCreation(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const newState = await stateController.create(req.body);
    if (newState instanceof Error) {
        return res.status(400).send(newState.message);
    }

    return res.status(201).send(newState);
});

router.get(
    '/',
    verifyToken,
    verifyRole([
        'Master',
        'Lender',
        'Admin',
        'Credit',
        'Operations',
        'Loan Agent',
    ]),
    async (req, res) => {
        const states = await stateController.getAll();
        if (states.length === 0)
            return res.status(404).send('No states found.');

        return res.status(200).send(states);
    }
);

router.get(
    '/:id',
    verifyToken,
    verifyRole(['Master', 'Admin']),
    async (req, res) => {
        const state = await stateController.get(req.params.id);
        if (!state) return res.status(404).send(state.message);

        return res.status(200).send(state);
    }
);

router.patch('/:id', verifyToken, verifyRole('Master'), async (req, res) => {
    const { error } = stateValidators.validateEdi(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const state = await stateController.update(req.params.id, req.body);
    if (state instanceof Error) return res.status(400).send(state.message);

    return res.status(200).send(state);
});

router.delete('/:id', verifyToken, verifyRole('Admin'), async (req, res) => {
    const deletedState = await stateController.delete(req.params.id);
    if (deletedState instanceof Error)
        return res.status(401).send(deletedState.message);

    return res.status(200).send(deletedState);
});

module.exports = router;
