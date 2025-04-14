const RendezVous = require('../models/rendezVousModel');
const User = require('../models/userModel');
const Trace = require('../models/traceModel');
const moment = require('moment');
const sendEmail = require('../utils/email');

exports.createRendezVous = (req, res) => {
    if (req.user.role !== 'Patient') return res.status(403).json({ message: 'Accès interdit.' });

    const { idMedecin, dateRendezVous, motif } = req.body;

    // Validation de la date
    if (!moment(dateRendezVous, 'YYYY-MM-DDTHH:mm:ss', true).isValid()) {
        return res.status(400).json({ message: 'Format de date invalide. Utilisez YYYY-MM-DDTHH:mm:ss (ex. 2025-03-27T10:00:00).' });
    }

    // Vérifier que la date est dans le futur
    if (moment(dateRendezVous).isBefore(moment())) {
        return res.status(400).json({ message: 'La date du rendez-vous doit être dans le futur.' });
    }

    // Vérifier que le motif est fourni et non vide
    if (!motif || motif.trim() === '') {
        return res.status(400).json({ message: 'Le motif du rendez-vous est requis.' });
    }

    // Vérifier que idMedecin correspond à un médecin
    User.findById(idMedecin, (err, userResults) => {
       if (err) {
            console.error('Erreur lors de la vérification du médecin:', err);
            return res.status(500).json({ message: 'Erreur serveur.' });
        }
        if (userResults.length === 0 || userResults[0].role !== 'Médecin') {
            return res.status(400).json({ message: 'L\'identifiant fourni ne correspond pas à un médecin.' });
        }

        // Vérifier qu'il n'existe pas de rendez-vous le même jour avec le même médecin
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

                // Récupérer les informations du patient
                User.findById(req.user.id, (err, patientResults) => {
                    if (err || patientResults.length === 0) {
                        console.error('Erreur lors de la récupération du patient:', err);
                        // Continuer sans bloquer la réponse
                    } else {
                        const patient = patientResults[0];

                        // Récupérer les informations du médecin et de l’hôpital
                        RendezVous.getMedecinEtHopital(idMedecin, (err, medecinResults) => {
                            if (err || medecinResults.length === 0) {
                                console.error('Erreur lors de la récupération des infos médecin/hôpital:', err);
                                // Envoyer l’e-mail avec des valeurs par défaut si nécessaire
                                const subject = 'Confirmation de rendez-vous';
                                const text = `Bonjour ${patient.nom} ${patient.prenom},\n\n` +
                                             `Votre rendez-vous le ${moment(dateRendezVous).format('DD/MM/YYYY à HH:mm')} a été soumis.\n` +
                                             `Motif : ${motif}\n` +
                                             `Médecin : Non spécifié\n` +
                                             `Hôpital : Non spécifié\n` +
                                             `Adresse : Non spécifiée\n\n` +
                                             `Vous recevrez une confirmation une fois le rendez-vous accepté.\n\n` +
                                             `Cordialement,\nMaya Share`;
                                sendEmail(patient.email, subject, text)
                                    .then(() => console.log(`E-mail de confirmation envoyé à ${patient.email}`))
                                    .catch(err => console.error('Erreur lors de l’envoi de l’e-mail:', err));
                                return;
                            }

                            const medecin = medecinResults[0];

                            const subject = 'Confirmation de rendez-vous';
                            const text = `Bonjour ${patient.nom} ${patient.prenom},\n\n` +
                                         `Votre rendez-vous avec le Dr. ${medecin.prenomMedecin} ${medecin.nomMedecin}` +
                                         ` le ${moment(dateRendezVous).format('DD/MM/YYYY à HH:mm')} a été soumis.\n\n` +
                                         `📍 Lieu : ${medecin.nomHopital || 'Hôpital non renseigné'} - ${medecin.adresseHopital || 'Adresse non renseignée'}\n` +
                                         `📝 Motif : ${motif}\n\n` +
                                         `Vous recevrez une confirmation une fois le rendez-vous accepté.\n\n` +
                                         `Cordialement,\nMaya Share`;

                            sendEmail(patient.email, subject, text)
                                .then(() => console.log(`E-mail de confirmation envoyé à ${patient.email}`))
                                .catch(err => console.error('Erreur lors de l’envoi de l’e-mail:', err));
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
        if (req.user.role === 'Patient' && rendezVous.idPatient !== req.user.id) {
            return res.status(403).json({ message: 'Accès interdit : vous ne pouvez pas voir ce rendez-vous.' });
        }
        if (req.user.role === 'Médecin' && rendezVous.idMedecin !== req.user.id) {
            return res.status(403).json({ message: 'Accès interdit : vous ne pouvez pas voir ce rendez-vous.' });
        }

        res.json(rendezVous);
    });
};
exports.getRendezVousByMedecin = (req, res) => {
    if (req.user.role !== 'Médecin') return res.status(403).json({ message: 'Accès interdit.' });

    RendezVous.findByMedecin(req.user.id, (err, results) => {
        if (err) return res.status(500).json({ message: 'Erreur lors de la récupération des rendez-vous.' });
        res.json(results);
    });
};

exports.acceptRendezVous = (req, res) => {
    if (req.user.role !== 'Médecin') return res.status(403).json({ message: 'Accès interdit.' });

    const id = req.params.id;
    const rendezVousData = { etat: 'accepté', commentaire: req.body.commentaire };

    RendezVous.findById(id, (err, results) => {
        if (err || results.length === 0) return res.status(404).json({ message: 'Rendez-vous non trouvé.' });
        if (results[0].idMedecin !== req.user.id) return res.status(403).json({ message: 'Accès interdit.' });

        // Mettre à jour le rendez-vous
        RendezVous.update(id, rendezVousData, (err) => {
            if (err) return res.status(500).json({ message: 'Erreur lors de l’acceptation du rendez-vous.' });

            Trace.create({ action: 'acceptation rendez-vous', idUtilisateur: req.user.id }, (err) => {
                if (err) console.error('Erreur lors de l’enregistrement de la traçabilité:', err);
            });

            // Récupérer le médecin pour obtenir son idHôpital
            User.findById(req.user.id, (err, medecinResults) => {
                if (err || medecinResults.length === 0) return res.status(500).json({ message: 'Erreur lors de la récupération du médecin.' });

                const medecin = medecinResults[0];
                const idHôpital = medecin.idHôpital;

                // Mettre à jour l’idHôpital du patient
                User.updateHopital(results[0].idPatient, idHôpital, (err) => {
                    if (err) console.error('Erreur lors de la mise à jour de l’idHôpital du patient:', err);
                });

                // Envoyer un e-mail au patient
                User.findById(results[0].idPatient, (err, patientResults) => {
                    if (err || patientResults.length === 0) return res.status(500).json({ message: 'Erreur lors de la récupération du patient.' });

                    const patient = patientResults[0];
                    const subject = 'Rendez-vous accepté';
                    const text = `Bonjour ${patient.nom} ${patient.prenom},\n\nVotre rendez-vous du ${moment(results[0].dateRendezVous).format('DD/MM/YYYY à HH:mm')} a été accepté.\nCommentaire : ${rendezVousData.commentaire || 'Aucun commentaire.'}\n\nCordialement,\nMediShareSénégal`;
                    sendEmail(patient.email, subject, text)
                        .then(() => console.log('E-mail envoyé au patient.'))
                        .catch(err => console.error('Erreur lors de l’envoi de l’e-mail:', err));
                });

                res.json({ message: 'Rendez-vous accepté avec succès.' });
            });
        });
    });
};

exports.declineRendezVous = (req, res) => {
    if (req.user.role !== 'Médecin') return res.status(403).json({ message: 'Accès interdit.' });

    const id = req.params.id;
    const rendezVousData = { etat: 'décliné', commentaire: req.body.commentaire };
    if (!rendezVousData.commentaire || rendezVousData.commentaire.trim() === '') {
        return res.status(400).json({ message: 'Un commentaire est requis pour décliner un rendez-vous.' });
    }

    RendezVous.findById(id, (err, results) => {
        if (err || results.length === 0) return res.status(404).json({ message: 'Rendez-vous non trouvé.' });
        if (results[0].idMedecin !== req.user.id) return res.status(403).json({ message: 'Accès interdit.' });

        RendezVous.update(id, rendezVousData, (err) => {
            if (err) return res.status(500).json({ message: 'Erreur lors du refus du rendez-vous.' });

            Trace.create({ action: 'refus rendez-vous', idUtilisateur: req.user.id }, (err) => {
                if (err) console.error('Erreur lors de l’enregistrement de la traçabilité:', err);
            });

            // Envoyer un e-mail au patient
            User.findById(results[0].idPatient, (err, patientResults) => {
                if (err || patientResults.length === 0) return res.status(500).json({ message: 'Erreur lors de la récupération du patient.' });

                const patient = patientResults[0];
                const subject = 'Rendez-vous décliné';
                const text = `Bonjour ${patient.nom} ${patient.prenom},\n\nVotre rendez-vous du ${moment(results[0].dateRendezVous).format('DD/MM/YYYY à HH:mm')} a été décliné.\nMotif : ${rendezVousData.commentaire}\n\nCordialement,\nMediShareSénégal`;
                sendEmail(patient.email, subject, text)
                    .then(() => console.log('E-mail envoyé au patient.'))
                    .catch(err => console.error('Erreur lors de l’envoi de l’e-mail:', err));
            });

            res.json({ message: 'Rendez-vous décliné avec succès.' });
        });
    });
};