const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const imageRoutes = require('./routes/imageRoutes');
const shareRoutes = require('./routes/shareRoutes');
const traceRoutes = require('./routes/traceRoutes');
const dossierRoutes = require('./routes/dossierRoutes');
const rendezVousRoutes = require('./routes/rendezVousRoutes');
const hôpitalRoutes = require('./routes/hôpitalRoutes');

const app = express();

// Configuration de Multer pour le stockage des fichiers
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|gif/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);
        if (extname && mimetype) {
            return cb(null, true);
        } else {
            cb('Erreur : Seuls les fichiers JPEG, PNG et GIF sont autorisés !');
        }
    },
    limits: { fileSize: 5 * 1024 * 1024 }
}).single('image');

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/images', upload, imageRoutes);
app.use('/api/shares', shareRoutes);
app.use('/api/traces', traceRoutes);
app.use('/api/dossiers', dossierRoutes);
app.use('/api/rendezvous', rendezVousRoutes);
app.use('/api/hôpitaux', hôpitalRoutes);

// Démarrer le serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});