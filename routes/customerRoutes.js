const router = require('express').Router();
const verifyRole = require('../middleware/verifyRole');
const verifyToken = require('../middleware/verifyToken');
const uploadMultipleFiles = require('../middleware/fileUpload');
const customerValidators = require('../validators/customerValidator');
const customerController = require('../controllers/customerController');

// Create a customer
router.post(
    '/',
    verifyToken,
    verifyRole(['Admin', 'Credit', 'Loan Agent']),
    uploadMultipleFiles,
    async (req, res) => {
        // TODO: add to pending for agent
        const { error } = customerValidators.validateCreation(req.body);
        if (error) return res.status(400).send(error.details[0].message);

        const newCustomer = await customerController.create(req);
        if (newCustomer.errorCode || newCustomer instanceof Error)
            return res
                .status(newCustomer.errorCode || 500)
                .send(newCustomer.message);

        return res.status(201).send(newCustomer);
    }
);

// Get all customers
router.post(
    '/all',
    verifyToken,
    verifyRole(['Lender', 'Admin', 'Credit', 'Loan Agent']),
    async (req, res) => {
        const customers = await customerController.getAll(req.user, req.body);
        if (customers.errorCode || customers instanceof Error)
            return res
                .status(customers.errorCode || 500)
                .send(customers.message);

        return res.status(200).send(customers);
    }
);

// Get one customer
router.get(
    '/:id',
    verifyToken,
    verifyRole(['Lender', 'Admin', 'Credit', 'Loan Agent']),
    async (req, res) => {
        const customer = await customerController.getOne(req.params.id);
        if (customer.errorCode || customer instanceof Error)
            return res.status(customer.errorCode || 500).send(customer.message);

        return res.status(200).send(customer);
    }
);

// Get data for customer creation
router.post(
    '/customer-booking',
    verifyToken,
    verifyRole(['Loan Agent']),
    async (req, res) => {
        const result = await customerController.fetchCustomerCreation(
            req.user,
            req.body.fromDate
        );
        if (result instanceof Error)
            return res.status(400).send(result.message);

        return res.status(200).send(result);
    }
);

// Edit a customer
router.patch(
    '/:id',
    verifyToken,
    verifyRole(['Admin', 'Credit', 'Loan Agent']),
    async (req, res) => {
        if (Object.entries(req.body).length == 0) return res.sendStatus(400);

        const { error } = customerValidators.validateEdit(req.body);
        if (error) return res.status(400).send(error.details[0].message);

        const editedCustomer = await customerController.update(
            req.params.id,
            req.user,
            req.body
        );
        if (editedCustomer.errorCode || editedCustomer instanceof Error)
            return res
                .status(editedCustomer.errorCode || 500)
                .send(editedCustomer.message);

        return res.status(200).send(editedCustomer);
    }
);

module.exports = router;
