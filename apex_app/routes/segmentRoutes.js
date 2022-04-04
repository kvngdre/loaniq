const _ = require('lodash');
const router = require('express').Router();
const debug = require('debug')('app:segmentRoutes');
const { admin } = require('googleapis/build/src/apis/admin');
const segmentController = require('../controllers/segmentController');
const Segment  = require('../models/segmentModel');
const verifyRole  = require('../middleware/verifyRole');
const verifyToken = require('../middleware/verifyToken');



router.post('/create-segment', verifyToken, verifyRole('admin'), async (req, res) => {
    
        const result = await segmentController.create(req.body);
    if(result instanceof Error) { return res.status(400).send(result.message); };
    
    res.status(201).send(result.newSegment);
});

router.put('/:id', verifyToken, verifyRole('admin'), async (req, res) => {
      const segment = await segmentController.update(req.params.id, req.body); 
    if(segment instanceof Error) return res.status(400).send(segment.message);

    res.status(200).send({message: 'Update Successful', segment: segment})
});


router.delete('/:id', verifyToken, verifyRole('admin'), async (req, res) => {
    const result = await segmentController.delete(req.params.id);
    if(result instanceof Error) return res.status(401).send(result.message);

    res.status(200).send(result);
});


module.exports = router;
