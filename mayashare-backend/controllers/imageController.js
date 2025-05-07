const path = require('path');
const fs = require('fs');
const axios = require('axios');
const Image = require('../models/imageModel');
const Dossier = require('../models/dossierModel');
const Trace = require('../models/traceModel');
const { v4: uuidv4 } = require('uuid');

const ORTHANC_URL = 'http://localhost:8042';
const ORTHANC_USER = 'mayashare';
const ORTHANC_PASS = 'passer';

exports.uploadImage = async (req, res) => {
  try {
    const { idDossier, idConsultation } = req.body;
    if (!req.file) {
      return res.status(400).json({ message: 'Aucun fichier fourni' });
    }

    // Validation des champs obligatoires
    if (!idDossier || !idConsultation || isNaN(idDossier) || isNaN(idConsultation)) {
      return res.status(400).json({ message: 'idDossier et idConsultation sont requis et doivent être des nombres valides' });
    }

    // Étape 1 : Vérifier le buffer du fichier
    const fileBuffer = req.file.buffer;
    if (!fileBuffer || fileBuffer.length === 0) {
      return res.status(400).json({ message: 'Le fichier est vide ou corrompu' });
    }

    console.log('Taille du buffer avant envoi à Orthanc:', fileBuffer.length);

    // Étape 2 : Vérifier si le fichier est un DICOM
    const isDicom = req.file.mimetype === 'application/dicom' || req.file.originalname.toLowerCase().endsWith('.dcm');

    let orthancId = null;
    if (isDicom) {
      // Uploader le fichier DICOM vers Orthanc
      const orthancResponse = await axios.post(`${ORTHANC_URL}/instances`, fileBuffer, {
        auth: {
          username: ORTHANC_USER,
          password: ORTHANC_PASS,
        },
        headers: {
          'Content-Type': 'application/dicom',
          'Content-Length': fileBuffer.length,
        },
      });

      console.log('Réponse Orthanc upload:', orthancResponse.data);

      if (!orthancResponse.data || !orthancResponse.data.ID) {
        return res.status(500).json({ message: 'Échec de l’upload vers Orthanc : ID non retourné' });
      }

      orthancId = orthancResponse.data.ID;
    } else {
      // Sauvegarder les fichiers non-DICOM localement
      const fileName = req.file.originalname || `file-${Date.now()}${path.extname(req.file.originalname)}`;
      const filePath = path.join(__dirname, '..', 'Uploads', fileName);
      fs.writeFileSync(filePath, fileBuffer);
    }

    // Étape 3 : Préparer les données pour l'insertion
    const fileName = req.file.originalname || `file-${Date.now()}${isDicom ? '.dcm' : path.extname(req.file.originalname)}`;
    const imageData = {
      nomFichier: fileName,
      format: isDicom ? 'application/dicom' : req.file.mimetype,
      metadonnees: orthancId ? JSON.stringify({ orthancId }) : '{}',
      idUtilisateur: req.user.id,
      idDossier: parseInt(idDossier),
      idConsultation: parseInt(idConsultation),
    };

    // Étape 4 : Enregistrer dans la base de données via le modèle
    const result = await new Promise((resolve, reject) => {
      Image.create(imageData, (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });

    // Générer les URLs pour la réponse
    const dicomWebUrl = orthancId ? `wadouri:http://localhost:5000/wado?requestType=WADO&instanceID=${orthancId}` : null;
    const previewUrl = orthancId ? `/instances/${orthancId}/preview` : `/uploads/${fileName}`;

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
    res.status(500).json({ message: 'Erreur lors de l\'upload du fichier', error: error.message });
  }
};

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
      idConsultation: image.idConsultation,
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
          idConsultation: image.idConsultation,
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
            idConsultation: image.idConsultation,
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
      return res.status(403).json({ message: 'Accès interdit : vous n’êtes pas autorisé à supprimer cette image.' });
    }

    Dossier.findById(image.idDossier, (err, dossierResults) => {
      if (err || dossierResults.length === 0) {
        return res.status(404).json({ message: 'Dossier non trouvé.' });
      }

      const dossier = dossierResults[0];
      if (req.user.role === 'Médecin' && dossier.idMedecin !== req.user.id) {
        return res.status(403).json({ message: 'Accès interdit : vous n’êtes pas assigné à ce dossier.' });
      }

      // Étape 1 : Supprimer les enregistrements liés dans la table tracabilite
      Trace.deleteByImageId(imageId, (err) => {
        if (err) {
          console.error('Erreur lors de la suppression des traces liées:', err);
          return res.status(500).json({ message: 'Erreur lors de la suppression des traces liées.' });
        }

        // Étape 2 : Supprimer l’instance Orthanc si c’est une image DICOM
        if (image.nomFichier.toLowerCase().endsWith('.dcm') && image.metadonnees) {
          let metadonnees;
          try {
            metadonnees = JSON.parse(image.metadonnees);
          } catch (e) {
            console.error('Erreur lors du parsing des métadonnées:', e.message);
            return deleteImageFromDB(imageId, req.user.id, res);
          }

          if (metadonnees && metadonnees.orthancId) {
            console.log(`Suppression de l’instance Orthanc ${metadonnees.orthancId} pour l’image ${imageId}`);
            axios.delete(`${ORTHANC_URL}/instances/${metadonnees.orthancId}`, {
              auth: {
                username: ORTHANC_USER,
                password: ORTHANC_PASS,
              },
            })
              .then(() => {
                console.log(`Instance Orthanc ${metadonnees.orthancId} supprimée avec succès`);
                deleteImageFromDB(imageId, req.user.id, res);
              })
              .catch((err) => {
                console.error('Erreur lors de la suppression de l’instance Orthanc:', err.message);
                deleteImageFromDB(imageId, req.user.id, res);
              });
          } else {
            deleteImageFromDB(imageId, req.user.id, res);
          }
        } else {
          // Étape 3 : Supprimer le fichier local si ce n’est pas une image DICOM
          const filePath = path.join(__dirname, '..', 'Uploads', image.nomFichier || '');
          fs.unlink(filePath, (err) => {
            if (err) {
              console.error('Erreur lors de la suppression du fichier:', err);
            }
            deleteImageFromDB(imageId, req.user.id, res);
          });
        }
      });
    });
  });
};

const deleteImageFromDB = (imageId, userId, res) => {
  Image.delete(imageId, (err) => {
    if (err) {
      console.error('Erreur lors de la suppression de l’image de la base de données:', err);
      return res.status(500).json({ message: 'Erreur lors de la suppression de l’image.' });
    }

    Trace.create({ action: 'suppression image', idUtilisateur: userId, idImage: imageId }, (err) => {
      if (err) console.error('Erreur lors de l’enregistrement de la traçabilité:', err);
    });

    res.status(200).json({ message: 'Image supprimée avec succès.' });
  });
};

module.exports = exports;