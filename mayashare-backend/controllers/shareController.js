const Share = require('../models/shareModel');
const Image = require('../models/imageModel');
const Trace = require('../models/traceModel');
const crypto = require('crypto');

exports.shareImage = (req, res) => {
    if (req.user.role !== 'Médecin') return res.status(403).json({ message: 'Accès interdit.' });

    const { idImage, motDePasse, duree } = req.body;
    Image.findById(idImage, (err, results) => {
        if (err || results.length === 0) return res.status(404).json({ message: 'Image non trouvée.' });

        const lienPartage = crypto.randomBytes(16).toString('hex');
        const dateExpiration = new Date(Date.now() + duree * 60 * 1000); // duree en minutes

        Share.create({ idImage, lienPartage, motDePasse, dateExpiration }, (err, result) => {
            if (err) return res.status(500).json({ message: 'Erreur lors de la création du lien de partage.' });

            // Enregistrer l'action dans la traçabilité
            Trace.create({ action: 'partage', idUtilisateur: req.user.id, idImage }, (err) => {
                if (err) console.error('Erreur lors de l’enregistrement de la traçabilité:', err);
            });

            res.json({ lienPartage: `${req.protocol}://${req.get('host')}/api/shares/${lienPartage}` });
        });
    });
};

exports.accessSharedImage = (req, res) => {
    const { lienPartage, motDePasse } = req.params;
    Share.findByLink(lienPartage, (err, results) => {
        if (err || results.length === 0) return res.status(404).json({ message: 'Lien de partage invalide ou expiré.' });

        const share = results[0];
        if (share.motDePasse && share.motDePasse !== motDePasse) {
            return res.status(401).json({ message: 'Mot de passe incorrect.' });
        }

        Image.findById(share.idImage, (err, imageResults) => {
            if (err || imageResults.length === 0) return res.status(404).json({ message: 'Image non trouvée.' });

            const image = imageResults[0];
            res.json({ url: `/uploads/${image.nomFichier}`, ...image });
        });
    });
};