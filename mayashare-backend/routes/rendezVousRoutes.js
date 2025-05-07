const express = require('express');
const router = express.Router();
const rendezVousController = require('../controllers/rendezVousController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware, rendezVousController.createRendezVous);
router.get('/patient', authMiddleware, rendezVousController.getRendezVousByPatient);
router.get('/medecin', authMiddleware, rendezVousController.getRendezVousByMedecin);
router.get('/infirmier', authMiddleware, rendezVousController.getRendezVousForInfirmier);
router.get('/:id', authMiddleware, rendezVousController.getRendezVous);
router.put('/:id/accept', authMiddleware, rendezVousController.acceptRendezVous);
router.put('/:id/decline', authMiddleware, rendezVousController.declineRendezVous);
router.put('/:id/assign', authMiddleware, rendezVousController.assignRendezVousToInfirmier);
router.put('/:id/cancel', authMiddleware, rendezVousController.cancelRendezVous); // Route ajoutée pour l'annulation
router.delete('/:id', authMiddleware, rendezVousController.deleteRendezVous);

module.exports = router;