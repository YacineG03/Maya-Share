const User = require('../models/userModel');
const Trace = require('../models/traceModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Fonction pour générer un identifiant unique basé sur le prénom et le nom
const generateIdentifiant = (nom, prenom) => {
    const randomNumber = Math.floor(Math.random() * 10000); // Générer un nombre aléatoire
    return `${prenom.charAt(0)}${nom}${randomNumber}`; // Exemple : PSmith1234
};

exports.register = (req, res) => {
    const { nom, prenom, motDePasse, email, idHopital, telephone } = req.body;

    // Générer un identifiant unique en utilisant la fonction generateIdentifiant
    const identifiant = generateIdentifiant(nom, prenom);

    // Validations communes
    if (!nom || nom.trim() === '') return res.status(400).json({ message: 'Le nom est requis.' });
    if (!prenom || prenom.trim() === '') return res.status(400).json({ message: 'Le prénom est requis.' });
    if (!motDePasse || motDePasse.length < 6) return res.status(400).json({ message: 'Le mot de passe doit contenir au moins 6 caractères.' });
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ message: 'Adresse e-mail invalide.' });
    if (!telephone || telephone.trim() === '') return res.status(400).json({ message: 'Le numéro de téléphone est requis.' });

    // Les patients s'inscrivent sans hôpital (idHopital sera null)
    const role = 'Patient';
    const userData = { nom, prenom, role, identifiant, motDePasse, email, idHopital: null, telephone }; // idHopital null pour les patients

    // Vérification si l'email existe déjà
    User.findByEmail(email, (err, results) => {
        if (err) return res.status(500).json({ message: 'Erreur serveur.' });
        if (results.length > 0) return res.status(400).json({ message: 'Cet email est déjà utilisé.' });

        // Création de l'utilisateur dans la base de données
        User.create(userData, (err, result) => {
            if (err) return res.status(500).json({ message: 'Erreur lors de l’inscription.' });

            // Enregistrement de l'action de l'inscription dans la traçabilité
            Trace.create({ action: 'inscription', idUtilisateur: result.insertId }, (err) => {
                if (err) console.error('Erreur lors de l’enregistrement de la traçabilité:', err);
            });

            // Réponse de succès
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

        // Enregistrement de l'action de connexion dans la traçabilité
        Trace.create({ action: 'connexion', idUtilisateur: user.idUtilisateur }, (err) => {
            if (err) console.error('Erreur lors de l’enregistrement de la traçabilité:', err);
        });

        // Réponse avec le token et les informations utilisateur
        res.json({ token, user: { id: user.idUtilisateur, nom: user.nom, prenom: user.prenom, role: user.role, idHopital: user.idHopital, telephone: user.telephone } });
    });
};
