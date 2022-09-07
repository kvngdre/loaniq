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
        // TODO: pass the lender id from guest request
        const { error } = customerValidators.customerCreation(req.body);
        if (error) return res.status(400).send(error.details[0].message);

        const newCustomer = await customerController.create(req.body, req.user);
        if (newCustomer.hasOwnProperty('errorCode'))
            return res.status(newCustomer.errorCode).send(newCustomer.message);

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
        if (customers.hasOwnProperty('errorCode'))
            return res.status(customers.errorCode).send(customers.message);

        return res.status(200).send(customers);
    }
);

// Get one customer
router.get(
    '/:id',
    verifyToken,
    verifyRole(['Lender', 'Admin', 'Credit', 'Loan Agent']),
    async (req, res) => {
        const customer = await customerController.getOne(
            req.params.id,
            req.user
        );
        if (customer.hasOwnProperty('errorCode'))
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
        if (result.hasOwnProperty('errorCode'))
            return res.status(result.errorCode).send(result.message);

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

        const customer = await customerController.update(
            req.params.id,
            req.user,
            req.body
        );
        if (customer.hasOwnProperty('errorCode'))
            return res.status(customer.errorCode).send(customer.message);

        return res.status(200).send(customer);
    }
);

module.exports = router;
