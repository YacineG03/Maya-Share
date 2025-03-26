const express = require('express');
const router = express.Router();
const imageController = require('../controllers/imageController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware, imageController.uploadImage);
router.get('/:id', authMiddleware, imageController.getImage);
router.get('/', authMiddleware, imageController.getImagesByUser);

module.exports = router;