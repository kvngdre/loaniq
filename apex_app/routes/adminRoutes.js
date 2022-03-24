const router = require('express').Router();
const User = require('../models/userModel');
const debug = require('debug')('app:adminRoutes');
const verifyRole  = require('../middleware/verifyRole');
const verifyToken = require('../middleware/verifyToken');
const adminValidator = require('../validators/userValidator');
const userViewController = require('../controllers/userController');
const adminViewController  = require('../controllers/userController');
const customerViewController = require('../controllers/customerController');

router.get('/users', verifyToken, verifyRole('admin'),  async (req, res) => {
    const users = await userViewController.getAll();
    if(users.length === 0) return res.status(404).send('No admins registered.');

    res.status(200).send(users);
});

router.get('/customers', verifyToken, verifyRole('admin'), async (req, res) => {
    const customers = await customerViewController.getAll();
    if(customers.length === 0) return res.status(404).send('No customers found.')

    res.status(200).send(customers);
});

router.post('/create-user', verifyToken, verifyRole('admin'), async (req, res) => {
    // validate user data
    res.redirect(307, 'http://localhost:8480/api/users/register');
});

router.put('/users/:id', verifyToken, verifyRole('admin'), (req, res) => {

});

router.delete('/users/:id', verifyToken, verifyRole('admin'),  async (req, res) => {
    const user = await userViewController.delete(req.params.id);
    if(user instanceof Error) return res.status(401).send(user.message);

    res.status(200).send(user);
});

module.exports = router;
