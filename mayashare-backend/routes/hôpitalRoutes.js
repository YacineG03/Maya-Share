const express = require('express');
const router = express.Router();
const hôpitalController = require('../controllers/hôpitalController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware, hôpitalController.createHôpital);
router.get('/:id', authMiddleware, hôpitalController.getHôpital);
router.get('/', authMiddleware, hôpitalController.getAllHôpitaux);
router.put('/:id', authMiddleware, hôpitalController.updateHôpital);
router.delete('/:id', authMiddleware, hôpitalController.deleteHôpital);

module.exports = router;