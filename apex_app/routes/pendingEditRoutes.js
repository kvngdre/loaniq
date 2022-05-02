const router = require('express').Router();
const verifyRole = require('../middleware/verifyRole');
const verifyToken = require('../middleware/verifyToken');
const pendingEditValidators = require('../validators/pendingEditValidator');
const pendingEditController = require('../controllers/pendingEditController');

router.get('/', verifyToken, verifyRole(['admin', 'credit']), async (req, res) => {
    // TODO: should a loanAgent be able to call these endpoints?
    const pendingEdits = await pendingEditController.getAll(req.user);
    if(pendingEdits.length === 0) return res.status(404).send('No pending edits.');

    return res.status(200).send(pendingEdits);
});

router.get('/:id', verifyToken, verifyRole(['admin', 'credit']), async (req, res) => {
    const pendingEdit = await pendingEditController.getOne(req.params.id, req.user);
    if(pendingEdit.length === 0) return res.status(404).send('document not found.');

    return res.status(200).send(pendingEdit);
});

router.post('/', verifyToken, verifyRole('loanAgent'), async (req, res) => {
    const { error } = pendingEditValidators.create(req.body);
    if(error) return res.status(400).send(error.details[0].message);

    const newEdit = await pendingEditController.create(req.user, req.body.documentId, req.body.type, req.body.alteration);
    if(newEdit instanceof Error) return res.status(400).send(newEdit.message);
    
    return res.status(201).send(newEdit);
});

router.patch('/:id', verifyToken, verifyRole(['admin', 'credit']), async (req, res) => {
    const { error } = pendingEditValidators.edit(req.body);
    if(error) return res.status(400).send(error.details[0].message);

    const result = await pendingEditController.updateStatus(req.params.id, req.user, req.body)
    return res.status(200).send(result);

});

module.exports = router;