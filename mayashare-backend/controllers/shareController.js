const Share = require('../models/shareModel');
const Dossier = require('../models/dossierModel');
const Consultation = require('../models/consultationModel');
const Trace = require('../models/traceModel');
const crypto = require('crypto');
const moment = require('moment');
const db = require('../config/db');
const archiver = require('archiver');
const fs = require('fs'); 


exports.shareDossier = (req, res) => {
    console.log("Requête reçue (req.body):", req.body); 
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

// exports.accessSharedDossier = (req, res) => {
//     const { lienPartage, motDePasse } = req.params;

//     Share.findByLink(lienPartage, (err, shareResults) => {
//         if (err || shareResults.length === 0) {
//             return res.status(404).json({ message: 'Lien de partage invalide ou expiré.' });
//         }

//         const share = shareResults[0];
//         if (moment().isAfter(share.dateExpiration)) {
//             return res.status(403).json({ message: 'Lien de partage expiré.' });
//         }

//         if (share.motDePasse && share.motDePasse !== motDePasse) {
//             return res.status(401).json({ message: 'Mot de passe incorrect.' });
//         }

//         // Vérifier l'utilisateur authentifié
//         if (req.user) {
//             if (req.user.role === 'Médecin' && share.idMedecin !== req.user.id) {
//                 return res.status(403).json({ message: 'Accès interdit : vous n’êtes pas assigné à ce dossier.' });
//             }
//         } else {
//             if (!share.motDePasse) {
//                 return res.status(403).json({ message: 'Authentification requise pour ce lien.' });
//             }
//         }

//         // Récupérer les fichiers associés au dossier
//         Share.findImagesByDossier(share.idDossier, (err, imageResults) => {
//             if (err) {
//                 console.error('Erreur lors de la récupération des fichiers:', err);
//                 return res.status(500).json({ message: 'Erreur lors de la récupération des fichiers.' });
//             }

//             const images = imageResults.map((image) => ({
//                 ...image,
//                 url: image.format.includes('dicom') 
//                     ? `http://localhost:8042/instances/${JSON.parse(image.metadonnees).orthancId}/preview` 
//                     : `/uploads/${image.nomFichier}`,
//             }));

//             // Récupérer les consultations
//             Consultation.findByDossier(share.idDossier, (err, consultationResults) => {
//                 if (err) {
//                     console.error('Erreur lors de la récupération des consultations:', err);
//                     return res.status(500).json({ message: 'Erreur lors de la récupération des consultations.' });
//                 }

//                 const consultations = consultationResults.map(c => ({
//                     idConsultation: c.idConsultation,
//                     dateConsultation: c.dateConsultation,
//                     notes: c.notes,
//                     ordonnance: c.ordonnance,
//                     signatureMedecin: c.signatureMedecin,
//                     imageIds: c.imageIds ? c.imageIds.split(',').map(Number).filter(id => id) : []
//                 }));

//                 // Ajouter l'utilisateur au dossier s'il n'y est pas encore
//                 if (req.user) {
//                     Dossier.assignUser({
//                         idDossier: share.idDossier,
//                         idUtilisateur: req.user.id,
//                         roleUtilisateur: req.user.role
//                     }, (err, result) => {
//                         if (err) {
//                             console.error('Erreur lors de l\'affectation de l\'utilisateur:', err);
//                         }

//                         const action = result && result.affectedRows > 0 
//                             ? 'dossier assigné après accès partagé' 
//                             : 'accès dossier partagé';
//                         Trace.create({ action, idUtilisateur: req.user.id, idDossier: share.idDossier }, (err) => {
//                             if (err) console.error('Erreur lors de l’enregistrement de la traçabilité:', err);
//                         });

//                         res.json({
//                             idDossier: share.idDossier,
//                             fichiers: images,
//                             consultations: consultations,
//                             message: result && result.affectedRows > 0 
//                                 ? 'Dossier partagé récupéré et assigné avec succès.'
//                                 : 'Accès au dossier partagé avec succès (déjà assigné).',
//                         });
//                     });
//                 } else {
//                     res.json({
//                         idDossier: share.idDossier,
//                         fichiers: images,
//                         consultations: consultations,
//                         message: 'Accès au dossier partagé avec succès.',
//                     });
//                 }
//             });
//         });
//     });
// };

exports.accessSharedDossier = (req, res) => {
    const { lienPartage, motDePasse } = req.params;
    const download = req.query.download === 'true'; // Vérifie si la requête demande un téléchargement

    Share.findByLink(lienPartage, (err, shareResults) => {
        if (err || shareResults.length === 0) {
            return res.status(404).json({ message: 'Lien de partage invalide ou expiré.' });
        }

        const share = shareResults[0];
        if (moment().isAfter(share.dateExpiration)) {
            return res.status(403).json({ message: 'Lien de partage expiré.' });
        }

        if (share.motDePasse && share.motDePasse !== motDePasse) {
            return res.status(401).json({ message: 'Mot de passe incorrect.' });
        }

        Dossier.findById(share.idDossier, (err, dossierResults) => {
            if (err || dossierResults.length === 0) {
                return res.status(404).json({ message: 'Dossier non trouvé.' });
            }

            const dossier = dossierResults[0];
            const patientInfo = {
                nom: dossier.patientNom,
                prenom: dossier.patientPrenom,
                email: dossier.email,
                telephone: dossier.telephone
            };
            const medicalInfo = {
                diagnostic: dossier.diagnostic,
                traitement: dossier.traitement,
                etat: dossier.etat,
                groupeSanguin: dossier.groupeSanguin,
                antecedentsMedicaux: dossier.antecedentsMedicaux,
                allergies: dossier.allergies,
                notesComplementaires: dossier.notesComplementaires
            };

            Consultation.findByDossier(share.idDossier, (err, consultationResults) => {
                if (err) {
                    console.error('Erreur lors de la récupération des consultations:', err);
                    return res.status(500).json({ message: 'Erreur lors de la récupération des consultations.' });
                }

                const consultations = consultationResults.map(c => ({
                    idConsultation: c.idConsultation,
                    dateConsultation: c.dateConsultation,
                    notes: c.notes,
                    ordonnance: c.ordonnance,
                    signatureMedecin: c.signatureMedecin,
                    imageIds: c.imageIds ? c.imageIds.split(',').map(Number).filter(id => id) : []
                        }));

                        Share.findImagesByDossier(share.idDossier, (err, imageResults) => {
                            if (err) {
                                console.error('Erreur lors de la récupération des fichiers:', err);
                                return res.status(500).json({ message: 'Erreur lors de la récupération des fichiers.' });
                            }

                            const images = imageResults.map(image => ({
                                ...image,
                                url: image.format.includes('dicom')
                                    ? `http://localhost:8042/instances/${JSON.parse(image.metadonnees).orthancId}/preview`
                                    : `/uploads/${image.nomFichier}`
                            }));

                            if (download) {
                    const archive = archiver('zip', { zlib: { level: 9 } });
                    const tempFilePath = `/tmp/dossier_${share.idDossier}_${Date.now()}.zip`;

                    res.setHeader('Content-Disposition', `attachment; filename="dossier_${share.idDossier}.zip"`);
                    res.setHeader('Content-Type', 'application/zip');

                    archive.pipe(res);

                    const dossierData = {
                        patientInfo,
                        medicalInfo,
                        consultations,
                        fichiers: images.map(img => ({ nomFichier: img.nomFichier, url: img.url }))
                    };
                    archive.append(JSON.stringify(dossierData, null, 2), { name: 'dossier_info.json' });

                    images.forEach(image => {
                        const filePath = image.url.startsWith('/uploads/') ? `.${image.url}` : null;
                        if (filePath && fs.existsSync(filePath)) {
                        archive.file(filePath, { name: image.nomFichier });
                    }
                });

                    archive.finalize();

                    archive.on('end', () => {
                        fs.unlink(tempFilePath, (err) => {
                            if (err) console.error('Erreur lors de la suppression du fichier temporaire:', err);
                        });
                    });

                    archive.on('error', (err) => {
                        res.status(500).json({ message: 'Erreur lors de la génération du fichier ZIP.', error: err.message });
                    });
                } else {
                        if (req.user) {
                            Dossier.assignUser({
                                idDossier: share.idDossier,
                                idUtilisateur: req.user.id,
                                roleUtilisateur: req.user.role
                            }, (err, result) => {
                                if (err) console.error('Erreur lors de l\'affectation de l\'utilisateur:', err);

                                const action = result && result.affectedRows > 0
                                    ? 'dossier assigné après accès partagé'
                                    : 'accès dossier partagé';
                                Trace.create({ action, idUtilisateur: req.user.id, idDossier: share.idDossier }, (err) => {
                                    if (err) console.error('Erreur lors de l\'enregistrement de la traçabilité:', err);
                                });

                                res.json({
                                    idDossier: share.idDossier,
                                    fichiers: images,
                                    consultations: consultations,
                                    patientInfo,
                                    medicalInfo,
                                    message: result && result.affectedRows > 0
                                        ? 'Dossier partagé récupéré et assigné avec succès.'
                                        : 'Accès au dossier partagé avec succès (déjà assigné).',
                                });
                            });
                        } else {
                            res.json({
                                idDossier: share.idDossier,
                                fichiers: images,
                                consultations: consultations,
                                patientInfo,
                                medicalInfo,
                                message: 'Accès au dossier partagé avec succès.',
                            });
                        }
                    }
                });
            });
        });
    });
};