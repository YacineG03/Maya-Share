const express = require('express');
const router = express.Router();
const dossierController = require('../controllers/dossierController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware, dossierController.createDossier);
router.get('/patient', authMiddleware, (req, res, next) => {
  console.log('Route /api/dossiers/patient appelée pour user:', req.user);
  dossierController.getDossiersByPatient(req, res, next);
});
router.get('/medecin', authMiddleware, dossierController.getDossiersByMedecin);
router.put('/:id', authMiddleware, dossierController.updateDossier);
router.get('/:idDossier/images', authMiddleware, dossierController.getImagesByDossier);
router.get('/infirmier', authMiddleware, dossierController.getDossiersForInfirmier);

module.exports = router;