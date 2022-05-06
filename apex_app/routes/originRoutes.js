const router = require('express').Router();
const debug = require('debug')('app:originRoutes');
const verifyRole = require('../middleware/verifyRole');
const verifyToken = require('../middleware/verifyToken');
const originValidators = require('../validators/originValidator');
const originController = require('../controllers/originController');


router.post('/', verifyToken, verifyRole('origin-master'), async (req, res) => {
    const { error } = originValidators.create(req.body);
    if(error) return res.status(400).send(error.details[0].message);

    const newCustomer = await originController.create(req.body);
    if(newCustomer instanceof Error) return res.status(400).send(newCustomer.message);

    return res.status(201).send(newCustomer);
});

router.get('/', verifyToken, verifyRole('origin-master'), async (req, res) => {
    const customers = await originController.getAll(req.body);
    if(customers.length === 0) return res.status(404).send('No customers found.');

    return res.status(200).send(customers);
});

router.get('/one', verifyToken, verifyRole('origin-master'), async (req, res) => {
    const customer = await originController.getOne(req.body);
    if(!customer) return res.status(404).send('No customer found');

    return res.status(200).send(customer);
});

router.patch('/:id', verifyToken, verifyRole('origin-master'), async (req, res) => {
    const { error } = originValidators.edit(req.body);
    if(error) return res.status(400).send(error.details[0].message);

    const updatedCustomer = await originController.edit(req.params.id, req.body);
    if(updatedCustomer instanceof Error) return res.status(400).send(updatedCustomer.message);

    return res.status(200).send(updatedCustomer);
});

router.delete('/:id', verifyToken, verifyRole('origin-master'), async (req, res) => {
    const deletedCustomer = await originController.delete(req.params.id);
    if(deletedCustomer instanceof Error) return res.status(404).send(deletedCustomer.message);

    return res.status(204).send(deletedCustomer);
});

module.exports = router;