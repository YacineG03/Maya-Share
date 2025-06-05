const express = require('express');
const router = express.Router();
const rendezVousController = require('../controllers/rendezVousController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware, rendezVousController.createRendezVous);
router.get('/patient', authMiddleware, rendezVousController.getRendezVousByPatient);
router.get('/medecin', authMiddleware, rendezVousController.getRendezVousByMedecin);
router.get('/infirmier', authMiddleware, rendezVousController.getRendezVousForInfirmier);
router.get('/:id', authMiddleware, rendezVousController.getRendezVousById);
router.put('/:id/assign', authMiddleware, rendezVousController.assignRendezVousToInfirmier);
router.put('/:id/accept', authMiddleware, rendezVousController.acceptRendezVous);
router.put('/:id/decline', authMiddleware, rendezVousController.declineRendezVous);
router.put('/:id/cancel', authMiddleware, rendezVousController.cancelRendezVous);
router.post('/share', authMiddleware, rendezVousController.shareAgenda);
router.get('/shared-agendas/infirmier', authMiddleware, rendezVousController.getSharedAgendasForInfirmier);
router.get('/medecin-rendezvous/infirmier', authMiddleware, rendezVousController.getRendezVousByMedecinForInfirmier);

module.exports = router;