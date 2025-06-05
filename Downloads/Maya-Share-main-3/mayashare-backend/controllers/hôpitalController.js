const Hopital = require('../models/hôpitalModel');
const Trace = require('../models/traceModel');

exports.createHopital = (req, res) => {
    if (req.user.role !== 'Admin') return res.status(403).json({ message: 'Accès interdit.' });

    const { nom, adresse, ville } = req.body;

    // Validations
    if (!nom || nom.trim() === '') return res.status(400).json({ message: 'Le nom de l’hôpital est requis.' });
    if (!adresse || adresse.trim() === '') return res.status(400).json({ message: 'L’adresse est requise.' });
    if (!ville || ville.trim() === '') return res.status(400).json({ message: 'La ville est requise.' });

    const hôpitalData = { nom, adresse, ville };
    Hopital.create(hôpitalData, (err, result) => {
        if (err) return res.status(500).json({ message: 'Erreur lors de la création de l’hôpital.' });

        Trace.create({ action: 'création hôpital', idUtilisateur: req.user.id }, (err) => {
            if (err) console.error('Erreur lors de l’enregistrement de la traçabilité:', err);
        });

        res.status(201).json({ message: 'Hôpital créé avec succès.', id: result.insertId });
    });
};

exports.getHopital = (req, res) => {
    if (req.user.role !== 'Admin') return res.status(403).json({ message: 'Accès interdit.' });

    const id = req.params.id;
    Hopital.findById(id, (err, results) => {
        if (err || results.length === 0) return res.status(404).json({ message: 'Hôpital non trouvé.' });
        res.json(results[0]);
    });
};

exports.getAllHopitaux = (req, res) => {
    // if (req.user.role !== 'Admin') return res.status(403).json({ message: 'Accès interdit.' });

    // Hopital.findAll((err, results) => {
    //     if (err) return res.status(500).json({ message: 'Erreur lors de la récupération des hôpitaux.' });
    //     res.json(results);
    // });

    Hopital.findAllWithMedecins((err, results) => {
        if (err) {
          console.error('Erreur SQL:', err);
          return res.status(500).json({ message: 'Erreur lors de la récupération des hôpitaux.' });
        }
        res.json(results);
      });
};

exports.updateHopital = (req, res) => {
    if (req.user.role !== 'Admin') return res.status(403).json({ message: 'Accès interdit.' });

    const id = req.params.id;
    const { nom, adresse, ville } = req.body;

    // Validations
    if (!nom || nom.trim() === '') return res.status(400).json({ message: 'Le nom de l’hôpital est requis.' });
    if (!adresse || adresse.trim() === '') return res.status(400).json({ message: 'L’adresse est requise.' });
    if (!ville || ville.trim() === '') return res.status(400).json({ message: 'La ville est requise.' });

    const hôpitalData = { nom, adresse, ville };
    Hopital.update(id, hôpitalData, (err) => {
        if (err) return res.status(500).json({ message: 'Erreur lors de la mise à jour de l’hôpital.' });

        Trace.create({ action: 'modification hôpital', idUtilisateur: req.user.id }, (err) => {
            if (err) console.error('Erreur lors de l’enregistrement de la traçabilité:', err);
        });

        res.json({ message: 'Hôpital mis à jour avec succès.' });
    });
};

exports.deleteHopital = (req, res) => {
    if (req.user.role !== 'Admin') return res.status(403).json({ message: 'Accès interdit.' });

    const id = req.params.id;
    Hopital.delete(id, (err) => {
        if (err) return res.status(500).json({ message: 'Erreur lors de la suppression de l’hôpital.' });

        Trace.create({ action: 'suppression hôpital', idUtilisateur: req.user.id }, (err) => {
            if (err) console.error('Erreur lors de l’enregistrement de la traçabilité:', err);
        });

        res.json({ message: 'Hôpital supprimé avec succès.' });
    });
};