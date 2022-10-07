const { roles } = require('../utils/constants');
const router = require('express').Router();
const verifyRole = require('../middleware/verifyRole');
const verifyToken = require('../middleware/verifyToken');
const segmentValidators = require('../validators/segmentValidator');
const segmentController = require('../controllers/segmentController');
const ServerError = require('../errors/serverError');

router.post('/', verifyToken, verifyRole(roles.master), async (req, res) => {
    const { error } = segmentValidators.create(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const newSegment = await segmentController.create(req.body);
    if (newSegment instanceof ServerError)
        return res.status(400).send(newSegment.message);

    return res.status(201).send(newSegment);
});

router.get('/', verifyToken, async (req, res) => {
    const segments = await segmentController.getAll(req.query);
    if (segments instanceof ServerError)
        return res.status(404).send('No segments.');

    return res.status(200).send(segments);
});

router.get('/:id', verifyToken, async (req, res) => {
    const segment = await segmentController.get(req.params.id);
    if (segment instanceof ServerError)
        return res.status(400).send(segment.message);

    return res.status(200).send(segment);
});

router.patch(
    '/:id',
    verifyToken,
    verifyRole(roles.master),
    async (req, res) => {
        const { error } = segmentValidators.update(req.body);
        if (error) return res.status(400).send(error.details[0].message);

        const segment = await segmentController.update(req.params.id, req.body);
        if (segment instanceof ServerError)
            return res.status(400).send(segment.message);

        return res.status(200).send(segment);
    }
);

router.delete(
    '/:id',
    verifyToken,
    verifyRole(roles.master),
    async (req, res) => {
        const segment = await segmentController.delete(req.params.id);
        if (segment instanceof ServerError)
            return res.status(400).send(segment.message);

        return res.status(204).send(segment);
    }
);

module.exports = router;
