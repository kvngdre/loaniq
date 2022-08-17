const router = require('express').Router();
const debug = require('debug')('app:bankRoutes');
const verifyRole  = require('../middleware/verifyRole');
const verifyToken = require('../middleware/verifyToken');
const bankValidators = require('../validators/bankValidator')
const bankController = require('../controllers/banksController');


router.post('/', verifyToken, verifyRole('origin-master'), async (req, res) => {
    const { error } = bankValidators.validateCreation(req.body);
    if(error) return res.status(400).send(error.details[0].message);

    const newBank = await bankController.create(req.body);
    if(newBank instanceof Error) return res.status(400).send(newBank.message);
    
    return res.status(201).send(newBank);
});

router.get('/', verifyToken, verifyRole(['origin-master','Lender', 'Admin', 'Credit', 'Operations', 'Loan Agent']), async (req, res) => {
    const banks = await bankController.getAll();
    if(banks instanceof Error) return res.status(404).send(banks.message);

    return res.status(200).send(banks);
});

router.get('/:id', verifyToken, verifyRole(['origin-master','Lender', 'Admin']), async (req, res) => {
    const bank = await bankController.getOne(req.params.id);
    if(bank instanceof Error) return res.status(400).send('Bank not found.');

    return res.status(200).send(bank);
});

router.patch('/:id', verifyToken, verifyRole(['Admin', 'origin-master']), async (req, res) => {
    const { error } = bankValidators.validateEdit(req.body);
    if(error) return res.status(400).send(error.details[0].message);
    
    const bank = await bankController.update(req.params.id, req.body); 
    if(bank instanceof Error) return res.status(400).send(banks.message);
    
    return res.status(200).send(bank);
});


router.delete('/:id', verifyToken, verifyRole('origin-master'), async (req, res) => {
    const deletedBank = await bankController.delete(req.params.id);
    if(deletedBank instanceof Error) return res.status(401).send(deletedBank.message);

    return res.status(200).send(deletedBank);
});

module.exports = router;
