const Image = require('../models/imageModel');
const Trace = require('../models/traceModel');

exports.uploadImage = (req, res) => {
    if (req.user.role !== 'Médecin') return res.status(403).json({ message: 'Accès interdit.' });

    // Gestion des erreurs de Multer (ex. taille de fichier)
    if (req.fileValidationError) {
        return res.status(400).json({ message: req.fileValidationError });
    }
    if (!req.file) {
        return res.status(400).json({ message: 'Aucune image fournie.' });
    }

    const imageData = {
        nomFichier: req.file.filename,
        format: req.file.mimetype.split('/')[1],
        metadonnees: req.body.metadonnees || '',
        idUtilisateur: req.user.id,
        idDossier: req.body.idDossier || null
    };

    Image.create(imageData, (err, result) => {
        if (err) return res.status(500).json({ message: 'Erreur lors de l’importation de l’image.' });

        Trace.create({ action: 'upload', idUtilisateur: req.user.id, idImage: result.insertId }, (err) => {
            if (err) console.error('Erreur lors de l’enregistrement de la traçabilité:', err);
        });

        res.status(201).json({ message: 'Image importée avec succès.', id: result.insertId });
    });
};

exports.getImage = (req, res) => {
    const id = req.params.id;
    Image.findById(id, (err, results) => {
        if (err) return res.status(500).json({ message: 'Erreur lors de la récupération de l’image.' });
        if (results.length === 0) return res.status(404).json({ message: 'Image non trouvée.' });

        const image = results[0];
        // Enregistrer l'action dans la traçabilité
        Trace.create({ action: 'vue', idUtilisateur: req.user.id, idImage: id }, (err) => {
            if (err) console.error('Erreur lors de l’enregistrement de la traçabilité:', err);
        });

        res.json({ url: `/uploads/${image.nomFichier}`, ...image });
    });
};

exports.getImagesByUser = (req, res) => {
    Image.findByUser(req.user.id, (err, results) => {
        if (err) return res.status(500).json({ message: 'Erreur lors de la récupération des images.' });
        res.json(results.map(image => ({ ...image, url: `/uploads/${image.nomFichier}` })));
    });
};