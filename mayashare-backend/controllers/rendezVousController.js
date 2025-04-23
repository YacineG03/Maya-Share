// controllers/rendezVousController.js
const RendezVous = require('../models/rendezVousModel');
const User = require('../models/userModel');
const Trace = require('../models/traceModel');
const moment = require('moment');
const sendEmail = require('../utils/email');

exports.createRendezVous = (req, res) => {
  if (req.user.role !== 'Patient') return res.status(403).json({ message: 'Accès interdit.' });

  const { idMedecin, dateRendezVous, motif } = req.body;

  if (!moment(dateRendezVous, 'YYYY-MM-DDTHH:mm:ss', true).isValid()) {
    return res.status(400).json({ message: 'Format de date invalide. Utilisez YYYY-MM-DDTHH:mm:ss.' });
  }

  if (moment(dateRendezVous).isBefore(moment())) {
    return res.status(400).json({ message: 'La date du rendez-vous doit être dans le futur.' });
  }

  if (!motif || motif.trim() === '') {
    return res.status(400).json({ message: 'Le motif du rendez-vous est requis.' });
  }

  User.findById(idMedecin, (err, userResults) => {
    if (err) {
      console.error('Erreur lors de la vérification du médecin:', err);
      return res.status(500).json({ message: 'Erreur serveur.' });
    }
    if (userResults.length === 0 || userResults[0].role !== 'Médecin') {
      return res.status(400).json({ message: 'L\'identifiant fourni ne correspond pas à un médecin.' });
    }

    const medecin = userResults[0];

    RendezVous.checkExistingAppointment(req.user.id, idMedecin, dateRendezVous, (err, results) => {
      if (err) {
        console.error('Erreur lors de la vérification des rendez-vous:', err);
        return res.status(500).json({ message: 'Erreur lors de la vérification des rendez-vous.' });
      }

      if (results[0].count > 0) {
        return res.status(400).json({ message: 'Vous avez déjà un rendez-vous avec ce médecin le même jour.' });
      }

      const rendezVousData = { idPatient: req.user.id, idMedecin, dateRendezVous, motif };
      RendezVous.create(rendezVousData, (err, result) => {
        if (err) {
          console.error('Erreur SQL:', err);
          return res.status(500).json({ message: 'Erreur lors de la création du rendez-vous.' });
        }

        Trace.create({ action: 'prise de rendez-vous', idUtilisateur: req.user.id }, (err) => {
          if (err) console.error('Erreur lors de l’enregistrement de la traçabilité:', err);
        });

        User.findById(req.user.id, (err, patientResults) => {
          if (err || patientResults.length === 0) {
            console.error('Erreur lors de la récupération du patient:', err);
          } else {
            const patient = patientResults[0];

            RendezVous.getMedecinEtHopital(idMedecin, (err, medecinResults) => {
              let nomHopital = 'Hôpital non renseigné';
              let adresseHopital = 'Adresse non renseignée';
              let nomMedecin = medecin.nom;
              let prenomMedecin = medecin.prenom;

              if (!err && medecinResults.length > 0) {
                const medecinInfo = medecinResults[0];
                nomHopital = medecinInfo.nomHopital || nomHopital;
                adresseHopital = medecinInfo.adresseHopital || adresseHopital;
                nomMedecin = medecinInfo.nomMedecin;
                prenomMedecin = medecinInfo.prenomMedecin;
              }

              const subjectPatient = 'Confirmation de rendez-vous';
              const textPatient = `Bonjour ${patient.nom} ${patient.prenom},\n\n` +
                `Votre rendez-vous avec le Dr. ${prenomMedecin} ${nomMedecin}` +
                ` le ${moment(dateRendezVous).format('DD/MM/YYYY à HH:mm')} a été soumis.\n\n` +
                `📍 Lieu : ${nomHopital} - ${adresseHopital}\n` +
                `📝 Motif : ${motif}\n\n` +
                `Vous recevrez une confirmation une fois le rendez-vous accepté.\n\n` +
                `Cordialement,\nMediShareSénégal`;

              sendEmail(patient.email, subjectPatient, textPatient)
                .then(() => console.log(`E-mail de confirmation envoyé à ${patient.email}`))
                .catch(err => console.error('Erreur lors de l’envoi de l’e-mail au patient:', err));

              const subjectMedecin = 'Nouveau rendez-vous soumis';
              const textMedecin = `Bonjour Dr. ${medecin.prenom} ${medecin.nom},\n\n` +
                `Un nouveau rendez-vous a été soumis par ${patient.nom} ${patient.prenom}.\n\n` +
                `📅 Date : ${moment(dateRendezVous).format('DD/MM/YYYY à HH:mm')}\n` +
                `📍 Lieu : ${nomHopital} - ${adresseHopital}\n` +
                `📝 Motif : ${motif}\n\n` +
                `Veuillez accepter ou décliner ce rendez-vous via l'application.\n\n` +
                `Cordialement,\nMediShareSénégal`;

              sendEmail(medecin.email, subjectMedecin, textMedecin)
                .then(() => console.log(`E-mail de notification envoyé au médecin ${medecin.email}`))
                .catch(err => console.error('Erreur lors de l’envoi de l’e-mail au médecin:', err));
            });
          }
        });

        res.status(201).json({ message: 'Rendez-vous créé avec succès.', id: result.insertId });
      });
    });
  });
};

exports.getRendezVousByPatient = (req, res) => {
  if (req.user.role !== 'Patient') return res.status(403).json({ message: 'Accès interdit.' });

  console.log(`Récupération des rendez-vous pour idPatient: ${req.user.id}`);

  RendezVous.findByPatient(req.user.id, (err, results) => {
    if (err) {
      console.error('Erreur lors de la récupération des rendez-vous:', err);
      return res.status(500).json({ message: 'Erreur lors de la récupération des rendez-vous.', error: err.message });
    }
    if (results.length === 0) {
      return res.status(200).json({ message: 'Aucun rendez-vous trouvé.', rendezVous: [] });
    }
    res.json(results);
  });
};

exports.getRendezVous = (req, res) => {
  const id = req.params.id;
  console.log(`Récupération du rendez-vous idRendezVous: ${id} pour utilisateur: ${req.user.id}`);

  RendezVous.findById(id, (err, results) => {
    if (err) {
      console.error('Erreur lors de la récupération du rendez-vous:', err);
      return res.status(500).json({ message: 'Erreur serveur.', error: err.message });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: 'Rendez-vous non trouvé.' });
    }

    const rendezVous = results[0];
    if (
      req.user.role === 'Patient' && rendezVous.idPatient !== req.user.id ||
      req.user.role === 'Médecin' && rendezVous.idMedecin !== req.user.id ||
      req.user.role === 'Infirmier' && !rendezVous.idHôpital // Assumes idHôpital is added in findById if needed
    ) {
      return res.status(403).json({ message: 'Accès interdit : vous ne pouvez pas voir ce rendez-vous.' });
    }

    res.json(rendezVous);
  });
};

// exports.getRendezVousByMedecin = (req, res) => {
//   if (req.user.role !== 'Médecin' && req.user.role !== 'Infirmier') {
//     return res.status(403).json({ message: 'Accès interdit.' });
//   }

//   console.log(`Récupération des rendez-vous pour idMedecin: ${req.user.id}`);

//   RendezVous.findByMedecin(req.user.id, (err, results) => {
//     if (err) {
//       console.error('Erreur lors de la récupération des rendez-vous:', err);
//       return res.status(500).json({ message: 'Erreur lors de la récupération des rendez-vous.', error: err.message });
//     }
//     if (results.length === 0) {
//       return res.status(200).json({ message: 'Aucun rendez-vous trouvé.', rendezVous: [] });
//     }
//     res.json(results);
//   });
// };

// controllers/rendezVousController.js
exports.getRendezVousByMedecin = (req, res) => {
    if (req.user.role !== 'Médecin') {
      return res.status(403).json({ message: 'Accès interdit.' });
    }
  
    console.log(`Récupération des rendez-vous pour idMedecin: ${req.user.id}`);
  
    RendezVous.findByMedecin(req.user.id, (err, results) => {
      if (err) {
        console.error('Erreur lors de la récupération des rendez-vous:', err);
        return res.status(500).json({ message: 'Erreur lors de la récupération des rendez-vous.', error: err.message });
      }
      if (results.length === 0) {
        return res.status(200).json({ message: 'Aucun rendez-vous trouvé.', rendezVous: [] });
      }
      res.json(results);
    });
  };

exports.getRendezVousForInfirmier = (req, res) => {
  if (req.user.role !== 'Infirmier') {
    return res.status(403).json({ message: 'Accès interdit.' });
  }

  console.log(`Récupération des rendez-vous pour idInfirmier: ${req.user.id}`);

  RendezVous.findByInfirmier(req.user.id, (err, results) => {
    if (err) {
      console.error('Erreur lors de la récupération des rendez-vous:', err);
      return res.status(500).json({ message: 'Erreur lors de la récupération des rendez-vous.', error: err.message });
    }
    if (results.length === 0) {
      return res.status(200).json({ message: 'Aucun rendez-vous trouvé.', rendezVous: [] });
    }
    res.json(results);
  });
};

exports.acceptRendezVous = (req, res) => {
  if (req.user.role !== 'Médecin' && req.user.role !== 'Infirmier') {
    return res.status(403).json({ message: 'Accès interdit.' });
  }

  const id = req.params.id;
  const rendezVousData = { etat: 'accepté', commentaire: req.body.commentaire };

  RendezVous.findById(id, (err, results) => {
    if (err || results.length === 0) {
      return res.status(404).json({ message: 'Rendez-vous non trouvé.' });
    }

    // Vérifier si l'infirmier ou le médecin a accès
    User.findById(req.user.id, (err, userResults) => {
      if (err || userResults.length === 0) {
        return res.status(500).json({ message: 'Erreur lors de la récupération de l’utilisateur.' });
      }

      const user = userResults[0];
      if (req.user.role === 'Médecin' && results[0].idMedecin !== req.user.id) {
        return res.status(403).json({ message: 'Accès interdit : ce rendez-vous n’est pas le vôtre.' });
      }
      if (req.user.role === 'Infirmier' && results[0].idHôpital !== user.idHôpital) {
        return res.status(403).json({ message: 'Accès interdit : ce rendez-vous n’est pas dans votre hôpital.' });
      }

      RendezVous.update(id, rendezVousData, (err) => {
        if (err) {
          return res.status(500).json({ message: 'Erreur lors de l’acceptation du rendez-vous.' });
        }

        Trace.create({ action: 'acceptation rendez-vous', idUtilisateur: req.user.id }, (err) => {
          if (err) console.error('Erreur lors de l’enregistrement de la traçabilité:', err);
        });

        User.findById(results[0].idPatient, (err, patientResults) => {
          if (err || patientResults.length === 0) {
            return res.status(500).json({ message: 'Erreur lors de la récupération du patient.' });
          }

          const patient = patientResults[0];
          const subject = 'Rendez-vous accepté';
          const text = `Bonjour ${patient.nom} ${patient.prenom},\n\nVotre rendez-vous du ${moment(results[0].dateRendezVous).format('DD/MM/YYYY à HH:mm')} a été accepté.\nCommentaire : ${rendezVousData.commentaire || 'Aucun commentaire.'}\n\nCordialement,\nMediShareSénégal`;
          sendEmail(patient.email, subject, text)
            .then(() => console.log('E-mail envoyé au patient.'))
            .catch(err => console.error('Erreur lors de l’envoi de l’e-mail:', err));

          res.json({ message: 'Rendez-vous accepté avec succès.' });
        });
      });
    });
  });
};

exports.declineRendezVous = (req, res) => {
  if (req.user.role !== 'Médecin' && req.user.role !== 'Infirmier') {
    return res.status(403).json({ message: 'Accès interdit.' });
  }

  const id = req.params.id;
  const rendezVousData = { etat: 'refusé', commentaire: req.body.commentaire };
  if (!rendezVousData.commentaire || rendezVousData.commentaire.trim() === '') {
    return res.status(400).json({ message: 'Un commentaire est requis pour refuser un rendez-vous.' });
  }

  RendezVous.findById(id, (err, results) => {
    if (err || results.length === 0) {
      return res.status(404).json({ message: 'Rendez-vous non trouvé.' });
    }

    User.findById(req.user.id, (err, userResults) => {
      if (err || userResults.length === 0) {
        return res.status(500).json({ message: 'Erreur lors de la récupération de l’utilisateur.' });
      }

      const user = userResults[0];
      if (req.user.role === 'Médecin' && results[0].idMedecin !== req.user.id) {
        return res.status(403).json({ message: 'Accès interdit : ce rendez-vous n’est pas le vôtre.' });
      }
      if (req.user.role === 'Infirmier' && results[0].idHôpital !== user.idHôpital) {
        return res.status(403).json({ message: 'Accès interdit : ce rendez-vous n’est pas dans votre hôpital.' });
      }

      RendezVous.update(id, rendezVousData, (err) => {
        if (err) {
          return res.status(500).json({ message: 'Erreur lors du refus du rendez-vous.' });
        }

        Trace.create({ action: 'refus rendez-vous', idUtilisateur: req.user.id }, (err) => {
          if (err) console.error('Erreur lors de l’enregistrement de la traçabilité:', err);
        });

        User.findById(results[0].idPatient, (err, patientResults) => {
          if (err || patientResults.length === 0) {
            return res.status(500).json({ message: 'Erreur lors de la récupération du patient.' });
          }

          const patient = patientResults[0];
          const subject = 'Rendez-vous refusé';
          const text = `Bonjour ${patient.nom} ${patient.prenom},\n\nVotre rendez-vous du ${moment(results[0].dateRendezVous).format('DD/MM/YYYY à HH:mm')} a été refusé.\nMotif : ${rendezVousData.commentaire}\n\nCordialement,\nMediShareSénégal`;
          sendEmail(patient.email, subject, text)
            .then(() => console.log('E-mail envoyé au patient.'))
            .catch(err => console.error('Erreur lors de l’envoi de l’e-mail:', err));

          res.json({ message: 'Rendez-vous refusé avec succès.' });
        });
      });
    });
  });
};

exports.deleteRendezVous = (req, res) => {
  if (req.user.role !== 'Médecin' && req.user.role !== 'Infirmier') {
    return res.status(403).json({ message: 'Accès interdit.' });
  }

  const id = req.params.id;

  RendezVous.findById(id, (err, results) => {
    if (err || results.length === 0) {
      return res.status(404).json({ message: 'Rendez-vous non trouvé.' });
    }

    User.findById(req.user.id, (err, userResults) => {
      if (err || userResults.length === 0) {
        return res.status(500).json({ message: 'Erreur lors de la récupération de l’utilisateur.' });
      }

      const user = userResults[0];
      if (req.user.role === 'Médecin' && results[0].idMedecin !== req.user.id) {
        return res.status(403).json({ message: 'Accès interdit : ce rendez-vous n’est pas le vôtre.' });
      }
      if (req.user.role === 'Infirmier' && results[0].idHôpital !== user.idHôpital) {
        return res.status(403).json({ message: 'Accès interdit : ce rendez-vous n’est pas dans votre hôpital.' });
      }

      RendezVous.delete(id, (err) => {
        if (err) {
          return res.status(500).json({ message: 'Erreur lors de la suppression du rendez-vous.' });
        }

        Trace.create({ action: 'suppression rendez-vous', idUtilisateur: req.user.id }, (err) => {
          if (err) console.error('Erreur lors de l’enregistrement de la traçabilité:', err);
        });

        User.findById(results[0].idPatient, (err, patientResults) => {
          if (err || patientResults.length === 0) {
            console.error('Erreur lors de la récupération du patient:', err);
          } else {
            const patient = patientResults[0];
            const subject = 'Rendez-vous supprimé';
            const text = `Bonjour ${patient.nom} ${patient.prenom},\n\nVotre rendez-vous du ${moment(results[0].dateRendezVous).format('DD/MM/YYYY à HH:mm')} a été supprimé.\n\nCordialement,\nMediShareSénégal`;
            sendEmail(patient.email, subject, text)
              .then(() => console.log('E-mail envoyé au patient.'))
              .catch(err => console.error('Erreur lors de l’envoi de l’e-mail:', err));
          }
        });

        res.json({ message: 'Rendez-vous supprimé avec succès.' });
      });
    });
  });
};