const router = require('express').Router();
const debug = require('debug')('app:segmentRoutes');
const verifyRole  = require('../middleware/verifyRole');
const verifyToken = require('../middleware/verifyToken');
const segmentValidators = require('../validators/segmentValidator');
const segmentController = require('../controllers/segmentController');


router.post('/', verifyToken, verifyRole(['origin-master']), async (req, res) => {
    const { error } = segmentValidators.validateCreation(req.body);
    if(error) return res.status(400).send(error.details[0].message);

    const newSegment = await segmentController.create(req.body);
    if(newSegment instanceof Error) return res.status(400).send(newSegment.message);
    
    return res.status(201).send(newSegment);
});

router.get('/', verifyToken, verifyRole(['origin-master','lender', 'admin']), async (req, res) => {
    const segments = await segmentController.getAll();
    if(segments.length === 0) return res.status(404).send('No segments.');

    return res.status(200).send(segments);
});

router.get('/:id', verifyToken, verifyRole(['origin-master', 'lender', 'admin']), async (req, res) => {
    const segment = await segmentController.get(req.params.id);
    if(segment instanceof Error) return res.status(400).send(segment.message);

    return res.status(200).send(segment);
});

router.patch('/:id', verifyToken, verifyRole(['origin-master']), async (req, res) => {
    const { error } = segmentValidators.validateEdit(req.body);
    if(error) return res.status(400).send(error.details[0].message);

    const segment = await segmentController.update(req.params.id, req.body);     
    if(segment instanceof Error) return res.status(400).send(segment.message);

    return res.status(200).send(segment);
});

router.delete('/:id', verifyToken, verifyRole(['origin-master']), async (req, res) => {
    const deletedSegment = await segmentController.delete(req.params.id);
    if(deletedSegment instanceof Error) return res.status(401).send(deletedSegment.message);

    return res.status(200).send(deletedSegment);
});


module.exports = router;
