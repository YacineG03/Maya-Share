const express = require('express');
const router = express.Router();
const traceController = require('../controllers/traceController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, traceController.getHistory);

module.exports = router;