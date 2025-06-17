const express = require('express');
const router = express.Router();
const consultationController = require('../controllers/consultationController');
const authMiddleware = require('../middleware/authMiddleware');
const PDFDocument = require('pdfkit');
const fs = require('fs');

// Créer une consultation
router.post('/', authMiddleware, consultationController.createConsultation);

// Récupérer les consultations d’un dossier
router.get('/dossier/:idDossier', authMiddleware, consultationController.getConsultationsByDossier);

// Mettre à jour une consultation
router.put('/:idConsultation', authMiddleware, consultationController.updateConsultation);

// Télécharger l'ordonnance
router.get('/:idConsultation/ordonnance', authMiddleware, (req, res) => {
    const { idConsultation } = req.params;

    Consultation.findById(idConsultation, (err, consultationResults) => {
        if (err || consultationResults.length === 0) {
            return res.status(404).json({ message: 'Consultation non trouvée.' });
        }

        const consultation = consultationResults[0];
        if (!consultation.ordonnance) {
            return res.status(404).json({ message: 'Aucune ordonnance disponible.' });
        }

        const doc = new PDFDocument();
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=ordonnance_${idConsultation}.pdf`);

        doc.pipe(res);
        doc.fontSize(20).text('Ordonnance Médicale', { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(`Médecin : ${consultation.signatureMedecin || 'Non signé'}`);
        doc.moveDown();
        doc.text(`Contenu : ${consultation.ordonnance}`);
        doc.end();
    });
});

module.exports = router;