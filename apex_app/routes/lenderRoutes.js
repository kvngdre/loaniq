const router = require('express').Router();
const validateLender = require('../validators/lenderValidator');
const lenderViewController = require('../controllers/lenderController');


router.post('/create', async (req, res) => {
    const { error } = validateLender.creation(req.body);
    if(error) return res.status(400).send(error.details[0].message);

    const createdLender = await lenderViewController.createLender(req.body);
    if(createdLender instanceof Error) return res.status(400).send(createdLender.message);

    //TODO: generate url.

    res.status(201).send(createdLender);
});

router.put('/:id', async (req, res) => {
    const { error } = validateLender.update(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const lender = await lenderViewController.update(req.params.id, req.body);
    if (lender instanceof Error) return res.status(404).send(lender.message);
    
    res.status(200).send(lender);
});

router.delete('/', async (req, res) => {
    const lender = await lenderViewController.delete(req.body);

    if (lender instanceof Error) return res.status(400).send(lender.message);

    res.status(200).send(lender);
});

module.exports = router;