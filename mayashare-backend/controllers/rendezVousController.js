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

    const rendezVousData = { idPatient: req.user.id, idMedecin, dateRendezVous, motif };
    RendezVous.create(rendezVousData, (err, result) => {
        if (err) return res.status(500).json({ message: 'Erreur lors de la création du rendez-vous.' });

        Trace.create({ action: 'prise de rendez-vous', idUtilisateur: req.user.id }, (err) => {
            if (err) console.error('Erreur lors de l’enregistrement de la traçabilité:', err);
        });

        res.status(201).json({ message: 'Rendez-vous créé avec succès.', id: result.insertId });
    });
};

exports.getRendezVous = (req, res) => {
    const id = req.params.id;
    RendezVous.findById(id, (err, results) => {
        if (err || results.length === 0) return res.status(404).json({ message: 'Rendez-vous non trouvé.' });

        const rendezVous = results[0];
        if (req.user.role === 'Patient' && rendezVous.idPatient !== req.user.id) {
            return res.status(403).json({ message: 'Accès interdit.' });
        }
        if (req.user.role === 'Médecin' && rendezVous.idMedecin !== req.user.id) {
            return res.status(403).json({ message: 'Accès interdit.' });
        }

        res.json(rendezVous);
    });
};

exports.getRendezVousByPatient = (req, res) => {
    if (req.user.role !== 'Patient') return res.status(403).json({ message: 'Accès interdit.' });

    RendezVous.findByPatient(req.user.id, (err, results) => {
        if (err) return res.status(500).json({ message: 'Erreur lors de la récupération des rendez-vous.' });
        res.json(results);
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
                User.updateHôpital(results[0].idPatient, idHôpital, (err) => {
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

