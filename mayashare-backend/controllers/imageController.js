// const path = require('path');
// const fs = require('fs');
// const axios = require('axios');
// const Image = require('../models/imageModel');
// const Dossier = require('../models/dossierModel');
// const Trace = require('../models/traceModel');

// exports.uploadImage = (req, res) => {
//     if (req.fileValidationError) {
//         return res.status(400).json({ message: req.fileValidationError.message });
//     }

//     if (!req.file) {
//         return res.status(400).json({ message: 'Aucun fichier fourni. Assurez-vous d’utiliser le champ "file" dans votre form-data.' });
//     }

//     const fileExtension = path.extname(req.file.filename).toLowerCase();
//     const allowedExtensions = ['.dcm', '.pdf', '.jpg', '.jpeg', '.png', '.docx', '.txt'];
//     if (!allowedExtensions.includes(fileExtension)) {
//         fs.unlinkSync(req.file.path);
//         return res.status(400).json({ message: 'Type de fichier non pris en charge. Types autorisés : DICOM (.dcm), PDF (.pdf), images (.jpg, .jpeg, .png), Word (.docx), texte (.txt).' });
//     }

//     if (!req.body.idDossier) {
//         fs.unlinkSync(req.file.path);
//         return res.status(400).json({ message: 'idDossier est requis.' });
//     }

//     if (isNaN(req.body.idDossier)) {
//         fs.unlinkSync(req.file.path);
//         return res.status(400).json({ message: 'idDossier doit être un nombre valide.' });
//     }

//     const idDossier = parseInt(req.body.idDossier);

//     Dossier.findById(idDossier, (err, dossierResults) => {
//         if (err || dossierResults.length === 0) {
//             fs.unlinkSync(req.file.path);
//             return res.status(404).json({ message: 'Dossier non trouvé.' });
//         }

//         const dossier = dossierResults[0];
//         if (req.user.role === 'Patient' && dossier.idPatient !== req.user.id) {
//             fs.unlinkSync(req.file.path);
//             return res.status(403).json({ message: 'Accès interdit : ce dossier ne vous appartient pas.' });
//         }
//         if (req.user.role === 'Médecin' && dossier.idMedecin !== req.user.id) {
//             fs.unlinkSync(req.file.path);
//             return res.status(403).json({ message: 'Accès interdit : vous n’êtes pas assigné à ce dossier.' });
//         }

//         const imageData = {
//             nomFichier: req.file.filename,
//             format: req.file.mimetype,
//             metadonnees: req.body.metadonnees || '',
//             idUtilisateur: req.user.id,
//             idDossier: idDossier,
//         };

//         if (fileExtension === '.dcm') {
//             const fileBuffer = fs.readFileSync(req.file.path);

//             axios.post('http://localhost:8042/instances', fileBuffer, {
//                 headers: {
//                     'Content-Type': 'application/dicom',
//                     'Content-Length': fileBuffer.length,
//                 },
//             })
//             .then((response) => {
//                 fs.unlinkSync(req.file.path);

//                 if (!response.data.ID) {
//                     return res.status(500).json({ message: 'Erreur lors de l’envoi à Orthanc : ID non renvoyé.' });
//                 }

//                 const instanceId = response.data.ID;
//                 console.log(`Image ${req.file.filename} uploadée dans Orthanc avec ID: ${instanceId}`);

//                 // Attendre un court délai pour permettre à Orthanc d'indexer
//                 setTimeout(() => {
//                     axios.get(`http://localhost:8042/instances/${instanceId}`)
//                         .then(instanceResponse => {
//                             console.log('Instance response:', instanceResponse.data);
//                             const studyId = instanceResponse.data.ParentStudy;
//                             const seriesId = instanceResponse.data.ParentSeries;

//                             if (!studyId || !seriesId) {
//                                 console.log(`Aucun ParentStudy ou ParentSeries trouvé pour l’instance ${instanceId}`);
//                                 let metadonneesObj = {};
//                                 try {
//                                     metadonneesObj = JSON.parse(imageData.metadonnees || '{}');
//                                 } catch (e) {
//                                     console.error('Erreur lors du parsing des métadonnées:', e.message);
//                                 }

//                                 imageData.metadonnees = JSON.stringify({
//                                     ...metadonneesObj,
//                                     orthancId: instanceId,
//                                 });

//                                 Image.create(imageData, (err, result) => {
//                                     if (err) {
//                                         console.error('Erreur lors de l’enregistrement de l’image:', err);
//                                         return res.status(500).json({ message: 'Erreur lors de l’importation de l’image.' });
//                                     }

//                                     Trace.create({ action: 'upload', idUtilisateur: req.user.id, idImage: result.insertId }, (err) => {
//                                         if (err) console.error('Erreur lors de l’enregistrement de la traçabilité:', err);
//                                     });

//                                     res.status(201).json({ message: 'Fichier DICOM importé avec succès (ID étude non trouvé).', id: result.insertId });
//                                 });
//                                 return;
//                             }

//                             axios.get(`http://localhost:8042/studies/${studyId}`)
//                                 .then(studyResponse => {
//                                     const studyInstanceUID = studyResponse.data.MainDicomTags.StudyInstanceUID;
//                                     if (!studyInstanceUID) {
//                                         console.log(`StudyInstanceUID non trouvé pour l’instance ${instanceId}`);
//                                         return res.status(500).json({ message: 'Erreur : StudyInstanceUID non trouvé dans Orthanc.' });
//                                     }

//                                     axios.get(`http://localhost:8042/series/${seriesId}`)
//                                         .then(seriesResponse => {
//                                             const seriesInstanceUID = seriesResponse.data.MainDicomTags.SeriesInstanceUID;
//                                             if (!seriesInstanceUID) {
//                                                 console.log(`SeriesInstanceUID non trouvé pour l’instance ${instanceId}`);
//                                                 return res.status(500).json({ message: 'Erreur : SeriesInstanceUID non trouvé dans Orthanc.' });
//                                             }

//                                             let metadonneesObj = {};
//                                             try {
//                                                 metadonneesObj = JSON.parse(imageData.metadonnees || '{}');
//                                             } catch (e) {
//                                                 console.error('Erreur lors du parsing des métadonnées:', e.message);
//                                             }

//                                             imageData.metadonnees = JSON.stringify({
//                                                 ...metadonneesObj,
//                                                 orthancId: instanceId,
//                                                 studyInstanceUID: studyInstanceUID,
//                                                 seriesInstanceUID: seriesInstanceUID,
//                                             });

//                                             Image.create(imageData, (err, result) => {
//                                                 if (err) {
//                                                     console.error('Erreur lors de l’enregistrement de l’image:', err);
//                                                     return res.status(500).json({ message: 'Erreur lors de l’importation de l’image.' });
//                                                 }

//                                                 Trace.create({ action: 'upload', idUtilisateur: req.user.id, idImage: result.insertId }, (err) => {
//                                                     if (err) console.error('Erreur lors de l’enregistrement de la traçabilité:', err);
//                                                 });

//                                                 res.status(201).json({ message: 'Fichier DICOM importé avec succès.', id: result.insertId });
//                                             });
//                                         })
//                                         .catch(err => {
//                                             console.error(`Erreur lors de la récupération de la série pour l’instance ${instanceId}:`, err.message);
//                                             return res.status(500).json({ message: 'Erreur lors de la récupération de la série dans Orthanc.', error: err.message });
//                                         });
//                                 })
//                                 .catch(err => {
//                                     console.error(`Erreur lors de la récupération de l’étude pour l’instance ${instanceId}:`, err.message);
//                                     return res.status(500).json({ message: 'Erreur lors de la récupération de l’étude dans Orthanc.', error: err.message });
//                                 });
//                         })
//                         .catch(err => {
//                             console.error(`Erreur lors de la récupération de l’instance ${instanceId}:`, err.message);
//                             return res.status(500).json({ message: 'Erreur lors de la récupération de l’instance dans Orthanc.', error: err.message });
//                         });
//                 }, 10000); // Délai de 1 seconde
//             })
//             .catch((err) => {
//                 fs.unlinkSync(req.file.path);
//                 console.error(`Erreur lors de l’envoi de ${req.file.filename} à Orthanc:`, err.message, err.response?.data);
//                 return res.status(500).json({ message: 'Erreur lors de l’envoi du fichier DICOM à Orthanc.', error: err.message, details: err.response?.data });
//             });
//         } else {
//             Image.create(imageData, (err, result) => {
//                 if (err) {
//                     fs.unlinkSync(req.file.path);
//                     console.error('Erreur lors de l’enregistrement de l’image:', err);
//                     return res.status(500).json({ message: 'Erreur lors de l’importation du fichier.' });
//                 }

//                 Trace.create({ action: 'upload', idUtilisateur: req.user.id, idImage: result.insertId }, (err) => {
//                     if (err) console.error('Erreur lors de l’enregistrement de la traçabilité:', err);
//                 });

//                 res.status(201).json({ message: 'Fichier importé avec succès.', id: result.insertId });
//             });
//         }
//     });
// };

// exports.getImage = (req, res) => {
//     const imageId = req.params.id;

//     if (isNaN(imageId)) {
//         return res.status(400).json({ message: 'L’ID de l’image doit être un nombre valide.' });
//     }

//     Image.findById(imageId, (err, results) => {
//         if (err) {
//             console.error('Erreur lors de la récupération de l’image:', err);
//             return res.status(500).json({ message: 'Erreur lors de la récupération de l’image.' });
//         }

//         if (results.length === 0) {
//             return res.status(404).json({ message: 'Image non trouvée.' });
//         }

//         const image = results[0];
//         if (image.idUtilisateur !== req.user.id && req.user.role !== 'Médecin') {
//             return res.status(403).json({ message: 'Accès interdit : vous n’êtes pas autorisé à accéder à cette image.' });
//         }

//         const imageUrl = image.nomFichier.toLowerCase().endsWith('.dcm') && image.metadonnees
//             ? `/instances/${JSON.parse(image.metadonnees).orthancId}/preview`
//             : `/uploads/${image.nomFichier}`;

//         if (image.nomFichier.toLowerCase().endsWith('.dcm') && image.metadonnees) {
//             const metadonnees = JSON.parse(image.metadonnees);
//             if (!metadonnees.orthancId) {
//                 console.log(`Aucun orthancId trouvé pour l’image ${imageId}`);
//                 return res.status(200).json({
//                     idImage: image.idImage,
//                     nomFichier: image.nomFichier,
//                     format: image.format,
//                     metadonnees: image.metadonnees,
//                     idUtilisateur: image.idUtilisateur,
//                     idDossier: image.idDossier,
//                     url: imageUrl,
//                     dicomWebUrl: null,
//                 });
//             }

//             const dicomWebUrl = `wadouri:/instances/${metadonnees.orthancId}/file`;
//             console.log(`dicomWebUrl généré pour l’image ${imageId}: ${dicomWebUrl}`);

//             res.status(200).json({
//                 idImage: image.idImage,
//                 nomFichier: image.nomFichier,
//                 format: image.format,
//                 metadonnees: image.metadonnees,
//                 idUtilisateur: image.idUtilisateur,
//                 idDossier: image.idDossier,
//                 url: imageUrl,
//                 dicomWebUrl: dicomWebUrl,
//             });
//         } else {
//             res.status(200).json({
//                 idImage: image.idImage,
//                 nomFichier: image.nomFichier,
//                 format: image.format,
//                 metadonnees: image.metadonnees,
//                 idUtilisateur: image.idUtilisateur,
//                 idDossier: image.idDossier,
//                 url: imageUrl,
//                 dicomWebUrl: null,
//             });
//         }
//     });
// };

// exports.getImagesByUser = (req, res) => {
//     const userId = req.user.id;

//     Image.findByUser(userId, (err, results) => {
//         if (err) {
//             console.error('Erreur lors de la récupération des images:', err);
//             return res.status(500).json({ message: 'Erreur lors de la récupération des images.' });
//         }

//         if (results.length === 0) {
//             return res.status(200).json({ message: 'Aucune image trouvée.', images: [] });
//         }

//         const images = results.map(image => {
//             return new Promise((resolve) => {
//                 const imageUrl = image.nomFichier.toLowerCase().endsWith('.dcm') && image.metadonnees
//                     ? `/instances/${JSON.parse(image.metadonnees).orthancId}/preview`
//                     : `/uploads/${image.nomFichier}`;
//                 let dicomWebUrl = null;

//                 if (image.nomFichier.toLowerCase().endsWith('.dcm') && image.metadonnees) {
//                     const metadonnees = JSON.parse(image.metadonnees);
//                     if (metadonnees.orthancId) {
//                         dicomWebUrl = `wadouri:/instances/${metadonnees.orthancId}/file`;
//                     }
//                     console.log(`dicomWebUrl généré pour l’image ${image.idImage}: ${dicomWebUrl}`);
//                     resolve({
//                         idImage: image.idImage,
//                         nomFichier: image.nomFichier,
//                         format: image.format,
//                         metadonnees: image.metadonnees,
//                         idUtilisateur: image.idUtilisateur,
//                         idDossier: image.idDossier,
//                         url: imageUrl,
//                         dicomWebUrl: dicomWebUrl,
//                     });
//                 } else {
//                     resolve({
//                         idImage: image.idImage,
//                         nomFichier: image.nomFichier,
//                         format: image.format,
//                         metadonnees: image.metadonnees,
//                         idUtilisateur: image.idUtilisateur,
//                         idDossier: image.idDossier,
//                         url: imageUrl,
//                         dicomWebUrl: null,
//                     });
//                 }
//             });
//         });

//         Promise.all(images).then(imageResults => {
//             res.status(200).json({ images: imageResults });
//         });
//     });
// };

// exports.getImagesByDossier = (req, res) => {
//     const idDossier = req.params.idDossier;

//     if (isNaN(idDossier)) {
//         return res.status(400).json({ message: 'L’ID du dossier doit être un nombre valide.' });
//     }

//     Dossier.findById(idDossier, (err, dossierResults) => {
//         if (err || dossierResults.length === 0) {
//             return res.status(404).json({ message: 'Dossier non trouvé.' });
//         }

//         const dossier = dossierResults[0];
//         if (req.user.role === 'Patient' && dossier.idPatient !== req.user.id) {
//             return res.status(403).json({ message: 'Accès interdit : ce dossier ne vous appartient pas.' });
//         }
//         if (req.user.role === 'Médecin' && dossier.idMedecin !== req.user.id) {
//             return res.status(403).json({ message: 'Accès interdit : vous n’êtes pas assigné à ce dossier.' });
//         }

//         Image.findByDossier(idDossier, (err, results) => {
//             if (err) {
//                 console.error('Erreur lors de la récupération des images:', err);
//                 return res.status(500).json({ message: 'Erreur lors de la récupération des images.' });
//             }

//             if (results.length === 0) {
//                 return res.status(200).json({ message: 'Aucune image trouvée pour ce dossier.', images: [] });
//             }

//             const images = results.map(image => {
//                 return new Promise((resolve) => {
//                     const imageUrl = image.nomFichier.toLowerCase().endsWith('.dcm') && image.metadonnees
//                         ? `/instances/${JSON.parse(image.metadonnees).orthancId}/preview`
//                         : `/uploads/${image.nomFichier}`;
//                     let dicomWebUrl = null;

//                     if (image.nomFichier.toLowerCase().endsWith('.dcm') && image.metadonnees) {
//                         const metadonnees = JSON.parse(image.metadonnees);
//                         if (metadonnees.orthancId) {
//                             dicomWebUrl = `wadouri:/instances/${metadonnees.orthancId}/file`;
//                         }
//                     }

//                     resolve({
//                         idImage: image.idImage,
//                         nomFichier: image.nomFichier,
//                         format: image.format,
//                         metadonnees: image.metadonnees,
//                         idUtilisateur: image.idUtilisateur,
//                         idDossier: image.idDossier,
//                         url: imageUrl,
//                         dicomWebUrl: dicomWebUrl,
//                     });
//                 });
//             });

//             Promise.all(images).then(imageResults => {
//                 res.status(200).json({ images: imageResults });
//             });
//         });
//     });
// };

// exports.deleteImage = (req, res) => {
//     const imageId = req.params.id;

//     if (isNaN(imageId)) {
//         return res.status(400).json({ message: 'L’ID de l’image doit être un nombre valide.' });
//     }

//     Image.findById(imageId, (err, results) => {
//         if (err) {
//             console.error('Erreur lors de la récupération de l’image:', err);
//             return res.status(500).json({ message: 'Erreur lors de la récupération de l’image.' });
//         }

//         if (results.length === 0) {
//             return res.status(404).json({ message: 'Image non trouvée.' });
//         }

//         const image = results[0];
//         if (image.idUtilisateur !== req.user.id && req.user.role !== 'Médecin') {
//             return res.status(403).json({ message: 'Accès interdit : vous n’êtes pas autorisé à supprimer cette image.' });
//         }

//         Dossier.findById(image.idDossier, (err, dossierResults) => {
//             if (err || dossierResults.length === 0) {
//                 return res.status(404).json({ message: 'Dossier non trouvé.' });
//             }

//             const dossier = dossierResults[0];
//             if (req.user.role === 'Médecin' && dossier.idMedecin !== req.user.id) {
//                 return res.status(403).json({ message: 'Accès interdit : vous n’êtes pas assigné à ce dossier.' });
//             }

//             if (image.nomFichier.toLowerCase().endsWith('.dcm') && image.metadonnees) {
//                 const metadonnees = JSON.parse(image.metadonnees);
//                 if (metadonnees.orthancId) {
//                     console.log(`Suppression de l’instance Orthanc ${metadonnees.orthancId} pour l’image ${imageId}`);
//                     axios.delete(`http://localhost:8042/instances/${metadonnees.orthancId}`)
//                         .then(() => {
//                             console.log(`Instance Orthanc ${metadonnees.orthancId} supprimée avec succès`);
//                             deleteImageFromDB(imageId, req.user.id, res);
//                         })
//                         .catch(err => {
//                             console.error('Erreur lors de la suppression de l’instance Orthanc:', err.message);
//                             deleteImageFromDB(imageId, req.user.id, res);
//                         });
//                 } else {
//                     deleteImageFromDB(imageId, req.user.id, res);
//                 }
//             } else {
//                 const filePath = path.join(__dirname, '..', 'uploads', image.nomFichier);
//                 fs.unlink(filePath, (err) => {
//                     if (err) {
//                         console.error('Erreur lors de la suppression du fichier:', err);
//                     }
//                     deleteImageFromDB(imageId, req.user.id, res);
//                 });
//             }
//         });
//     });
// };

// const deleteImageFromDB = (imageId, userId, res) => {
//     Image.delete(imageId, (err) => {
//         if (err) {
//             console.error('Erreur lors de la suppression de l’image de la base de données:', err);
//             return res.status(500).json({ message: 'Erreur lors de la suppression de l’image.' });
//         }

//         Trace.create({ action: 'suppression image', idUtilisateur: userId, idImage: imageId }, (err) => {
//             if (err) console.error('Erreur lors de l’enregistrement de la traçabilité:', err);
//         });

//         res.status(200).json({ message: 'Image supprimée avec succès.' });
//     });
// };

// backend/controllers/imageController.js
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const Image = require('../models/imageModel');
const Dossier = require('../models/dossierModel');
const Trace = require('../models/traceModel');
const { v4: uuidv4 } = require('uuid');
const ORTHANC_URL = 'http://localhost:8042';

// backend/controllers/imageController.js
// backend/controllers/imageController.js
exports.uploadImage = async (req, res) => {
  try {
    const { idDossier } = req.body;
    if (!req.file) {
      return res.status(400).json({ message: 'Aucun fichier fourni' });
    }

    // Étape 1 : Vérifier le buffer du fichier
    const fileBuffer = req.file.buffer;
    if (!fileBuffer || fileBuffer.length === 0) {
      return res.status(400).json({ message: 'Le fichier est vide ou corrompu' });
    }

    console.log('Taille du buffer avant envoi à Orthanc:', fileBuffer.length);

    // Étape 2 : Uploader le fichier DICOM vers Orthanc
    const orthancResponse = await axios.post(`${ORTHANC_URL}/instances`, fileBuffer, {
      headers: {
        'Content-Type': 'application/dicom',
        'Content-Length': fileBuffer.length,
      },
    });

    console.log('Réponse Orthanc upload:', orthancResponse.data);

    if (!orthancResponse.data || !orthancResponse.data.ID) {
      return res.status(500).json({ message: 'Échec de l’upload vers Orthanc : ID non retourné' });
    }

    const orthancId = orthancResponse.data.ID;

    // Étape 3 : Préparer les données pour l'insertion (sans url et dicomWebUrl)
    const fileName = req.file.originalname || `file-${Date.now()}.dcm`;
    const imageData = {
      nomFichier: fileName,
      format: fileName.toLowerCase().endsWith('.dcm') ? 'application/dicom' : req.file.mimetype,
      metadonnees: JSON.stringify({ orthancId }), // Stocker uniquement orthancId
      idUtilisateur: req.user.id,
      idDossier: idDossier,
    };

    // Étape 4 : Enregistrer dans la base de données via le modèle
    const result = await new Promise((resolve, reject) => {
      Image.create(imageData, (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });

    // Générer url et dicomWebUrl pour la réponse
    const dicomWebUrl = `wadouri:http://localhost:5000/wado?requestType=WADO&instanceID=${orthancId}`;
    const previewUrl = `/instances/${orthancId}/preview`;

    res.status(201).json({
      message: 'Fichier uploadé avec succès',
      imageId: result.insertId,
      url: previewUrl,
      dicomWebUrl: dicomWebUrl,
    });
  } catch (error) {
    console.error('Erreur upload fichier:', error);
    if (error.response) {
      console.error('Réponse Orthanc:', error.response.data);
    }
    res.status(500).json({ message: 'Erreur lors de l’upload du fichier', error: error.message });
  }
};
// backend/controllers/imageController.js
exports.getImage = (req, res) => {
  const imageId = req.params.id;

  if (isNaN(imageId)) {
    return res.status(400).json({ message: 'ID image invalide.' });
  }

  Image.findById(imageId, (err, results) => {
    if (err) {
      console.error('Erreur récupération image:', err);
      return res.status(500).json({ message: 'Erreur serveur.' });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'Image non trouvée.' });
    }

    const image = results[0];
    if (image.idUtilisateur !== req.user.id && req.user.role !== 'Médecin') {
      return res.status(403).json({ message: 'Accès interdit.' });
    }

    let metadonnees;
    try {
      metadonnees = JSON.parse(image.metadonnees || '{}');
    } catch (e) {
      console.error('Erreur parsing métadonnées:', e);
      metadonnees = {};
    }

    const isDicom = image.nomFichier && image.nomFichier.toLowerCase().endsWith('.dcm');
    const imageUrl = isDicom && metadonnees.orthancId
      ? `/instances/${metadonnees.orthancId}/preview`
      : `/uploads/${image.nomFichier || 'default-file'}`;
    const dicomWebUrl = isDicom && metadonnees.orthancId
      ? `wadouri:http://localhost:5000/wado?requestType=WADO&instanceID=${metadonnees.orthancId}`
      : null;

    res.status(200).json({
      idImage: image.idImage,
      nomFichier: image.nomFichier,
      format: image.format,
      metadonnees: image.metadonnees,
      idUtilisateur: image.idUtilisateur,
      idDossier: image.idDossier,
      url: imageUrl,
      dicomWebUrl: dicomWebUrl,
    });
  });
};

exports.getImagesByUser = (req, res) => {
  const userId = req.user.id;

  Image.findByUser(userId, (err, results) => {
    if (err) {
      console.error('Erreur récupération images:', err);
      return res.status(500).json({ message: 'Erreur serveur.' });
    }

    if (results.length === 0) {
      return res.status(200).json({ message: 'Aucune image trouvée.', images: [] });
    }

    const images = results.map((image) => {
      return new Promise((resolve) => {
        let metadonnees;
        try {
          metadonnees = JSON.parse(image.metadonnees || '{}');
        } catch (e) {
          console.error('Erreur parsing métadonnées:', e);
          metadonnees = {};
        }

        const isDicom = image.nomFichier && image.nomFichier.toLowerCase().endsWith('.dcm');
        const imageUrl = isDicom && metadonnees.orthancId
          ? `/instances/${metadonnees.orthancId}/preview`
          : `/uploads/${image.nomFichier || 'default-file'}`;
        const dicomWebUrl = isDicom && metadonnees.orthancId
          ? `wadouri:http://localhost:5000/wado?requestType=WADO&instanceID=${metadonnees.orthancId}`
          : null;

        resolve({
          idImage: image.idImage,
          nomFichier: image.nomFichier,
          format: image.format,
          metadonnees: image.metadonnees,
          idUtilisateur: image.idUtilisateur,
          idDossier: image.idDossier,
          url: imageUrl,
          dicomWebUrl: dicomWebUrl,
        });
      });
    });

    Promise.all(images).then((imageResults) => {
      res.status(200).json({ images: imageResults });
    });
  });
};

exports.getImagesByDossier = (req, res) => {
  const idDossier = req.params.idDossier;

  if (isNaN(idDossier)) {
    return res.status(400).json({ message: 'ID dossier invalide.' });
  }

  Dossier.findById(idDossier, (err, dossierResults) => {
    if (err || dossierResults.length === 0) {
      return res.status(404).json({ message: 'Dossier non trouvé.' });
    }

    const dossier = dossierResults[0];
    if (req.user.role === 'Patient' && dossier.idPatient !== req.user.id) {
      return res.status(403).json({ message: 'Accès interdit.' });
    }
    if (req.user.role === 'Médecin' && dossier.idMedecin !== req.user.id) {
      return res.status(403).json({ message: 'Accès interdit.' });
    }

    Image.findByDossier(idDossier, (err, results) => {
      if (err) {
        console.error('Erreur récupération images:', err);
        return res.status(500).json({ message: 'Erreur serveur.' });
      }

      if (results.length === 0) {
        return res.status(200).json({ message: 'Aucune image trouvée.', images: [] });
      }

      const images = results.map((image) => {
        return new Promise((resolve) => {
          let metadonnees;
          try {
            metadonnees = JSON.parse(image.metadonnees || '{}');
          } catch (e) {
            console.error('Erreur parsing métadonnées:', e);
            metadonnees = {};
          }

          const isDicom = image.nomFichier && image.nomFichier.toLowerCase().endsWith('.dcm');
          const imageUrl = isDicom && metadonnees.orthancId
            ? `/instances/${metadonnees.orthancId}/preview`
            : `/uploads/${image.nomFichier || 'default-file'}`;
          const dicomWebUrl = isDicom && metadonnees.orthancId
            ? `wadouri:http://localhost:5000/wado?requestType=WADO&instanceID=${metadonnees.orthancId}`
            : null;

          resolve({
            idImage: image.idImage,
            nomFichier: image.nomFichier,
            format: image.format,
            metadonnees: image.metadonnees,
            idUtilisateur: image.idUtilisateur,
            idDossier: image.idDossier,
            url: imageUrl,
            dicomWebUrl: dicomWebUrl,
          });
        });
      });

      Promise.all(images).then((imageResults) => {
        res.status(200).json({ images: imageResults });
      });
    });
  });
};

exports.deleteImage = (req, res) => {
  const imageId = req.params.id;

  if (isNaN(imageId)) {
    return res.status(400).json({ message: 'ID image invalide.' });
  }

  Image.findById(imageId, (err, results) => {
    if (err) {
      console.error('Erreur récupération image:', err);
      return res.status(500).json({ message: 'Erreur serveur.' });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'Image non trouvée.' });
    }

    const image = results[0];
    if (image.idUtilisateur !== req.user.id && req.user.role !== 'Médecin') {
      return res.status(403).json({ message: 'Accès interdit.' });
    }

    Dossier.findById(image.idDossier, (err, dossierResults) => {
      if (err || dossierResults.length === 0) {
        return res.status(404).json({ message: 'Dossier non trouvé.' });
      }

      const dossier = dossierResults[0];
      if (req.user.role === 'Médecin' && dossier.idMedecin !== req.user.id) {
        return res.status(403).json({ message: 'Accès interdit.' });
      }

      if (image.nomFichier && image.nomFichier.toLowerCase().endsWith('.dcm') && image.metadonnees) {
        let metadonnees;
        try {
          metadonnees = JSON.parse(image.metadonnees);
        } catch (e) {
          console.error('Erreur parsing métadonnées:', e);
        }

        if (metadonnees && metadonnees.orthancId) {
          axios
            .delete(`http://localhost:8042/instances/${metadonnees.orthancId}`)
            .then(() => {
              console.log(`Instance Orthanc ${metadonnees.orthancId} supprimée`);
              deleteImageFromDB(imageId, req.user.id, res);
            })
            .catch((err) => {
              console.error('Erreur suppression Orthanc:', err.message);
              deleteImageFromDB(imageId, req.user.id, res);
            });
        } else {
          deleteImageFromDB(imageId, req.user.id, res);
        }
      } else {
        const filePath = path.join(__dirname, '..', 'uploads', image.nomFichier || '');
        fs.unlink(filePath, (err) => {
          if (err) {
            console.error('Erreur suppression fichier:', err);
          }
          deleteImageFromDB(imageId, req.user.id, res);
        });
      }
    });
  });
};

const deleteImageFromDB = (imageId, userId, res) => {
  Image.delete(imageId, (err) => {
    if (err) {
      console.error('Erreur suppression image DB:', err);
      return res.status(500).json({ message: 'Erreur suppression image.' });
    }

    Trace.create({ action: 'suppression image', idUtilisateur: userId, idImage: imageId }, (err) => {
      if (err) console.error('Erreur traçabilité:', err);
    });

    res.status(200).json({ message: 'Image supprimée avec succès.' });
  });
};