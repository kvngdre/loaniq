const _ = require('lodash');
const router = require('express').Router();
const debug = require('debug')('app:segmentRoutes');
const { admin } = require('googleapis/build/src/apis/admin');
const banksController = require('../controllers/banksController');
const Banks  = require('../models/bankModel');
const verifyRole  = require('../middleware/verifyRole');
const verifyToken = require('../middleware/verifyToken');



router.post('/create-banks', verifyToken, verifyRole('admin'), async (req, res) => {
    
        const result = await banksController.create(req.body);
    if(result instanceof Error) { return res.status(400).send(result.message); };
    
    res.status(201).send(result.newBanks);
});

router.put('/:id', verifyToken, verifyRole('admin'), async (req, res) => {
      const banks = await banksController.update(req.params.id, req.body); 
    if(banks instanceof Error) return res.status(400).send(banks.message);

    res.status(200).send({message: 'Update Successful', banks: banks})
});


router.delete('/:id', verifyToken, verifyRole('admin'), async (req, res) => {
    const result = await banksController.delete(req.params.id);
    if(result instanceof Error) return res.status(401).send(result.message);

    res.status(200).send(result);
});


module.exports = router;
