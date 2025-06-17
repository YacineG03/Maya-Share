const Trace = require('../models/traceModel');

exports.getHistory = (req, res) => {
    if (req.user.role !== 'Admin') return res.status(403).json({ message: 'Accès interdit.' });

    const filters = req.query;
    Trace.findAll(filters, (err, results) => {
        if (err) return res.status(500).json({ message: 'Erreur lors de la récupération de l’historique.' });
        res.json(results);
    });
};