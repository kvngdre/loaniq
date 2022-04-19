const userViewController  = require('../controllers/userController');
const userValidator = require('../validators/userValidator');
const router = require('express').Router();
const debug = require('debug')('app:routes');

router.get('/', async (req, res) => {
    const users = await userViewController.getAll();
    if(users.length === 0) return res.status(400).send('No users registered.');

    return res.status(200).send(users);
});



module.exports = router;
