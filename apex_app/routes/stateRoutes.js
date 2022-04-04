const _ = require('lodash');
const router = require('express').Router();
const debug = require('debug')('app:stateRoutes');
const { admin } = require('googleapis/build/src/apis/admin');
const stateController = require('../controllers/stateController');
const State  = require('../models/stateModel');
const verifyRole  = require('../middleware/verifyRole');
const verifyToken = require('../middleware/verifyToken');



router.post('/create-state', verifyToken, verifyRole('admin'), async (req, res) => {
    
        const result = await stateController.create(req.body);
    if(result instanceof Error) { return res.status(400).send(result.message); };
    
    res.status(201).send(result.newState);
});

router.put('/:id', verifyToken, verifyRole('admin'), async (req, res) => {
      const state = await stateController.update(req.params.id, req.body); 
    if(state instanceof Error) return res.status(400).send(state.message);

    res.status(200).send({message: 'Update Successful', state: state})
});


router.delete('/:id', verifyToken, verifyRole('admin'), async (req, res) => {
    const result = await stateController.delete(req.params.id);
    if(result instanceof Error) return res.status(401).send(result.message);

    res.status(200).send(result);
});


module.exports = router;
