const router = require('express').Router();
const debug = require('debug')('app:routes');
const userValidator = require('../validators/userValidator');
const userViewController  = require('../controllers/userController');


router.get('/', async (req, res) => {
    const users = await userViewController.getAll();

    if(users.length === 0) return res.status(400).send('No users registered.');

    res.status(200).send(users);
});


module.exports = router;
