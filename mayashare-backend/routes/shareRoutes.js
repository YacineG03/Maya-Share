const express = require('express');
const router = express.Router();
const shareController = require('../controllers/shareController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/dossier', authMiddleware, shareController.shareDossier);
router.get('/:lienPartage/:motDePasse?', shareController.accessSharedDossier);

module.exports = router;