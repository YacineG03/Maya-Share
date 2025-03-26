const User = require('../models/userModel');
const Trace = require('../models/traceModel');

exports.createUser = (req, res) => {
    if (req.user.role !== 'Admin') return res.status(403).json({ message: 'Accès interdit.' });

    const { nom, prenom, role, identifiant, motDePasse, email, idHôpital } = req.body;

    // Validations communes
    if (!nom || nom.trim() === '') return res.status(400).json({ message: 'Le nom est requis.' });
    if (!prenom || prenom.trim() === '') return res.status(400).json({ message: 'Le prénom est requis.' });
    if (!role || !['Médecin', 'Infirmier', 'Admin', 'Patient'].includes(role)) return res.status(400).json({ message: 'Le rôle doit être "Médecin", "Infirmier", "Admin" ou "Patient".' });
    if (!identifiant || identifiant.trim() === '') return res.status(400).json({ message: 'L’identifiant est requis.' });
    if (!motDePasse || motDePasse.length < 6) return res.status(400).json({ message: 'Le mot de passe doit contenir au moins 6 caractères.' });
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ message: 'Adresse e-mail invalide.' });

    // Validation de l’idHôpital pour Médecin et Infirmier
    if (['Médecin', 'Infirmier'].includes(role)) {
        if (!idHôpital || isNaN(idHôpital)) {
            return res.status(400).json({ message: 'L’ID de l’hôpital est requis pour les médecins et infirmiers.' });
        }
    } else {
        // Pour Admin et Patient, idHôpital est null (sauf si défini manuellement pour Admin)
        idHôpital = idHôpital || null;
    }

    const userData = { nom, prenom, role, identifiant, motDePasse, email, idHôpital };
    User.create(userData, (err, result) => {
        if (err) return res.status(500).json({ message: 'Erreur lors de la création de l’utilisateur.' });

        Trace.create({ action: 'création utilisateur', idUtilisateur: req.user.id }, (err) => {
            if (err) console.error('Erreur lors de l’enregistrement de la traçabilité:', err);
        });

        res.status(201).json({ message: 'Utilisateur créé avec succès.', id: result.insertId });
    });
};

exports.updateUser = (req, res) => {
    if (req.user.role !== 'Admin') return res.status(403).json({ message: 'Accès interdit.' });

    const id = req.params.id;
    const { nom, prenom, role, motDePasse, email, idHôpital } = req.body;

    // Validations
    if (nom && nom.trim() === '') return res.status(400).json({ message: 'Le nom ne peut pas être vide.' });
    if (prenom && prenom.trim() === '') return res.status(400).json({ message: 'Le prénom ne peut pas être vide.' });
    if (role && !['Médecin', 'Infirmier', 'Admin', 'Patient'].includes(role)) return res.status(400).json({ message: 'Le rôle doit être "Médecin", "Infirmier", "Admin" ou "Patient".' });
    if (motDePasse && motDePasse.length < 6) return res.status(400).json({ message: 'Le mot de passe doit contenir au moins 6 caractères.' });
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ message: 'Adresse e-mail invalide.' });

    // Validation de l’idHôpital pour Médecin et Infirmier
    if (['Médecin', 'Infirmier'].includes(role)) {
        if (!idHôpital || isNaN(idHôpital)) {
            return res.status(400).json({ message: 'L’ID de l’hôpital est requis pour les médecins et infirmiers.' });
        }
    }

    const userData = { nom, prenom, role, motDePasse, email, idHôpital };
    User.update(id, userData, (err) => {
        if (err) return res.status(500).json({ message: 'Erreur lors de la mise à jour de l’utilisateur.' });

        Trace.create({ action: 'modification utilisateur', idUtilisateur: req.user.id }, (err) => {
            if (err) console.error('Erreur lors de l’enregistrement de la traçabilité:', err);
        });

        res.json({ message: 'Utilisateur mis à jour avec succès.' });
    });
};

exports.deleteUser = (req, res) => {
    if (req.user.role !== 'Admin') return res.status(403).json({ message: 'Accès interdit.' });

    const id = req.params.id;
    User.delete(id, (err) => {
        if (err) return res.status(500).json({ message: 'Erreur lors de la suppression de l’utilisateur.' });

        Trace.create({ action: 'suppression utilisateur', idUtilisateur: req.user.id }, (err) => {
            if (err) console.error('Erreur lors de l’enregistrement de la traçabilité:', err);
        });

        res.json({ message: 'Utilisateur supprimé avec succès.' });
    });
};

exports.register = (req, res) => {
    const { nom, prenom, identifiant, motDePasse, email } = req.body;

    // Validations
    if (!nom || nom.trim() === '') return res.status(400).json({ message: 'Le nom est requis.' });
    if (!prenom || prenom.trim() === '') return res.status(400).json({ message: 'Le prénom est requis.' });
    if (!identifiant || identifiant.trim() === '') return res.status(400).json({ message: 'L’identifiant est requis.' });
    if (!motDePasse || motDePasse.length < 6) return res.status(400).json({ message: 'Le mot de passe doit contenir au moins 6 caractères.' });
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ message: 'Adresse e-mail invalide.' });

    // Vérifier si l’identifiant ou l’e-mail existe déjà
    User.findByEmail(email, (err, results) => {
        if (err) return res.status(500).json({ message: 'Erreur serveur.' });
        if (results.length > 0) return res.status(400).json({ message: 'Cet email est déjà utilisé.' });

        const userData = { nom, prenom, role: 'Patient', identifiant, motDePasse, email };
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

        res.json({ token, user: { id: user.idUtilisateur, nom: user.nom, prenom: user.prenom, role: user.role } });
    });
};