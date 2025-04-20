const Image = require('../models/imageModel');
const Trace = require('../models/traceModel');
const axios = require('axios');
const path = require('path');
const fs = require('fs');

exports.uploadImage = (req, res) => {
    if (req.fileValidationError) {
        return res.status(400).json({ message: req.fileValidationError.message });
    }

    if (!req.file) {
        return res.status(400).json({ message: 'Aucun fichier fourni. Assurez-vous d’utiliser le champ "file" dans votre form-data.' });
    }

    const fileExtension = path.extname(req.file.filename).toLowerCase();
    const allowedExtensions = ['.dcm', '.pdf', '.jpg', '.jpeg', '.png', '.docx', '.txt'];
    if (!allowedExtensions.includes(fileExtension)) {
        return res.status(400).json({ message: 'Type de fichier non pris en charge. Types autorisés : DICOM (.dcm), PDF (.pdf), images (.jpg, .jpeg, .png), Word (.docx), texte (.txt).' });
    }

    if (req.body.idDossier && isNaN(req.body.idDossier)) {
        return res.status(400).json({ message: 'idDossier doit être un nombre valide.' });
    }

    const imageData = {
        nomFichier: req.file.filename,
        format: req.file.mimetype, // Utiliser mimetype complet
        metadonnees: req.body.metadonnees || '',
        idUtilisateur: req.user.id,
        idDossier: req.body.idDossier || null,
    };

    if (fileExtension === '.dcm') {
        const fileBuffer = fs.readFileSync(req.file.path);

        axios.post('http://localhost:8042/instances', fileBuffer, {
            headers: {
                'Content-Type': 'application/dicom',
                'Content-Length': fileBuffer.length,
            },
        })
        .then((response) => {
            if (!response.data.ID) {
                return res.status(500).json({ message: 'Erreur lors de l’envoi à Orthanc : ID non renvoyé.' });
            }

            imageData.metadonnees = JSON.stringify({
                ...JSON.parse(imageData.metadonnees || '{}'),
                orthancId: response.data.ID,
            });

            Image.create(imageData, (err, result) => {
                if (err) {
                    console.error('Erreur lors de l’enregistrement de l’image:', err);
                    return res.status(500).json({ message: 'Erreur lors de l’importation de l’image.' });
                }

                Trace.create({ action: 'upload', idUtilisateur: req.user.id, idImage: result.insertId }, (err) => {
                    if (err) console.error('Erreur lors de l’enregistrement de la traçabilité:', err);
                });

                res.status(201).json({ message: 'Fichier DICOM importé avec succès.', id: result.insertId });
            });
        })
        .catch((err) => {
            console.error('Erreur lors de l’envoi à Orthanc:', err.message, err.response?.data);
            return res.status(500).json({ message: 'Erreur lors de l’envoi du fichier DICOM à Orthanc.', error: err.message, details: err.response?.data });
        });
    } else {
        Image.create(imageData, (err, result) => {
            if (err) {
                console.error('Erreur lors de l’enregistrement de l’image:', err);
                return res.status(500).json({ message: 'Erreur lors de l’importation du fichier.' });
            }

            Trace.create({ action: 'upload', idUtilisateur: req.user.id, idImage: result.insertId }, (err) => {
                if (err) console.error('Erreur lors de l’enregistrement de la traçabilité:', err);
            });

            res.status(201).json({ message: 'Fichier importé avec succès.', id: result.insertId });
        });
    }
};

exports.getImage = (req, res) => {
    const imageId = req.params.id;

    if (isNaN(imageId)) {
        return res.status(400).json({ message: 'L’ID de l’image doit être un nombre valide.' });
    }

    Image.findById(imageId, (err, results) => {
        if (err) {
            console.error('Erreur lors de la récupération de l’image:', err);
            return res.status(500).json({ message: 'Erreur lors de la récupération de l’image.' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'Image non trouvée.' });
        }

        const image = results[0];
        if (image.idUtilisateur !== req.user.id && req.user.role !== 'Médecin') {
            return res.status(403).json({ message: 'Accès interdit : vous n’êtes pas autorisé à accéder à cette image.' });
        }

        // Définir l'URL en fonction du type de fichier
        let imageUrl = `/uploads/${image.nomFichier}`;
        if (image.format.includes('dicom') && image.metadonnees) {
            const metadonnees = JSON.parse(image.metadonnees);
            if (metadonnees.orthancId) {
                imageUrl = `http://localhost:8042/instances/${metadonnees.orthancId}/preview`;
            }
        }

        // Récupérer l'ID interne de l'étude via Orthanc
        if (image.format.includes('dicom') && image.metadonnees) {
            const metadonnees = JSON.parse(image.metadonnees);
            if (!metadonnees.orthancId) {
                return res.status(200).json({
                    idImage: image.idImage,
                    nomFichier: image.nomFichier,
                    format: image.format,
                    metadonnees: image.metadonnees,
                    idUtilisateur: image.idUtilisateur,
                    idDossier: image.idDossier,
                    url: imageUrl,
                    viewerUrl: null
                });
            }

            axios.get(`http://localhost:8042/instances/${metadonnees.orthancId}`)
                .then(instanceResponse => {
                    const studyId = instanceResponse.data.ParentStudy;
                    if (!studyId) {
                        return res.status(200).json({
                            idImage: image.idImage,
                            nomFichier: image.nomFichier,
                            format: image.format,
                            metadonnees: image.metadonnees,
                            idUtilisateur: image.idUtilisateur,
                            idDossier: image.idDossier,
                            url: imageUrl,
                            viewerUrl: null
                        });
                    }

                    const viewerUrl = `http://localhost:8042/viewer/studies/${studyId}`;
                    res.status(200).json({
                        idImage: image.idImage,
                        nomFichier: image.nomFichier,
                        format: image.format,
                        metadonnees: image.metadonnees,
                        idUtilisateur: image.idUtilisateur,
                        idDossier: image.idDossier,
                        url: imageUrl,
                        studyId: studyId,
                        viewerUrl: viewerUrl
                    });
                })
                .catch(err => {
                    console.error('Erreur lors de la récupération de l’ID de l’étude:', err.message, err.response?.data);
                    res.status(200).json({
                        idImage: image.idImage,
                        nomFichier: image.nomFichier,
                        format: image.format,
                        metadonnees: image.metadonnees,
                        idUtilisateur: image.idUtilisateur,
                        idDossier: image.idDossier,
                        url: imageUrl,
                        viewerUrl: null
                    });
                });
        } else {
            res.status(200).json({
                idImage: image.idImage,
                nomFichier: image.nomFichier,
                format: image.format,
                metadonnees: image.metadonnees,
                idUtilisateur: image.idUtilisateur,
                idDossier: image.idDossier,
                url: imageUrl,
                viewerUrl: null
            });
        }
    });
};
// Récupérer une image spécifique par ID
exports.getImage = (req, res) => {
    const imageId = req.params.id;

    if (isNaN(imageId)) {
        return res.status(400).json({ message: 'L’ID de l’image doit être un nombre valide.' });
    }

    Image.findById(imageId, (err, results) => {
        if (err) {
            console.error('Erreur lors de la récupération de l’image:', err);
            return res.status(500).json({ message: 'Erreur lors de la récupération de l’image.' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'Image non trouvée.' });
        }

        const image = results[0];
        if (image.idUtilisateur !== req.user.id && req.user.role !== 'Médecin') {
            return res.status(403).json({ message: 'Accès interdit : vous n’êtes pas autorisé à accéder à cette image.' });
        }

        const imageUrl = image.format.includes('dicom') && image.metadonnees
            ? `http://localhost:8042/instances/${JSON.parse(image.metadonnees).orthancId}/preview`
            : `/uploads/${image.nomFichier}`;

        // Récupérer l'ID interne de l'étude via Orthanc
        if (image.format.includes('dicom') && image.metadonnees) {
            const orthancId = JSON.parse(image.metadonnees).orthancId;
            axios.get(`http://localhost:8042/instances/${orthancId}`)
                .then(instanceResponse => {
                    const studyId = instanceResponse.data.ParentStudy;
                    if (!studyId) {
                        return res.status(200).json({
                            idImage: image.idImage,
                            nomFichier: image.nomFichier,
                            format: image.format,
                            metadonnees: image.metadonnees,
                            idUtilisateur: image.idUtilisateur,
                            idDossier: image.idDossier,
                            url: imageUrl,
                            viewerUrl: null // Pas d'URL de visualiseur si l'étude n'est pas trouvée
                        });
                    }

                    // Générer l'URL pour OHIF Viewer avec l'ID interne
                    const viewerUrl = `http://localhost:8042/viewer/studies/${studyId}`;
                    res.status(200).json({
                        idImage: image.idImage,
                        nomFichier: image.nomFichier,
                        format: image.format,
                        metadonnees: image.metadonnees,
                        idUtilisateur: image.idUtilisateur,
                        idDossier: image.idDossier,
                        url: imageUrl,
                        studyId: studyId,
                        viewerUrl: viewerUrl
                    });
                })
                .catch(err => {
                    console.error('Erreur lors de la récupération de l’ID de l’étude:', err.message);
                    res.status(200).json({
                        idImage: image.idImage,
                        nomFichier: image.nomFichier,
                        format: image.format,
                        metadonnees: image.metadonnees,
                        idUtilisateur: image.idUtilisateur,
                        idDossier: image.idDossier,
                        url: imageUrl,
                        viewerUrl: null
                    });
                });
        } else {
            res.status(200).json({
                idImage: image.idImage,
                nomFichier: image.nomFichier,
                format: image.format,
                metadonnees: image.metadonnees,
                idUtilisateur: image.idUtilisateur,
                idDossier: image.idDossier,
                url: imageUrl,
                viewerUrl: null
            });
        }
    });
};

// Récupérer toutes les images d’un utilisateur
exports.getImagesByUser = (req, res) => {
    const userId = req.user.id;

    Image.findByUser(userId, (err, results) => {
        if (err) {
            console.error('Erreur lors de la récupération des images:', err);
            return res.status(500).json({ message: 'Erreur lors de la récupération des images.' });
        }

        if (results.length === 0) {
            return res.status(200).json({ message: 'Aucune image trouvée.', images: [] });
        }

        const images = results.map((image) => {
            const imageUrl = image.format.includes('dicom') && image.metadonnees
                ? `http://localhost:8042/instances/${JSON.parse(image.metadonnees).orthancId}/preview`
                : `/uploads/${image.nomFichier}`;
            return {
                idImage: image.idImage,
                nomFichier: image.nomFichier,
                format: image.format,
                metadonnees: image.metadonnees,
                idUtilisateur: image.idUtilisateur,
                idDossier: image.idDossier,
                url: imageUrl,
            };
        });

        res.status(200).json({ images });
    });
};