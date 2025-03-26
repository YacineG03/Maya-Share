const express = require('express');
const router = express.Router();
const shareController = require('../controllers/shareController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware, shareController.shareImage);
router.get('/:lienPartage/:motDePasse?', shareController.accessSharedImage);

module.exports = router;