const router = require('express').Router();
const concatErrorMsg = require('../utils/concatMsg');
const verifyRole = require('../middleware/verifyRole');
const verifyToken = require('../middleware/verifyToken');
const originValidators = require('../validators/originValidator');
const originController = require('../controllers/originController');

router.post('/', verifyToken, verifyRole('Master'), async (req, res) => {
    const { error } = originValidators.create(req.body);
    if (error) {
        const errorResponse = concatErrorMsg(error.details);
        return res.status(400).send(errorResponse);
    }

    const staff = await originController.create(req.body);
    if (staff.hasOwnProperty('errorCode'))
        return res.status(staff.errorCode).send(staff.message);

    return res.status(201).send(staff);
});

// Get all staff
router.post('/all', verifyToken, verifyRole('Master'), async (req, res) => {
    const staff = await originController.getAll(req.body);
    if (staff.hasOwnProperty('errorCode'))
        return res.status(staff.errorCode).send(staff.message);

    return res.status(200).send(staff);
});

router.get('/:id', verifyToken, async (req, res) => {
    const staff = await originController.getOne(req.params.id);
    if (staff.hasOwnProperty('errorCode'))
        return res.status(staff.errorCode).send(staff.message);

    return res.status(200).send(staff);
});

router.patch('/:id', verifyToken, verifyRole('Master'), async (req, res) => {
    const { error } = originValidators.update(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const staff = await originController.update(req.params.id, req.body);
    if (staff.hasOwnProperty('errorCode'))
        return res.status(staff.errorCode).send(staff.message);

    return res.status(200).send(staff);
});

router.delete('/:id', verifyToken, verifyRole('Master'), async (req, res) => {
    const staff = await originController.delete(req.params.id);
    if (staff.hasOwnProperty('errorCode'))
        return res.status(404).send(staff.message);

    return res.status(204).send(staff);
});

module.exports = router;
