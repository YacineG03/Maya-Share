const express = require('express');
const router = express.Router();
const imageController = require('../controllers/imageController');
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');

// Configuration de Multer pour gérer les fichiers binaires
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Limite de 10 MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/dicom', 'application/pdf', 'image/jpeg', 'image/png', 'text/plain'];
    if (file.mimetype.startsWith('application/octet-stream') && file.originalname.toLowerCase().endsWith('.dcm')) {
      file.mimetype = 'application/dicom';
    }
    if (allowedTypes.includes(file.mimetype) || file.originalname.toLowerCase().endsWith('.dcm')) {
      cb(null, true);
    } else {
      cb(new Error('Type de fichier non supporté'));
    }
  },
});

router.post('/', authMiddleware, upload.single('file'), (req, res, next) => {
  console.log('Après Multer - req.file:', req.file);
  console.log('Après Multer - req.body:', req.body);
  next();
}, imageController.uploadImage);

router.get('/:id', authMiddleware, imageController.getImage);
router.get('/user', authMiddleware, imageController.getImagesByUser);
router.get('/dossier/:idDossier', authMiddleware, imageController.getImagesByDossier);
router.delete('/:id', authMiddleware, imageController.deleteImage);

// Endpoint pour récupérer l'URL WADO
router.get('/wado', authMiddleware, async (req, res) => {
  try {
    const { requestType, instanceID } = req.query;
    if (requestType !== 'WADO' || !instanceID) {
      return res.status(400).json({ message: 'Paramètres WADO invalides' });
    }

    // Générer l'URL WADO pour Orthanc
    const wadoUrl = `http://localhost:3000/wado?requestType=WADO&instanceID=${instanceID}`;
    res.json({ wadoUrl });
  } catch (error) {
    console.error('Erreur WADO:', error.message);
    res.status(500).json({ message: 'Erreur lors de la récupération de l\'URL WADO.' });
  }
});

module.exports = router;