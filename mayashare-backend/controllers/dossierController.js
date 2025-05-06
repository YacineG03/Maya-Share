const Dossier = require('../models/dossierModel');
const Share = require('../models/shareModel');
const Trace = require('../models/traceModel');
const Image = require('../models/imageModel');
const axios = require('axios');

exports.createDossier = (req, res) => {
    if (req.user.role !== 'Médecin' && req.user.role !== 'Infirmier') {
        return res.status(403).json({ message: 'Accès interdit : seuls les médecins et infirmiers peuvent créer un dossier.' });
    }

    const idPatient = req.body.idPatient;
    if (!idPatient || isNaN(idPatient)) {
        return res.status(400).json({ message: 'idPatient doit être un nombre valide.' });
    }

    const dossierData = {
        idPatient: idPatient,
        idMedecin: req.user.role === 'Médecin' ? req.user.id : req.body.idMedecin || null,
        diagnostic: req.body.diagnostic || '',
        traitement: req.body.traitement || '',
    };

    if (req.user.role === 'Infirmier' && !dossierData.idMedecin) {
        return res.status(400).json({ message: 'Un infirmier doit spécifier un idMedecin lors de la création d’un dossier.' });
    }

    Dossier.create(dossierData, (err, result) => {
        if (err) {
            console.error('Erreur lors de la création du dossier:', err);
            return res.status(500).json({ message: 'Erreur lors de la création du dossier.' });
        }

        Trace.create({ action: 'création dossier', idUtilisateur: req.user.id }, (err) => {
            if (err) console.error('Erreur lors de l’enregistrement de la traçabilité:', err);
        });

        res.status(201).json({ message: 'Dossier créé avec succès.', id: result.insertId });
    });
};

exports.getDossiersByPatient = (req, res) => {
    const idPatient = req.user.role === 'Patient' ? req.user.id : req.params.idPatient;

    console.log('Requête getDossiersByPatient pour idPatient:', idPatient, 'rôle:', req.user.role);

    if (req.user.role !== 'Patient' && req.user.role !== 'Médecin' && req.user.role !== 'Infirmier') {
        return res.status(403).json({ message: 'Accès interdit.' });
    }

    if ((req.user.role === 'Médecin' || req.user.role === 'Infirmier') && (!idPatient || isNaN(idPatient))) {
        return res.status(400).json({ message: 'idPatient doit être un nombre valide.' });
    }

    Dossier.findByPatient(idPatient, (err, results) => {
        if (err) {
            console.error('Erreur dans findByPatient:', err.message, err.stack);
            return res.status(500).json({ message: 'Erreur lors de la récupération des dossiers.', error: err.message });
        }

        console.log('Résultats bruts de findByPatient:', results);

        let filteredDossiers = results;

        if (req.user.role === 'Médecin') {
            filteredDossiers = results.filter(dossier => dossier.idMedecin === req.user.id);
        }

        if (req.user.role === 'Infirmier') {
            Share.findSharedWithUser(req.user.id, (err, sharedDossiers) => {
                if (err) {
                    console.error('Erreur dans findSharedWithUser:', err.message, err.stack);
                    return res.status(500).json({ message: 'Erreur lors de la récupération des dossiers.', error: err.message });
                }

                const sharedDossierIds = sharedDossiers.map(d => d.idDossier);
                filteredDossiers = results.filter(dossier => sharedDossierIds.includes(dossier.idDossier));
                if (filteredDossiers.length === 0) {
                    return res.status(200).json({ message: 'Aucun dossier trouvé ou accès interdit.', dossiers: [] });
                }

                const dossiers = filteredDossiers.map(dossier => {
                    const fichiers = dossier.fichiers ? dossier.fichiers.split(',').map(Number) : [];
                    return {
                        idDossier: dossier.idDossier,
                        idPatient: dossier.idPatient,
                        patientNom: dossier.patientNom,
                        patientPrenom: dossier.patientPrenom,
                        email: dossier.email,
                        telephone: dossier.telephone,
                        idMedecin: dossier.idMedecin,
                        medecinNom: `${dossier.medecinPrenom || ''} ${dossier.medecinNom || ''}`.trim() || 'Non spécifié',
                        dateCreation: dossier.dateCreation,
                        diagnostic: dossier.diagnostic,
                        traitement: dossier.traitement,
                        etat: dossier.etat,
                        fichiers: fichiers,
                    };
                });

                res.json({ dossiers });
            });
            return;
        }

        if (filteredDossiers.length === 0) {
            return res.status(200).json({ message: 'Aucun dossier trouvé ou accès interdit.', dossiers: [] });
        }

        const dossiers = filteredDossiers.map(dossier => {
            const fichiers = dossier.fichiers ? dossier.fichiers.split(',').map(Number) : [];
            return {
                idDossier: dossier.idDossier,
                idPatient: dossier.idPatient,
                patientNom: dossier.patientNom,
                patientPrenom: dossier.patientPrenom,
                email: dossier.email,
                telephone: dossier.telephone,
                idMedecin: dossier.idMedecin,
                medecinNom: `${dossier.medecinPrenom || ''} ${dossier.medecinNom || ''}`.trim() || 'Non spécifié',
                dateCreation: dossier.dateCreation,
                diagnostic: dossier.diagnostic,
                traitement: dossier.traitement,
                etat: dossier.etat,
                fichiers: fichiers,
            };
        });

        res.json({ dossiers });
    });
};

exports.getDossiersByMedecin = (req, res) => {
    if (req.user.role !== 'Médecin') {
        return res.status(403).json({ message: 'Accès interdit : réservé aux médecins.' });
    }

    Dossier.findByMedecin(req.user.id, (err, results) => {
        if (err) {
            console.error('Erreur lors de la récupération des dossiers:', err);
            return res.status(500).json({ message: 'Erreur lors de la récupération des dossiers.' });
        }

        if (results.length === 0) {
            return res.status(200).json({ message: 'Aucun dossier trouvé.', dossiers: [] });
        }

        const dossiers = results.map(dossier => {
            return new Promise((resolve) => {
                Image.findByDossier(dossier.idDossier, (err, images) => {
                    const fichiers = images.map(image => ({
                        idImage: image.idImage,
                        nomFichier: image.nomFichier,
                        format: image.format,
                        url: image.format.includes('dicom') && image.metadonnees
                            ? `http://localhost:8042/instances/${JSON.parse(image.metadonnees).orthancId}/preview`
                            : `/uploads/${image.nomFichier}`,
                    }));
                    resolve({
                        idDossier: dossier.idDossier,
                        idPatient: dossier.idPatient,
                        idMedecin: dossier.idMedecin,
                        dateCreation: dossier.dateCreation,
                        diagnostic: dossier.diagnostic,
                        traitement: dossier.traitement,
                        etat: dossier.etat,
                        fichiers: fichiers,
                    });
                });
            });
        });

        Promise.all(dossiers).then(dossierResults => {
            res.json({ dossiers: dossierResults });
        });
    });
};

exports.updateDossier = (req, res) => {
    if (req.user.role !== 'Médecin' && req.user.role !== 'Infirmier') {
        return res.status(403).json({ message: 'Accès interdit : seuls les médecins et infirmiers avec autorisation peuvent modifier un dossier.' });
    }

    const id = req.params.id;
    const { diagnostic, traitement, etat } = req.body;

    if (!diagnostic || diagnostic.trim() === '') {
        return res.status(400).json({ message: 'Le diagnostic est requis.' });
    }
    if (!traitement || traitement.trim() === '') {
        return res.status(400).json({ message: 'Le traitement est requis.' });
    }
    if (!['en cours', 'traité'].includes(etat)) {
        return res.status(400).json({ message: 'L’état doit être "en cours" ou "traité".' });
    }

    Dossier.findById(id, (err, results) => {
        if (err || results.length === 0) {
            return res.status(404).json({ message: 'Dossier non trouvé.' });
        }

        const dossier = results[0];

        if (req.user.role === 'Médecin') {
            if (dossier.idMedecin !== req.user.id) {
                return res.status(403).json({ message: 'Accès interdit : vous n’êtes pas assigné à ce dossier.' });
            }
        } else if (req.user.role === 'Infirmier') {
            Share.findSharedDossier(id, req.user.id, (err, shareResults) => {
                if (err || shareResults.length === 0) {
                    return res.status(403).json({ message: 'Accès interdit : ce dossier n’a pas été partagé avec vous.' });
                }

                const dossierData = { diagnostic, traitement, etat };
                Dossier.update(id, dossierData, (err) => {
                    if (err) {
                        return res.status(500).json({ message: 'Erreur lors de la mise à jour du dossier.' });
                    }

                    Trace.create({ action: 'modification dossier', idUtilisateur: req.user.id }, (err) => {
                        if (err) console.error('Erreur lors de l’enregistrement de la traçabilité:', err);
                    });

                    res.json({ message: 'Dossier mis à jour avec succès.' });
                });
            });
            return;
        }

        const dossierData = { diagnostic, traitement, etat };
        Dossier.update(id, dossierData, (err) => {
            if (err) {
                return res.status(500).json({ message: 'Erreur lors de la mise à jour du dossier.' });
            }

            Trace.create({ action: 'modification dossier', idUtilisateur: req.user.id }, (err) => {
                if (err) console.error('Erreur lors de l’enregistrement de la traçabilité:', err);
            });

            res.json({ message: 'Dossier mis à jour avec succès.' });
        });
    });
};

exports.getImagesByDossier = (req, res) => {
    const idDossier = req.params.idDossier;

    if (isNaN(idDossier)) {
        return res.status(400).json({ message: 'idDossier doit être un nombre valide.' });
    }

    Dossier.findById(idDossier, (err, dossierResults) => {
        if (err || dossierResults.length === 0) {
            return res.status(404).json({ message: 'Dossier non trouvé.' });
        }

        const dossier = dossierResults[0];
        if (req.user.role === 'Patient' && dossier.idPatient !== req.user.id) {
            return res.status(403).json({ message: 'Accès interdit : ce dossier ne vous appartient pas.' });
        }
        if (req.user.role === 'Médecin' && dossier.idMedecin !== req.user.id) {
            return res.status(403).json({ message: 'Accès interdit : vous n’êtes pas assigné à ce dossier.' });
        }
        if (req.user.role === 'Infirmier') {
            Share.findSharedDossier(idDossier, req.user.id, (err, shareResults) => {
                if (err || shareResults.length === 0) {
                    return res.status(403).json({ message: 'Accès interdit : ce dossier n’a pas été partagé avec vous.' });
                }

                fetchImages(idDossier, res);
            });
            return;
        }

        fetchImages(idDossier, res);
    });
};

const fetchImages = (idDossier, res) => {
    Image.findByDossier(idDossier, (err, results) => {
        if (err) {
            console.error('Erreur lors de la récupération des images:', err);
            return res.status(500).json({ message: 'Erreur lors de la récupération des images.' });
        }

        if (results.length === 0) {
            return res.status(200).json({ message: 'Aucune image trouvée dans ce dossier.', images: [] });
        }

        const images = results.map(image => {
            return new Promise((resolve) => {
                const imageUrl = image.format.includes('dicom') && image.metadonnees
                    ? `http://localhost:8042/instances/${JSON.parse(image.metadonnees).orthancId}/preview`
                    : `/uploads/${image.nomFichier}`;
                let viewerUrl = null;

                if (image.format.includes('dicom') && image.metadonnees) {
                    const metadonnees = JSON.parse(image.metadonnees);
                    if (metadonnees.orthancId) {
                        axios.get(`http://localhost:8042/instances/${metadonnees.orthancId}`)
                            .then(instanceResponse => {
                                const studyId = instanceResponse.data.ParentStudy;
                                viewerUrl = studyId ? `http://localhost:3001/viewer/${studyId}` : null;
                                resolve({
                                    idImage: image.idImage,
                                    nomFichier: image.nomFichier,
                                    format: image.format,
                                    metadonnees: image.metadonnees,
                                    idUtilisateur: image.idUtilisateur,
                                    idDossier: image.idDossier,
                                    url: imageUrl,
                                    viewerUrl: viewerUrl,
                                });
                            })
                            .catch(err => {
                                console.error('Erreur lors de la récupération de l’ID de l’étude:', err.message);
                                resolve({
                                    idImage: image.idImage,
                                    nomFichier: image.nomFichier,
                                    format: image.format,
                                    metadonnees: image.metadonnees,
                                    idUtilisateur: image.idUtilisateur,
                                    idDossier: image.idDossier,
                                    url: imageUrl,
                                    viewerUrl: null,
                                });
                            });
                    } else {
                        resolve({
                            idImage: image.idImage,
                            nomFichier: image.nomFichier,
                            format: image.format,
                            metadonnees: image.metadonnees,
                            idUtilisateur: image.idUtilisateur,
                            idDossier: image.idDossier,
                            url: imageUrl,
                            viewerUrl: null,
                        });
                    }
                } else {
                    resolve({
                        idImage: image.idImage,
                        nomFichier: image.nomFichier,
                        format: image.format,
                        metadonnees: image.metadonnees,
                        idUtilisateur: image.idUtilisateur,
                        idDossier: image.idDossier,
                        url: imageUrl,
                        viewerUrl: null,
                    });
                }
            });
        });

        Promise.all(images).then(imageResults => {
            res.status(200).json({ images: imageResults });
        });
    });
};

exports.getDossiersForInfirmier = (req, res) => {
    if (req.user.role !== 'Infirmier') {
      return res.status(403).json({ message: 'Accès interdit : réservé aux infirmiers.' });
    }
  
    Dossier.getDossiersForInfirmier(req.user.id, (err, results) => {
      if (err) {
        console.error('Erreur lors de la récupération des dossiers:', err);
        return res.status(500).json({ message: 'Erreur lors de la récupération des dossiers.' });
      }
      res.json({ dossiers: results });
    });
};