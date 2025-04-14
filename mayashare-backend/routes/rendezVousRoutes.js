const express = require('express');
const router = express.Router();
const rendezVousController = require('../controllers/rendezVousController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware, rendezVousController.createRendezVous);
router.get('/patient', authMiddleware, rendezVousController.getRendezVousByPatient);
router.get('/:id', authMiddleware, rendezVousController.getRendezVous);
router.get('/medecin', authMiddleware, rendezVousController.getRendezVousByMedecin);
router.put('/:id/accept', authMiddleware, rendezVousController.acceptRendezVous);
router.put('/:id/decline', authMiddleware, rendezVousController.declineRendezVous);

module.exports = router;