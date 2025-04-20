// const express = require('express');
// const router = express.Router();
// const dossierController = require('../controllers/dossierController');
// const authMiddleware = require('../middleware/authMiddleware');

// router.post('/', authMiddleware, dossierController.createDossier);
// router.get('/:id', authMiddleware, dossierController.getDossier);
// router.get('/patient', authMiddleware, dossierController.getDossiersByPatient);
// router.get('/medecin', authMiddleware, dossierController.getDossiersByMedecin);
// router.put('/:id', authMiddleware, dossierController.updateDossier);

// module.exports = router;
const express = require('express');
const router = express.Router();
const dossierController = require('../controllers/dossierController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware, dossierController.createDossier);
router.get('/patient/:idPatient?', authMiddleware, dossierController.getDossiersByPatient);

module.exports = router;