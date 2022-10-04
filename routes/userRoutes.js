const { roles } = require('../utils/constants');
const router = require('express').Router();
const ServerError = require('../errors/serverError');
const upload = require('../middleware/fileUpload');
const userController = require('../controllers/userController');
const userValidators = require('../validators/userValidator');
const verifyRole = require('../middleware/verifyRole');
const verifyToken = require('../middleware/verifyToken');

router.post(
    '/',
    verifyToken,
    verifyRole([roles.admin, roles.owner, roles.master]),
    async (req, res) => {
        const { error } = userValidators.create(req.body);
        if (error) return res.status(400).send(error.details[0].message);

        const newUser = await userController.create(req.user, req.body);
        if (newUser instanceof ServerError)
            return res.status(newUser.errorCode).send(newUser.message);

        return res.status(201).send(newUser);
    }
);

router.post('/upload-photo', upload.single('photo'), async (req, res) => {
    console.log(req.file);
    return res.status(200).send('Image uploaded');
});

/**
 * @queryParam name Filter by name.
 * @queryParam lenderId Filter by lender.
 * @queryParam role Filter by role.
 * @queryParam sort Field to sort by. Defaults to 'first name'.
 */
router.get('/', verifyToken, async (req, res) => {
    const users = await userController.getAll(req.user, req.query);
    if (users instanceof ServerError)
        return res.status(users.errorCode).send(users.message);

    return res.status(200).send(users);
});

/**
 * @queryParam email The user's email.
 */
router.get('/otp', async (req, res) => {
    const response = await userController.requestOtp(req.query.email);
    if (response instanceof ServerError)
        return res.status(response.errorCode).send(response.message);

    return res.status(200).send(response);
});

/**
 * @urlParam {string} id The id of the user.
 */
router.get(
    '/:id',
    verifyToken,
    verifyRole([roles.admin, roles.owner, roles.master]),
    async (req, res) => {
        const id = req.params.id !== undefined ? req.params.id : req.user.id;

        const user = await userController.getOne(req.params.id, req.user);
        if (user instanceof ServerError)
            return res.status(user.errorCode).send(user.message);

        return res.status(200).send(user);
    }
);

/**
 * @urlParam {string} id The id of the user.
 */
router.patch('/:id?', verifyToken, async (req, res) => {
    const { error } = userValidators.update(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const id = req.params.id !== undefined ? req.params.id : req.user.id;

    const user = await userController.update(id, req.user, req.body);
    if (user instanceof ServerError)
        return res.status(user.errorCode).send(user.message);

    return res.status(200).send(user);
});

router.post('/change-password', verifyToken, async (req, res) => {
    const { error } = userValidators.password(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const response = await userController.changePassword(req.user, req.body);
    if (response instanceof ServerError)
        return res.status(response.errorCode).send(response.message);

    return res.status(200).send(response);
});

/**
 * @urlParam {string} id The id of the user.
 */
router.get(
    '/reset-password/:id',
    verifyToken,
    verifyRole([roles.admin, roles.owner, roles.master]),
    async (req, res) => {
        const user = await userController.resetPassword(req.params.id);
        if (user instanceof ServerError)
            return res.status(user.errorCode).send(user.message);

        return res.status(200).send(user);
    }
);

/**
 * @urlParam {string} id The id of the user.
 */
router.post(
    '/deactivate/:id',
    verifyToken,
    verifyRole([roles.admin, roles.owner, roles.master]),
    async (req, res) => {
        const user = await userController.deactivate(
            req.params.id,
            req.user,
            req.body.password
        );
        if (user instanceof ServerError)
            return res.status(user.errorCode).send(user.message);

        return res.status(200).send(user);
    }
);

/**
 * @urlParam {string} id The id of the user.
 */
router.delete(
    '/:id',
    verifyToken,
    verifyRole([roles.owner, roles.master]),
    async (req, res) => {
        const deletedUser = await userController.delete(
            req.params.id,
            req.user,
            req.body.password
        );
        if (deletedUser instanceof Error)
            return res.status(deletedUser.errorCode).send(deletedUser.message);

        return res.status(204).send(deletedUser);
    }
);

module.exports = router;
