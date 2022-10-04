const pendingEditController = require('../controllers/pendingEditController');
const pendingEditValidators = require('../validators/pendingEditValidator');
const router = require('express').Router();
const ServerError = require('../errors/serverError');
const verifyRole = require('../middleware/verifyRole');
const verifyToken = require('../middleware/verifyToken');

router.post('/', verifyToken, async (req, res) => {
    const { error } = pendingEditValidators.create(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const newEditRequest = await pendingEditController.create(
        req.user,
        req.body
    );
    if (newEditRequest instanceof ServerError)
        return res
            .status(newEditRequest.errorCode)
            .send(newEditRequest.message);

    return res.status(201).send(newEditRequest);
});

router.get('/', verifyToken, async (req, res) => {
    const editRequests = await pendingEditController.getAll(req.user);
    if (editRequests instanceof ServerError)
        return res.status(editRequests.errorCode).send(editRequests.message);

    return res.status(200).send(editRequests);
});

router.get('/:id', verifyToken, async (req, res) => {
    const editRequest = await pendingEditController.getOne(
        req.params.id,
        req.user
    );
    if (editRequest instanceof ServerError)
        return res.status(editRequest.errorCode).send(editRequest.message);

    return res.status(200).send(editRequest);
});

router.patch('/:id', verifyToken, async (req, res) => {
    const { error } = pendingEditValidators.update(req.user, req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const editRequest = await pendingEditController.update(
        req.params.id,
        req.user,
        req.body
    );
    if (editRequest instanceof ServerError)
        return res.status(editRequest.errorCode).send(editRequest.message);

    return res.status(200).send(editRequest);
});

router.delete('/:id', verifyToken, async (req, res) => {
    const editRequest = await pendingEditController.delete(
        req.params.id,
        req.user
    );
    if (editRequest instanceof ServerError)
        return res.status(editRequest.errorCode).send(editRequest.message);

    return res.status(204).send(editRequest);
});

module.exports = router;
