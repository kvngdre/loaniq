const router = require('express').Router();
const lenderValidators = require('../validators/lenderValidator');
const lenderViewController = require('../controllers/lenderController');


router.post('/create-lender', async (req, res) => {
    const { error } = lenderValidators.creation(req.body);
    if(error) return res.status(400).send(error.details[0].message);

    const lender = await lenderViewController.createLender(req.body);
    if(lender instanceof Error) return res.status(400).send(lender.message);

    //TODO: generate lender url.
    res.status(201).send(lender);
});

router.post('/create-admin/:id', async (req, res) => {
    const { error } = lenderValidators.adminCreation(req.body);
    if(error) return res.status(400).send(error.details[0].message);

    const adminUser = await lenderViewController.createAdmin(req.params.id, req.body);
    if(adminUser instanceof Error) return res.status(400).send(adminUser.message);

    res.status(201).send(adminUser);
});

router.patch('/:id', async (req, res) => {
    const { error } = lenderValidators.update(req.body);
    if(error) return res.status(400).send(error.details[0].message);

    const lender = await lenderViewController.update(req.params.id, req.body);
    if(lender instanceof Error) return res.status(404).send(lender.message);
    
    res.status(200).send(lender);
});

router.delete('/', async (req, res) => {
    const lender = await lenderViewController.delete(req.body);

    if(lender instanceof Error) return res.status(400).send(lender.message);

    res.status(200).send(lender);
});

module.exports = router;
