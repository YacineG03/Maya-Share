const Dossier = require('../models/dossierModel');
const Trace = require('../models/traceModel');

exports.createDossier = (req, res) => {
    if (req.user.role !== 'Patient' && req.user.role !== 'Médecin') {
        return res.status(403).json({ message: 'Accès interdit.' });
    }

    const dossierData = {
        idPatient: req.user.role === 'Patient' ? req.user.id : req.body.idPatient,
        description: req.body.description,
    };

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

    if (req.user.role !== 'Patient' && req.user.role !== 'Médecin') {
        return res.status(403).json({ message: 'Accès interdit.' });
    }

    Dossier.findByPatient(idPatient, (err, results) => {
        if (err) {
            console.error('Erreur lors de la récupération des dossiers:', err);
            return res.status(500).json({ message: 'Erreur lors de la récupération des dossiers.' });
        }
        if (results.length === 0) {
            return res.status(200).json({ message: 'Aucun dossier trouvé.', dossiers: [] });
        }
        res.json(results);
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