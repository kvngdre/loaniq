const router = require('express').Router();
const ObjectId = require('mongoose').Types.ObjectId;
const debug = require('debug')('app:customerRoutes');
const verifyRole  = require('../middleware/verifyRole');
const verifyToken = require('../middleware/verifyToken');
const customerValidators = require('../validators/customerValidator');
const customerViewController = require('../controllers/customerController');

router.get('/', verifyToken, verifyRole(['admin', 'credit', 'loanAgent']), async (req, res) => {
    const customers = await customerViewController.getAll(req.user);
    if(customers.length === 0) return res.status(404).send('No customers found.');

    res.status(200).send(customers);
});

router.get('/:id', verifyToken, async (req, res) => {
    const customer = await customerViewController.get( req.user, ObjectId.isValid(req.params.id) ? { _id: req.params.id } : { 'employmentInfo.ippis': req.params.id } );
    if(customer instanceof Error) return res.status(404).send(customer.message);

    res.status(200).send(customer);
});

router.post('/', verifyToken, verifyRole(['admin', 'credit', 'loanAgent']), async (req, res) => {
    const { error } = customerValidators.validateCreation(req.body);
    if(error) return res.status(400).send(error.details[0].message);
    
    const newCustomer = await customerViewController.create(req);
    if(newCustomer instanceof Error) { return res.status(400).send(result.message); };
    
    res.status(201).send(newCustomer);
});

// TODO: have front end ensure no empty obj is passed.
router.patch('/:id', verifyToken, verifyRole(['admin', 'credit']), async (req, res) => {
    const { error } = customerValidators.validateEdit(req.body);
    if(error) return res.status(400).send(error.details[0].message);

    const customer = await customerViewController.update(req.params.id, req.body);
    if(customer instanceof Error) return res.status(400).send(customer.message);

    res.status(200).send({message: 'Update Successful', customer})
});

module.exports = router;
