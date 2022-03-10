const router = require('express').Router();
const validateLender = require('../validators/lenderValidator');
const lenderViewController = require('../controllers/lenderController');


router.post('/create', async (req, res) => {
    
    const { error } = validateLender.creation(req.body);
    if(error) return res.status(400).send(error.details[0].message);

    const createdLender = await lenderViewController.createLender(req.body);
    if(createdLender instanceof Error) return res.status(400).send(createdLender.message);

    //TODO: generate url.

    res.status(200).send(createdLender);
});

router.post('/edit', async (req, res) => {
    const edit = await lenderViewController.update(req.body);

    if (edit instanceof Error) return res.status(400).send(edit.message);
    
    res.status(200).send(edit);
});

router.post('/delete', async (req, res) => {
    const lender = await lenderViewController.delete(req.body);

    if (lender instanceof Error) return res.status(400).send(lender.message);

    res.status(200).send(lender);
});

module.exports = router;