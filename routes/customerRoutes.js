const router = require('express').Router();
const verifyRole = require('../middleware/verifyRole');
const verifyToken = require('../middleware/verifyToken');
const { DateTime } = require('luxon');
const uploadMultipleFiles = require('../middleware/fileUpload');
const customerValidators = require('../validators/customerValidator');
const customerController = require('../controllers/customerController');

router.post(
    '/',
    verifyToken,
    verifyRole(['Admin', 'Credit', 'Loan Agent']),
    uploadMultipleFiles,
    async (req, res) => {
        console.log(DateTime.now().minus({'years': 21}).toFormat('yyyy-MM-dd'))
        console.log(DateTime.now().minus({'years': 21}).toString())
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

router.get(
    '/',
    verifyToken,
    verifyRole(['Lender', 'Admin', 'Credit', 'Loan Agent']),
    async (req, res) => {
        const customers = await customerController.getAll(req.user, req.body);
        if (customers.errorCode || customers instanceof Error)
            return res.status(customers.errorCode || 500).send(customers.message);

        return res.status(200).send(customers);
    }
);

router.get(
    '/:id',
    verifyToken,
    verifyRole(['Lender', 'Admin', 'Credit', 'Loan Agent']),
    async (req, res) => {
        const customer = await customerController.getOne(req.params.id);
        if (customer instanceof Error)
            return res.status(404).send(customer.message);

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
        if (result instanceof Error)
            return res.status(400).send(result.message);

        return res.status(200).send(result);
    }
);

router.patch(
    '/:id',
    verifyToken,
    verifyRole(['Admin', 'Credit', 'Loan Agent']),
    async (req, res) => {
        if (Object.entries(req.body).length == 0) return res.sendStatus(400);

        const { error } = customerValidators.validateEdit(req.body);
        if (error) return res.status(400).send(error.details[0].message);

        const customerEditObject = await customerController.update(
            req.params.id,
            req.user,
            req.body
        );
        if (customerEditObject instanceof Error)
            return res.status(400).send(customerEditObject.message);

        return res.status(200).send(customerEditObject);
    }
);

module.exports = router;
