const { roles } = require('../utils/constants');
const concatErrorMsg = require('../utils/concatMsg');
const customerController = require('../controllers/customerController');
const customerValidators = require('../validators/customerValidator');
const router = require('express').Router();
const ServerError = require('../errors/serverError');
const upload = require('../middleware/fileUpload');
const verifyRole = require('../middleware/verifyRole');
const verifyToken = require('../middleware/verifyToken');
const validateObjectId = require('../middleware/validateObjectId');

router.post(
    '/',
    [
        verifyToken,
        verifyRole(roles.agent, roles.owner, roles.operations, roles.master),
        validateObjectId,
    ],
    async (req, res) => {
        const { value, error } = customerValidators.create(req.user, req.body);
        if (error) {
            const errorResponse = concatErrorMsg(
                error.details[0].context.message
            );
            return res.status(400).send(errorResponse);
        }

        const newCustomer = await customerController.create(req.user, value);
        if (newCustomer instanceof ServerError)
            return res.status(newCustomer.errorCode).send(newCustomer.message);

        return res.status(201).send(newCustomer);
    }
);

router.post(
    '/upload-docs',
    [upload.fields([{ name: 'passport' }, { name: 'idCard' }])],
    async (req, res) => {
        // FIXME: upload to s3
        console.log(req.files);
        return res.status(200).send('Docs uploaded');
    }
);

/**
 * @queryParam name Filter by name.
 * @queryParam min Filter by net pay. Min value.
 * @queryParam max Filter by net pay. Max value.
 * @queryParam minAge Filter by customer age. Min value.
 * @queryParam maxAge Filter by customer age. Max value.
 * @queryParam segment Filter by customer segment.
 * @queryParam state Filter by customer state of residence.
 * @queryParam sort Sort order. Defaults to 'first name'. [asc, desc, first, last]
 */
router.get('/', [verifyToken], async (req, res) => {
    const customers = await customerController.getAll(req.user, req.query);
    if (customers instanceof ServerError)
        return res.status(customers.errorCode).send(customers.message);

    return res.status(200).send(customers);
});

router.get('/:id', [verifyToken, validateObjectId], async (req, res) => {
    const customer = await customerController.getOne(req.params.id, req.user);
    if (customer instanceof ServerError)
        return res.status(customer.errorCode).send(customer.message);

    return res.status(200).send(customer);
});

router.patch('/:id', [verifyToken, validateObjectId], async (req, res) => {
    if (Object.entries(req.body).length == 0) return res.sendStatus(400);

    const { error } = customerValidators.update(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const customer = await customerController.update(
        req.params.id,
        req.user,
        req.body
    );
    if (customer instanceof ServerError)
        return res.status(customer.errorCode).send(customer.message);

    return res.status(200).send(customer);
});

router.delete(
    '/:id',
    [
        verifyToken,
        verifyRole(roles.admin, roles.owner, roles.operations, roles.master),
        validateObjectId,
    ],
    async (req, res) => {
        const response = await customerController.delete(
            req.params.id,
            req.user
        );
        if (response instanceof ServerError)
            return res.status(response.errorCode).send(response.message);

        return res.status(204).send(response);
    }
);

router.post(
    '/customer-booking',
    [verifyToken, verifyRole(roles.operations), validateObjectId],
    async (req, res) => {
        const response = await customerController.fetchCustomerCreation(
            req.user,
            req.body.fromDate
        );
        if (response instanceof ServerError)
            return res.status(response.errorCode).send(response.message);

        return res.status(200).send(response);
    }
);

module.exports = router;
