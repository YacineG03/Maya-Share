const express = require('express');
const router = express.Router();
const hôpitalController = require('../controllers/hôpitalController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware, hôpitalController.createHopital);
router.get('/:id', authMiddleware, hôpitalController.getHopital);
router.get('/', authMiddleware, hôpitalController.getAllHopitaux);
router.put('/:id', authMiddleware, hôpitalController.updateHopital);
router.delete('/:id', authMiddleware, hôpitalController.deleteHopital);

module.exports = router;