const router = require('express').Router();
const debug = require('debug')('app:routes');
const userValidator = require('../validators/userValidator');
const userController  = require('../controllers/userController');

router.get('/', async (req, res) => {
    const users = await userController.getAll();
    if(users.length === 0) return res.status(400).send('No users registered.');

    return res.status(200).send(users);
});



module.exports = router;
