const express = require('express');
const router = express.Router();
const imageController = require('../controllers/imageController');
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');

// Configuration de Multer
// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, 'uploads/');
//     },
//     filename: (req, file, cb) => {
//         cb(null, Date.now() + path.extname(file.originalname));
//     },
// });

const fileFilter = (req, file, cb) => {
    console.log('Type MIME détecté:', file.mimetype);
    const allowedTypes = [
        'application/dicom',
        'application/pdf',
        'image/jpeg',
        'image/png',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
        'application/octet-stream', // Ajout pour gérer les cas où DICOM est mal détecté
    ];
    const allowedExtensions = ['.dcm', '.pdf', '.jpg', '.jpeg', '.png', '.docx', '.txt'];
    const fileExtension = path.extname(file.originalname).toLowerCase();

    if (allowedTypes.includes(file.mimetype) || (file.mimetype === 'application/octet-stream' && fileExtension === '.dcm')) {
        cb(null, true);
    } else {
        cb(new Error('Type de fichier non pris en charge. Types autorisés : DICOM (.dcm), PDF (.pdf), images (.jpg, .jpeg, .png), Word (.docx), texte (.txt).'), false);
    }
};

// const upload = multer({
//     storage: storage,
//     limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB max
//     fileFilter: fileFilter,
// });

// Configuration de Multer pour gérer les fichiers binaires
const storage = multer.memoryStorage(); // Stocker en mémoire pour éviter la corruption
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Limite de 10 MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/dicom', 'application/pdf', 'image/jpeg', 'image/png', 'text/plain'];
    if (file.mimetype.startsWith('application/octet-stream') && file.originalname.toLowerCase().endsWith('.dcm')) {
      file.mimetype = 'application/dicom'; // Forcer le type MIME pour les fichiers DICOM
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

module.exports = router;