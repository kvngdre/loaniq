const router = require('express').Router();
const creditViewController = require('../controllers/creditController');


router.get('/:id', (req, res) => {
    const loan = creditViewController.getLoan(req.body);
    if(loan instanceof Error) return res.status(400).send(loan.message); 
});

module.exports = router;