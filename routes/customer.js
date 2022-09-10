const router = require('express').Router();
const concatErrorMsg = require('../utils/concatMsg');
const verifyRole = require('../middleware/verifyRole');
const verifyToken = require('../middleware/verifyToken');
const customerValidators = require('../validators/customer');
const customerController = require('../controllers/customer');
const uploadMultipleFiles = require('../middleware/fileUpload');

router.post(
    '/',
    verifyToken,
    verifyRole(['Admin', 'Credit', 'Loan Agent']),
    uploadMultipleFiles,
    async (req, res) => {
        // TODO: add to pending for agent
        // TODO: pass the lender id from guest request
        const { error } = customerValidators.create(req.body);
        if (error) {
            const errorResponse = concatErrorMsg(
                error.details[0].context.message
            );
            return res.status(400).send(errorResponse);
        }

        const customer = await customerController.create(req.user, req.body);
        if (customer.hasOwnProperty('errorCode'))
            return res.status(customer.errorCode).send(customer.message);

        return res.status(201).send(customer);
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
            return res.status(customer.errorCode).send(customer.message);

        return res.status(200).send(customer);
    }
);

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

router.patch(
    '/:id',
    verifyToken,
    verifyRole(['Admin', 'Credit', 'Loan Agent']),
    async (req, res) => {
        if (Object.entries(req.body).length == 0) return res.sendStatus(400);

        const { error } = customerValidators.update(req.body);
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

router.delete(
    '/:id',
    verifyToken,
    verifyRole(['Lender', 'Admin']),
    async (req, res) => {
        const response = await customerController.delete(
            req.user,
            req.params.id
        );
        if (response.hasOwnProperty('errorCode'))
            return res.status(response.errorCode).send(response.message);

        return res.status(204).send(response);
    }
);

module.exports = router;
