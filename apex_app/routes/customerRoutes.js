const router = require('express').Router();
const ObjectId = require('mongoose').Types.ObjectId;
const debug = require('debug')('app:customerRoutes');
const verifyRole  = require('../middleware/verifyRole');
const verifyToken = require('../middleware/verifyToken');
const customerValidators = require('../validators/customerValidator');
const customerController = require('../controllers/customerController');

router.get('/', verifyToken, verifyRole(['lender', 'admin', 'credit', 'loanAgent']), async (req, res) => {
    const customers = await customerController.getAll(req.user);
    if(customers.length === 0) return res.status(404).send('No customers found.');

    return res.status(200).send(customers);
});

router.get('/:id', verifyToken, verifyRole(['lender', 'admin', 'credit', 'loanAgent']), async (req, res) => {
    // TODO: add all
    const customer = await customerController.get( req.user, ObjectId.isValid(req.params.id) ? { _id: req.params.id } : { ippis: req.params.id } );
    if(customer instanceof Error) return res.status(404).send(customer.message);

    return res.status(200).send(customer);
});

router.post('/', verifyToken, verifyRole(['admin', 'credit', 'loanAgent']), async (req, res) => {
    // TODO: add to pending for agent
    const { error } = customerValidators.validateCreation(req.body);
    if(error) return res.status(400).send(error.details[0].message);
    
    const newCustomer = await customerController.create(req);
    if(newCustomer instanceof Error) { return res.status(400).send(newCustomer.message); };
    
    return res.status(201).send(newCustomer);
});

// TODO: have front end ensure no empty obj is passed.
router.patch('/:id', verifyToken, verifyRole(['admin', 'credit']), async (req, res) => {
    const { error } = customerValidators.validateEdit(req.body);
    if(error) return res.status(400).send(error.details[0].message);

    const customer = await customerController.update(req.params.id, req.body);
    if(customer instanceof Error) return res.status(400).send(customer.message);

    return res.status(200).send({message: 'Update Successful', customer})
});

module.exports = router;
