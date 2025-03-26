const User = require('../models/userModel');
const Trace = require('../models/traceModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = (req, res) => {
    const { nom, prenom, identifiant, motDePasse, email, idHôpital } = req.body;

    // Validations communes
    if (!nom || nom.trim() === '') return res.status(400).json({ message: 'Le nom est requis.' });
    if (!prenom || prenom.trim() === '') return res.status(400).json({ message: 'Le prénom est requis.' });
    if (!identifiant || identifiant.trim() === '') return res.status(400).json({ message: 'L’identifiant est requis.' });
    if (!motDePasse || motDePasse.length < 6) return res.status(400).json({ message: 'Le mot de passe doit contenir au moins 6 caractères.' });
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ message: 'Adresse e-mail invalide.' });

    // Les patients s'inscrivent sans hôpital (idHôpital sera null)
    const role = 'Patient';
    const userData = { nom, prenom, role, identifiant, motDePasse, email, idHôpital: null }; // idHôpital null pour les patients

    User.findByEmail(email, (err, results) => {
        if (err) return res.status(500).json({ message: 'Erreur serveur.' });
        if (results.length > 0) return res.status(400).json({ message: 'Cet email est déjà utilisé.' });

        User.create(userData, (err, result) => {
            if (err) return res.status(500).json({ message: 'Erreur lors de l’inscription.' });

            Trace.create({ action: 'inscription', idUtilisateur: result.insertId }, (err) => {
                if (err) console.error('Erreur lors de l’enregistrement de la traçabilité:', err);
            });

            res.status(201).json({ message: 'Inscription réussie. Veuillez vous connecter.' });
        });
    });
};

exports.login = (req, res) => {
    const { email, motDePasse } = req.body;

    User.findByEmail(email, (err, results) => {
        if (err) return res.status(500).json({ message: 'Erreur serveur.' });
        if (results.length === 0) return res.status(401).json({ message: 'Email ou mot de passe incorrect.' });

        const user = results[0];
        const isMatch = bcrypt.compareSync(motDePasse, user.motDePasse);
        if (!isMatch) return res.status(401).json({ message: 'Email ou mot de passe incorrect.' });

        const token = jwt.sign({ id: user.idUtilisateur, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

        Trace.create({ action: 'connexion', idUtilisateur: user.idUtilisateur }, (err) => {
            if (err) console.error('Erreur lors de l’enregistrement de la traçabilité:', err);
        });

        res.json({ token, user: { id: user.idUtilisateur, nom: user.nom, prenom: user.prenom, role: user.role, idHôpital: user.idHôpital } });
    });
};