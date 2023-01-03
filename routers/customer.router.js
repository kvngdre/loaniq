const { roles } = require('../utils/constants');
const auth = require('../middleware/verifyToken');
const customerController = require('../controllers/customer.controller');
const router = require('express').Router();
const ServerError = require('../errors/serverError');
const upload = require('../middleware/fileUpload');
const validateObjectId = require('../middleware/validateObjectId');
const verifyRole = require('../middleware/verifyRole');

const { admin, agent, master, operations, owner } = roles;

router.post(
    '/new',
    [auth, verifyRole(agent, owner, operations, master), validateObjectId],
    async (req, res) => {
        const response = await customerController.create(req.user, req.body);
        return res.status(response.code).json(response.payload);
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
 * @queryParam field Fields to include. Defaults to all fields.
 */
router.get('/', [auth], async (req, res) => {
    console.log(req.query);
    const response = await customerController.getCustomers(req.user, req.query);
    return res.status(response.code).json(response.payload);
});

router.get('/:customerId', [auth, validateObjectId], async (req, res) => {
    const response = await customerController.getCustomers(
        req.params.customerId
    );
    return res.status(response.code).json(response.payload);
});

router.patch('/:customerId', [auth, validateObjectId], async (req, res) => {
    const response = await customerController.updateCustomer(
        req.params.customerId,
        req.user,
        req.body
    );
    return res.status(response.code).send(response.payload);
});

router.delete(
    '/:customerId',
    [auth, verifyRole(admin, owner, operations, master), validateObjectId],
    async (req, res) => {
        const response = await customerController.delete(req.params.customerId);
    }
);

module.exports = router;
