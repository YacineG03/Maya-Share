const Dossier = require('../models/dossierModel');
const Trace = require('../models/traceModel');

exports.createDossier = (req, res) => {
    if (req.user.role !== 'Médecin' || req.user.role !== 'Infirmier') return res.status(403).json({ message: 'Accès interdit.' });

    const { idPatient, diagnostic, traitement } = req.body;

    // Validation de l'ID patient
    if (!idPatient || isNaN(idPatient)) {
        return res.status(400).json({ message: 'ID patient requis et doit être un nombre.' });
    }

    const dossierData = { idPatient, idMedecin: req.user.id, diagnostic, traitement };
    Dossier.create(dossierData, (err, result) => {
        if (err) return res.status(500).json({ message: 'Erreur lors de la création du dossier.' });

        Trace.create({ action: 'création dossier', idUtilisateur: req.user.id }, (err) => {
            if (err) console.error('Erreur lors de l’enregistrement de la traçabilité:', err);
        });

        res.status(201).json({ message: 'Dossier créé avec succès.', id: result.insertId });
    });
};

exports.updateDossier = (req, res) => {
    if (req.user.role !== 'Médecin' || req.user.role !== 'Infirmier') return res.status(403).json({ message: 'Accès interdit.' });

    const id = req.params.id;
    const { diagnostic, traitement, etat } = req.body;

    // Validation des champs
    if (!diagnostic || diagnostic.trim() === '') {
        return res.status(400).json({ message: 'Le diagnostic est requis.' });
    }
    if (!traitement || traitement.trim() === '') {
        return res.status(400).json({ message: 'Le traitement est requis.' });
    }
    if (!['en cours', 'traité'].includes(etat)) {
        return res.status(400).json({ message: 'L’état doit être "en cours" ou "traité".' });
    }

    const dossierData = { diagnostic, traitement, etat };
    Dossier.findById(id, (err, results) => {
        if (err || results.length === 0) return res.status(404).json({ message: 'Dossier non trouvé.' });
        if (results[0].idMedecin !== req.user.id) return res.status(403).json({ message: 'Accès interdit.' });

        Dossier.update(id, dossierData, (err) => {
            if (err) return res.status(500).json({ message: 'Erreur lors de la mise à jour du dossier.' });

            Trace.create({ action: 'modification dossier', idUtilisateur: req.user.id }, (err) => {
                if (err) console.error('Erreur lors de l’enregistrement de la traçabilité:', err);
            });

            res.json({ message: 'Dossier mis à jour avec succès.' });
        });
    });
};
exports.getDossier = (req, res) => {
    const id = req.params.id;
    Dossier.findById(id, (err, results) => {
        if (err || results.length === 0) return res.status(404).json({ message: 'Dossier non trouvé.' });

        const dossier = results[0];
        if (req.user.role === 'Patient' && dossier.idPatient !== req.user.id) {
            return res.status(403).json({ message: 'Accès interdit.' });
        }
        if (req.user.role === 'Médecin' && dossier.idMedecin !== req.user.id) {
            return res.status(403).json({ message: 'Accès interdit.' });
        }

        Trace.create({ action: 'consultation dossier', idUtilisateur: req.user.id }, (err) => {
            if (err) console.error('Erreur lors de l’enregistrement de la traçabilité:', err);
        });

        res.json(dossier);
    });
};

exports.getDossiersByPatient = (req, res) => {
    if (req.user.role !== 'Patient') return res.status(403).json({ message: 'Accès interdit.' });

    Dossier.findByPatient(req.user.id, (err, results) => {
        if (err) return res.status(500).json({ message: 'Erreur lors de la récupération des dossiers.' });
        res.json(results);
    });
};

exports.getDossiersByMedecin = (req, res) => {
    if (req.user.role !== 'Médecin') return res.status(403).json({ message: 'Accès interdit.' });

    Dossier.findByMedecin(req.user.id, (err, results) => {
        if (err) return res.status(500).json({ message: 'Erreur lors de la récupération des dossiers.' });
        res.json(results);
    });
};

exports.updateDossier = (req, res) => {
    if (req.user.role !== 'Médecin') return res.status(403).json({ message: 'Accès interdit.' });

    const id = req.params.id;
    const dossierData = req.body;
    Dossier.findById(id, (err, results) => {
        if (err || results.length === 0) return res.status(404).json({ message: 'Dossier non trouvé.' });
        if (results[0].idMedecin !== req.user.id) return res.status(403).json({ message: 'Accès interdit.' });

        Dossier.update(id, dossierData, (err) => {
            if (err) return res.status(500).json({ message: 'Erreur lors de la mise à jour du dossier.' });

            Trace.create({ action: 'modification dossier', idUtilisateur: req.user.id }, (err) => {
                if (err) console.error('Erreur lors de l’enregistrement de la traçabilité:', err);
            });

            res.json({ message: 'Dossier mis à jour avec succès.' });
        });
    });
};