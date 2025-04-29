const express = require('express');
const cors = require('cors');
const axios = require('axios');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const imageRoutes = require('./routes/imageRoutes');
const shareRoutes = require('./routes/shareRoutes');
const traceRoutes = require('./routes/traceRoutes');
const dossierRoutes = require('./routes/dossierRoutes');
const rendezVousRoutes = require('./routes/rendezVousRoutes');
const hopitalRoutes = require('./routes/hopitalRoutes');

const app = express();

// Configuration de CORS
const corsOptions = {
  origin: "http://localhost:3001",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  exposedHeaders: ["Content-Length", "X-Kuma-Revision"],
  maxAge: 86400,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(express.json());

app.use((req, res, next) => {
  console.log(`Requête reçue: ${req.method} ${req.url}`);
  console.log("En-têtes:", req.headers);
  console.log("Corps:", req.body);
  next();
});

app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('Uploads'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/images', imageRoutes);
app.use('/api/shares', shareRoutes);
app.use('/api/traces', traceRoutes);
app.use('/api/dossiers', dossierRoutes);
app.use('/api/rendezvous', rendezVousRoutes);
app.use('/api/hopitaux', hopitalRoutes);

// Gestion des erreurs globales
app.use((err, req, res, next) => {
  console.error("Erreur serveur:", err);
  res.status(500).json({ message: "Erreur serveur interne.", error: err.message });
});

// Proxy pour les requêtes Orthanc
app.get('/proxy/orthanc/wado', async (req, res) => {
  const orthancUrl = `http://172.20.10.5:8042/wado?${new URLSearchParams(req.query).toString()}`;
  try {
    const response = await axios.get(orthancUrl, {
      auth: {
        username: 'mayashare',
        password: 'passer',
      },
      responseType: 'arraybuffer',
    });
    res.set('Content-Type', 'application/dicom');
    res.send(response.data);
  } catch (err) {
    console.error('Erreur proxy Orthanc:', err.message);
    res.status(500).json({ message: 'Erreur lors de la récupération des données DICOM', error: err.message });
  }
});

// Route WADO pour agir comme proxy vers Orthanc
app.get('/wado', async (req, res) => {
  try {
    const { requestType, instanceID } = req.query;
    if (requestType !== 'WADO' || !instanceID) {
      return res.status(400).json({ message: 'Paramètres WADO invalides' });
    }

    console.log('Requête WADO reçue:', { requestType, instanceID });

    // Faire une requête à Orthanc pour récupérer le fichier DICOM
    const orthancResponse = await axios.get(`http://172.20.10.5:8042/instances/${instanceID}/file`, {
      auth: {
        username: 'mayashare',
        password: 'passer',
      },
      responseType: 'arraybuffer',
    });

    console.log('Réponse Orthanc WADO:', orthancResponse.status, orthancResponse.data.length, 'octets');

    res.set({
      'Content-Type': 'application/dicom',
      'Content-Length': orthancResponse.data.length,
    });

    res.send(orthancResponse.data);
  } catch (error) {
    console.error('Erreur proxy WADO:', error.message);
    if (error.response) {
      console.error('Réponse Orthanc erreur:', error.response.status, error.response.data);
    }
    res.status(500).json({ message: 'Erreur lors de la récupération du fichier DICOM', error: error.message });
  }
});

// Démarrer le serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});