const router = require('express').Router();
const debug = require('debug')('app:customerRoutes');
const verifyRole  = require('../middleware/verifyRole');
const verifyToken = require('../middleware/verifyToken');
const customerViewController = require('../controllers/customerController');


router.get('/', verifyToken, verifyRole(['admin', 'credit', 'loanAgent']), async (req, res) => {
    const customers = await customerViewController.getAll();
    if(customers.length === 0) return res.status(404).send('No customers found.');

    res.status(200).send(customers);
});

router.get('/:id', verifyToken, verifyRole(['admin', 'credit', 'loanAgent']), async (req, res) => {
    const customer = await customerViewController.get(req.params.id);
    if(customer instanceof Error) return res.status(404).send(customer.message);

    res.status(200).send(customer);
});

router.delete('/customers/:id', verifyToken, verifyRole('admin'), async (req, res) => {
    const customer = await customerViewController.delete(req.params.id);
    if(customer instanceof Error) return res.status(401).send(customer.message);

    res.status(200).send(customer);

});

module.exports = router;