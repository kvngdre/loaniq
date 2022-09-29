const router = require('express').Router();
const verifyRole = require('../middleware/verifyRole');
const verifyToken = require('../middleware/verifyToken');
const pendingEditValidators = require('../validators/pendingEdit');
const pendingEditController = require('../controllers/pendingEditController');

router.post(
    '/',
    verifyToken,
    verifyRole(['Admin', 'Operations', 'Credit', 'Loan Agent']),
    async (req, res) => {
        const { error } = pendingEditValidators.create(req.body);
        if (error) return res.status(400).send(error.details[0].message);

        const newEditDoc = await pendingEditController.create(req.user, req.body);
        if (newEditDoc.hasOwnProperty('errorCode'))
            return res.status(newEditDoc.errorCode).send(newEditDoc.message);

        return res.status(201).send(newEditDoc);
    }
);

router.get(
    '/',
    verifyToken,
    verifyRole(['Admin', 'Operations', 'Credit', 'Loan Agent']),
    async (req, res) => {
        const editDocs = await pendingEditController.getAll(req.user);
        if (editDocs.hasOwnProperty('errorCode'))
            return res.status(editDocs.errorCode).send(editDocs.message);

        return res.status(200).send(editDocs);
    }
);

router.get(
    '/:id',
    verifyToken,
    verifyRole(['Admin', 'Operations', 'Credit', 'Loan Agent']),
    async (req, res) => {
        const editDoc = await pendingEditController.getOne(
            req.params.id,
            req.user
        );
        if (editDoc.hasOwnProperty('errorCode'))
            return res.status(editDoc.errorCode).send('document not found.');

        return res.status(200).send(editDoc);
    }
);

router.patch(
    '/:id',
    verifyToken,
    async (req, res) => {
        const { error } = pendingEditValidators.update(req.user, req.body);
        if (error) return res.status(400).send(error.details[0].message);

        const modifiedDoc = await pendingEditController.update(
            req.params.id,
            req.user,
            req.body
        );
        if (modifiedDoc.hasOwnProperty('errorCode'))
            return res.status(modifiedDoc.errorCode).send(modifiedDoc.message);

        return res.status(200).send(modifiedDoc);
    }
);

router.delete('/:id', verifyToken, async (req, res) => {
    const response = await pendingEditController.delete(
        req.params.id,
        req.user
    );
    if (response.hasOwnProperty('errorCode'))
        return res.status(response.errorCode).send(response.message);

    return res.status(204).send(response);
});

module.exports = router;
