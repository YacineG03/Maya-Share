const express = require('express');
const router = express.Router();
const dossierController = require('../controllers/dossierController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware, dossierController.createDossier);
router.get('/', authMiddleware, dossierController.getDossiersByPatient);
router.get('/patient/:idPatient', authMiddleware, dossierController.getDossiersByPatient);
router.get('/medecin', authMiddleware, dossierController.getDossiersByMedecin);
router.put('/:id', authMiddleware, dossierController.updateDossier);
router.get('/:idDossier/images', authMiddleware, dossierController.getImagesByDossier);

module.exports = router;