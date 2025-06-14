const Consultation = require('../models/consultationModel');
const Dossier = require('../models/dossierModel');
const Share = require('../models/shareModel');
const Trace = require('../models/traceModel');

exports.createConsultation = (req, res) => {
    if (req.user.role !== 'Médecin' && req.user.role !== 'Infirmier') {
        return res.status(403).json({ message: 'Accès interdit : seuls les patients, médecins et infirmiers peuvent créer une consultation.' });
    }

    const { idDossier, notes, ordonnance } = req.body;
    if (!idDossier || isNaN(idDossier)) {
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
                proceedWithCreation();
            });
            return;
        }
        proceedWithCreation();

        function proceedWithCreation() {
            const signatureMedecin = req.user.role === 'Médecin' ? `${req.user.prenom} ${req.user.nom}` : null;
            Consultation.create({ idDossier, notes: notes || '', ordonnance: ordonnance || null, signatureMedecin }, (err, result) => {
                if (err) {
                    console.error('Erreur lors de la création de la consultation:', err);
                    return res.status(500).json({ message: 'Erreur lors de la création de la consultation.' });
                }

                Trace.create({ action: 'création consultation', idUtilisateur: req.user.id }, (err) => {
                    if (err) console.error('Erreur lors de l’enregistrement de la traçabilité:', err);
                });

                res.status(201).json({ message: 'Consultation créée avec succès.', id: result.insertId });
            });
        }
    });
};

exports.getConsultationsByDossier = (req, res) => {
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
                fetchConsultations();
            });
            return;
        }

        fetchConsultations();

        function fetchConsultations() {
            Consultation.findByDossier(idDossier, (err, consultations) => {
                if (err) {
                    console.error('Erreur lors de la récupération des consultations:', err);
                    return res.status(500).json({ message: 'Erreur lors de la récupération des consultations.' });
                }

                const consultationList = consultations.map(c => ({
                    idConsultation: c.idConsultation,
                    dateConsultation: c.dateConsultation,
                    notes: c.notes,
                    ordonnance: c.ordonnance,
                    signatureMedecin: c.signatureMedecin,
                    imageIds: c.imageIds ? c.imageIds.split(',').map(Number).filter(id => id) : []
                }));

                res.status(200).json({ consultations: consultationList });
            });
        }
    });
};

exports.updateConsultation = (req, res) => {
    const { idConsultation } = req.params;
    const { notes, ordonnance } = req.body;

    if (!idConsultation || isNaN(idConsultation)) {
        return res.status(400).json({ message: 'idConsultation doit être un nombre valide.' });
    }

    Consultation.findById(idConsultation, (err, consultationResults) => {
        if (err || consultationResults.length === 0) {
            return res.status(404).json({ message: 'Consultation non trouvée.' });
        }

        const consultation = consultationResults[0];
        const idDossier = consultation.idDossier;

        Dossier.findById(idDossier, (err, dossierResults) => {
            if (err || dossierResults.length === 0) {
                return res.status(404).json({ message: 'Dossier associé non trouvé.' });
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
                    proceedUpdate();
                });
                return;
            }

            proceedUpdate();

            function proceedUpdate() {
                const signatureMedecin = req.user.role === 'Médecin' ? `${req.user.prenom} ${req.user.nom}` : consultation.signatureMedecin;
                Consultation.update(idConsultation, { notes, ordonnance: ordonnance || null, signatureMedecin }, (err, result) => {
                    if (err) {
                        console.error('Erreur lors de la mise à jour de la consultation :', err);
                        return res.status(500).json({ message: 'Erreur lors de la mise à jour de la consultation.' });
                    }

                    Trace.create({ action: 'mise à jour consultation', idUtilisateur: req.user.id }, (err) => {
                        if (err) console.error('Erreur lors de l’enregistrement de la traçabilité:', err);
                    });

                    res.status(200).json({ message: 'Consultation mise à jour avec succès.' });
                });
            }
        });
    });
};