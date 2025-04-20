const Share = require('../models/shareModel');
const Image = require('../models/imageModel');
const Dossier = require('../models/dossierModel');
const Trace = require('../models/traceModel');
const crypto = require('crypto');
const moment = require('moment');

exports.shareDossier = (req, res) => {
    if (req.user.role !== 'Médecin') return res.status(403).json({ message: 'Accès interdit.' });

    const { idDossier, motDePasse, duree } = req.body;

    // Vérifier que le dossier existe
    Dossier.findById(idDossier, (err, dossierResults) => {
        if (err || dossierResults.length === 0) {
            return res.status(404).json({ message: 'Dossier non trouvé.' });
        }

        // Vérifier que le médecin a le droit de partager ce dossier
        // (ex. vérifier si le patient est associé au médecin via un rendez-vous)
        const query = `
            SELECT * FROM RendezVous 
            WHERE idPatient = ? AND idMedecin = ? AND etat = 'accepté'
        `;
        db.query(query, [dossierResults[0].idPatient, req.user.id], (err, rendezVousResults) => {
            if (err || rendezVousResults.length === 0) {
                return res.status(403).json({ message: 'Vous n’êtes pas autorisé à partager ce dossier.' });
            }

            const lienPartage = crypto.randomBytes(16).toString('hex');
            const dateExpiration = moment().add(duree, 'minutes').format('YYYY-MM-DD HH:mm:ss');

            const shareData = { idDossier, lienPartage, motDePasse, dateExpiration };
            Share.create(shareData, (err, result) => {
                if (err) {
                    console.error('Erreur lors de la création du lien de partage:', err);
                    return res.status(500).json({ message: 'Erreur lors de la création du lien de partage.' });
                }

                Trace.create({ action: 'partage dossier', idUtilisateur: req.user.id, idDossier }, (err) => {
                    if (err) console.error('Erreur lors de l’enregistrement de la traçabilité:', err);
                });

                res.json({ lienPartage: `${req.protocol}://${req.get('host')}/api/shares/${lienPartage}` });
            });
        });
    });
};

exports.accessSharedDossier = (req, res) => {
    const { lienPartage, motDePasse } = req.params;

    Share.findByLink(lienPartage, (err, shareResults) => {
        if (err || shareResults.length === 0) {
            return res.status(404).json({ message: 'Lien de partage invalide ou expiré.' });
        }

        const share = shareResults[0];
        if (share.motDePasse && share.motDePasse !== motDePasse) {
            return res.status(401).json({ message: 'Mot de passe incorrect.' });
        }

        // Vérifier que l'utilisateur a le droit d'accéder (ex. patient lié au dossier)
        if (share.idDossier && req.user && share.idPatient !== req.user.id) {
            return res.status(403).json({ message: 'Accès interdit : vous n’êtes pas le patient associé à ce dossier.' });
        }

        if (share.idDossier) {
            // Récupérer les fichiers associés au dossier
            Share.findImagesByDossier(share.idDossier, (err, imageResults) => {
                if (err) {
                    console.error('Erreur lors de la récupération des fichiers:', err);
                    return res.status(500).json({ message: 'Erreur lors de la récupération des fichiers.' });
                }

                const images = imageResults.map((image) => ({
                    ...image,
                    url: image.format.includes('dicom') ? `http://localhost:8042/instances/${JSON.parse(image.metadonnees).orthancId}/preview` : `/uploads/${image.nomFichier}`,
                }));

                res.json({
                    idDossier: share.idDossier,
                    fichiers: images,
                });
            });
        } else if (share.idImage) {
            // Si c'est une image individuelle
            Image.findById(share.idImage, (err, imageResults) => {
                if (err || imageResults.length === 0) {
                    return res.status(404).json({ message: 'Image non trouvée.' });
                }

                const image = imageResults[0];
                res.json({
                    url: image.format.includes('dicom') ? `http://localhost:8042/instances/${JSON.parse(image.metadonnees).orthancId}/preview` : `/uploads/${image.nomFichier}`,
                    ...image,
                });
            });
        } else {
            res.status(400).json({ message: 'Lien de partage invalide.' });
        }
    });
};