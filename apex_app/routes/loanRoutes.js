const loanViewController = require('../controllers/loanController');
const router = require('express').Router();

router.post('/create-request', async (req, res) => {
    const loanRequest = await loanViewController.createLoan(req.body);
    if (loanRequest instanceof Error) return res.status(400).send(loanRequest.message) ;

    res.status(200).send(loanRequest);
});

router.get('/', async (req, res) => {
    const loans = await loanViewController.getAll();
    if(loans instanceof Error) return loans.message;

    res.status(200).send(loans)
});

module.exports = router;