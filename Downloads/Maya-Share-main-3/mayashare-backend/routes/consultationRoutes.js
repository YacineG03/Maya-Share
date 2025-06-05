const express = require('express');
const router = express.Router();
const consultationController = require('../controllers/consultationController');
const authMiddleware = require('../middleware/authMiddleware');

// Créer une consultation
router.post('/', authMiddleware, consultationController.createConsultation);

// Récupérer les consultations d’un dossier
router.get('/dossier/:idDossier', authMiddleware, consultationController.getConsultationsByDossier);

// Mettre à jour une consultation
router.put('/:idConsultation', authMiddleware, consultationController.updateConsultation);

module.exports = router;
