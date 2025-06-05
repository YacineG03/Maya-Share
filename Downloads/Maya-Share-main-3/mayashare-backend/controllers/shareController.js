const Share = require('../models/shareModel');
const Dossier = require('../models/dossierModel');
const Trace = require('../models/traceModel');
const crypto = require('crypto');
const moment = require('moment');
const db = require('../config/db');

// exports.shareDossier = (req, res) => {
//     if (req.user.role !== 'Médecin') {
//         return res.status(403).json({ message: 'Accès interdit : seuls les médecins peuvent partager un dossier.' });
//     }

//     const { idDossier, idUtilisateur, motDePasse, duree } = req.body;

//     if (!idDossier || isNaN(idDossier)) {
//         return res.status(400).json({ message: 'idDossier doit être un nombre valide.' });
//     }

//     // Vérifier que le dossier existe
//     Dossier.findById(idDossier, (err, dossierResults) => {
//         if (err || dossierResults.length === 0) {
//             return res.status(404).json({ message: 'Dossier non trouvé.' });
//         }

//         const dossier = dossierResults[0];

//         // Vérifier que le médecin est assigné à ce dossier
//         if (dossier.idMedecin !== req.user.id) {
//             return res.status(403).json({ message: 'Accès interdit : vous n’êtes pas assigné à ce dossier.' });
//         }

//         // Cas 1 : Partage direct avec un utilisateur (infirmier)
//         if (idUtilisateur) {
//             if (isNaN(idUtilisateur)) {
//                 return res.status(400).json({ message: 'idUtilisateur doit être un nombre valide.' });
//             }

//             // Vérifier que l'utilisateur est un infirmier
//             const queryUser = 'SELECT * FROM Utilisateur WHERE idUtilisateur = ? AND role = "Infirmier"';
//             db.query(queryUser, [idUtilisateur], (err, userResults) => {
//                 if (err || userResults.length === 0) {
//                     return res.status(404).json({ message: 'Utilisateur non trouvé ou n’est pas un infirmier.' });
//                 }

//                 Share.shareWithUser({ idDossier, idUtilisateur }, (err, result) => {
//                     if (err) {
//                         console.error('Erreur lors du partage direct du dossier:', err);
//                         return res.status(500).json({ message: 'Erreur lors du partage direct du dossier.' });
//                     }

//                     Trace.create({ action: 'partage dossier (direct)', idUtilisateur: req.user.id, idDossier }, (err) => {
//                         if (err) console.error('Erreur lors de l’enregistrement de la traçabilité:', err);
//                     });

//                     res.status(200).json({ message: `Dossier partagé avec succès avec l’infirmier (ID: ${idUtilisateur}).` });
//                 });
//             });
//             return;
//         }

//         // Cas 2 : Partage par lien (pour un autre médecin, par exemple)
//         if (!duree || isNaN(duree)) {
//             return res.status(400).json({ message: 'duree doit être un nombre valide (en minutes).' });
//         }

//         const lienPartage = crypto.randomBytes(16).toString('hex');
//         const dateExpiration = moment().add(duree, 'minutes').format('YYYY-MM-DD HH:mm:ss');

//         const shareData = { idDossier, lienPartage, motDePasse, dateExpiration };
//         Share.create(shareData, (err, result) => {
//             if (err) {
//                 console.error('Erreur lors de la création du lien de partage:', err);
//                 return res.status(500).json({ message: 'Erreur lors de la création du lien de partage.' });
//             }

//             Trace.create({ action: 'partage dossier (lien)', idUtilisateur: req.user.id, idDossier }, (err) => {
//                 if (err) console.error('Erreur lors de l’enregistrement de la traçabilité:', err);
//             });

//             res.json({ lienPartage: `${req.protocol}://${req.get('host')}/api/shares/${lienPartage}` });
//         });
//     });
// };

exports.shareDossier = (req, res) => {
    if (req.user.role !== 'Médecin') {
        return res.status(403).json({ message: 'Accès interdit : seuls les médecins peuvent partager un dossier.' });
    }

    const { idDossier, idUtilisateur, motDePasse, duree } = req.body;

    if (!idDossier || isNaN(idDossier)) {
        return res.status(400).json({ message: 'idDossier doit être un nombre valide.' });
    }

    // Vérifier que le dossier existe
    Dossier.findById(idDossier, (err, dossierResults) => {
        if (err || dossierResults.length === 0) {
            return res.status(404).json({ message: 'Dossier non trouvé.' });
        }

        const dossier = dossierResults[0];

        // Vérifier que le médecin est assigné à ce dossier
        if (dossier.idMedecin !== req.user.id) {
            return res.status(403).json({ message: 'Accès interdit : vous n’êtes pas assigné à ce dossier.' });
        }

        // Cas 1 : Partage direct avec un utilisateur (infirmier)
        if (idUtilisateur) {
            if (isNaN(idUtilisateur)) {
                return res.status(400).json({ message: 'idUtilisateur doit être un nombre valide.' });
            }

            // Vérifier que l'utilisateur est un infirmier
            const queryUser = 'SELECT * FROM Utilisateur WHERE idUtilisateur = ? AND role = "Infirmier"';
            db.query(queryUser, [idUtilisateur], (err, userResults) => {
                if (err || userResults.length === 0) {
                    return res.status(404).json({ message: 'Utilisateur non trouvé ou n’est pas un infirmier.' });
                }

                // Mettre à jour le dossier avec l'idInfirmier
                const updateDossierQuery = 'UPDATE Dossier SET idInfirmier = ? WHERE idDossier = ?';
                db.query(updateDossierQuery, [idUtilisateur, idDossier], (err) => {
                    if (err) {
                        console.error('Erreur lors de la mise à jour de idInfirmier:', err);
                        return res.status(500).json({ message: 'Erreur lors de la mise à jour du dossier.' });
                    }

                    // Enregistrer le partage
                    Share.shareWithUser({ idDossier, idUtilisateur }, (err, result) => {
                        if (err) {
                            console.error('Erreur lors du partage direct du dossier:', err);
                            return res.status(500).json({ message: 'Erreur lors du partage direct du dossier.' });
                        }

                        Trace.create({ action: 'partage dossier (direct)', idUtilisateur: req.user.id, idDossier }, (err) => {
                            if (err) console.error('Erreur lors de l’enregistrement de la traçabilité:', err);
                        });

                        res.status(200).json({ message: `Dossier partagé avec succès avec l’infirmier (ID: ${idUtilisateur}).` });
                    });
                });
            });
            return;
        }

        // Cas 2 : Partage par lien (pour un autre médecin, par exemple)
        if (!duree || isNaN(duree)) {
            return res.status(400).json({ message: 'duree doit être un nombre valide (en minutes).' });
        }

        const lienPartage = crypto.randomBytes(16).toString('hex');
        const dateExpiration = moment().add(duree, 'minutes').format('YYYY-MM-DD HH:mm:ss');

        const shareData = { idDossier, lienPartage, motDePasse, dateExpiration };
        Share.create(shareData, (err, result) => {
            if (err) {
                console.error('Erreur lors de la création du lien de partage:', err);
                return res.status(500).json({ message: 'Erreur lors de la création du lien de partage.' });
            }

            Trace.create({ action: 'partage dossier (lien)', idUtilisateur: req.user.id, idDossier }, (err) => {
                if (err) console.error('Erreur lors de l’enregistrement de la traçabilité:', err);
            });

            res.json({ lienPartage: `${req.protocol}://${req.get('host')}/api/shares/${lienPartage}` });
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

        // Vérifier que l'utilisateur a le droit d'accéder (ex. patient lié au dossier ou médecin)
        if (share.idDossier && req.user) {
            if (req.user.role === 'Patient' && share.idPatient !== req.user.id) {
                return res.status(403).json({ message: 'Accès interdit : vous n’êtes pas le patient associé à ce dossier.' });
            }
            if (req.user.role === 'Médecin' && share.idMedecin !== req.user.id) {
                return res.status(403).json({ message: 'Accès interdit : vous n’êtes pas assigné à ce dossier.' });
            }
        }

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
    });
};