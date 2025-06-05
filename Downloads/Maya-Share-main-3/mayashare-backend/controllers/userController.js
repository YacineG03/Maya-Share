const User = require('../models/userModel');
const Trace = require('../models/traceModel');

// Fonction pour générer un identifiant unique basé sur le prénom et le nom
const generateIdentifiant = (nom, prenom) => {
    const randomNumber = Math.floor(Math.random() * 10000); 
    return `${prenom.charAt(0)}${nom}${randomNumber}`; 
};

exports.createUser = (req, res) => {
    if (req.user.role !== 'Admin') return res.status(403).json({ message: 'Accès interdit.' });

    const { nom, prenom, role, motDePasse, email, telephone, idHopital, sexe, dateNaissance } = req.body;

    // Validation des champs obligatoires
    if (!nom || nom.trim() === '') return res.status(400).json({ message: 'Le nom est requis.' });
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ message: 'Adresse e-mail invalide.' });
    if (!motDePasse || motDePasse.length < 6) return res.status(400).json({ message: 'Le mot de passe doit contenir au moins 6 caractères.' });
    // if (!identifiant || identifiant.trim() === '') return res.status(400).json({ message: 'L’identifiant est requis.' });
    const identifiant = generateIdentifiant(nom, prenom);

    // Validation des champs optionnels
    if (prenom && prenom.trim() === '') return res.status(400).json({ message: 'Le prénom ne peut pas être vide.' });
    if (!role || !['Médecin', 'Infirmier', 'Admin', 'Patient'].includes(role)) return res.status(400).json({ message: 'Le rôle doit être "Médecin", "Infirmier", "Admin" ou "Patient".' });
    if (telephone && telephone.trim() === '') return res.status(400).json({ message: 'Le numéro de téléphone ne peut pas être vide.' });
    if (sexe && !['H', 'F'].includes(sexe)) return res.status(400).json({ message: 'Le sexe doit être "H" ou "F".' });
    if (dateNaissance) {
        const birthDate = new Date(dateNaissance);
        const today = new Date();
        if (isNaN(birthDate.getTime())) return res.status(400).json({ message: 'Format de date invalide.' });
        if (birthDate > today) return res.status(400).json({ message: 'La date de naissance ne peut pas être dans le futur.' });
    }

    // Gestion de l'ID hôpital pour les rôles Médecin et Infirmier
    const hospitalId = ['Médecin', 'Infirmier'].includes(role) && (!idHopital || isNaN(idHopital))
        ? null : idHopital || null;

    if (['Médecin', 'Infirmier'].includes(role) && !hospitalId) {
        return res.status(400).json({ message: 'L’ID de l’hôpital est requis pour les médecins et infirmiers.' });
    }

    // Vérification des contraintes UNIQUE
    User.findByEmail(email, (err, results) => {
        if (err) return res.status(500).json({ message: 'Erreur serveur.' });
        if (results.length > 0) return res.status(400).json({ message: 'Cet email est déjà utilisé.' });

        User.findByIdentifiant(identifiant, (err, identResults) => {
            if (err) return res.status(500).json({ message: 'Erreur serveur.' });
            if (identResults.length > 0) return res.status(400).json({ message: 'Cet identifiant est déjà utilisé.' });

            const userData = { 
                nom, 
                prenom: prenom || null, 
                role, 
                identifiant, 
                motDePasse, 
                email, 
                telephone: telephone || null, 
                idHopital: hospitalId, 
                sexe: sexe || null, 
                dateNaissance: dateNaissance || null 
            };
            
            User.create(userData, (err, result) => {
                if (err) {
                    console.error("Erreur SQL:", err);
                    return res.status(500).json({ message: 'Erreur lors de la création de l’utilisateur.' });
                }

                Trace.create({ action: 'création utilisateur', idUtilisateur: req.user.id }, (err) => {
                    if (err) console.error('Erreur lors de l’enregistrement de la traçabilité:', err);
                });

                res.status(201).json({ message: 'Utilisateur créé avec succès.', id: result.insertId });
            });
        });
    });
};

exports.getAllUsers = (req, res) => {
    const allowedRoles = ['Admin', 'Médecin', 'Infirmier'];
    if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({ message: 'Accès interdit.' });
    }

    const filters = {
        role: req.query.role,
        nom: req.query.nom,
        prenom: req.query.prenom,
        email: req.query.email,
        telephone: req.query.telephone,
        limit: req.query.limit,
        offset: req.query.offset
    };

    User.countWithFilters(filters, (err, countResult) => {
        if (err) return res.status(500).json({ message: 'Erreur lors du comptage des utilisateurs.' });

        const total = countResult[0].total;

        User.findWithFilters(filters, (err, results) => {
            if (err) return res.status(500).json({ message: 'Erreur lors de la récupération des utilisateurs.' });
            if (results.length === 0) return res.status(404).json({ message: 'Utilisateur non trouvé.' });

            res.json({
                total,
                count: results.length,
                users: results
            });
        });
    });
};

exports.getUserById = (req, res) => {
    const allowedRoles = ['Admin', 'Médecin', 'Infirmier'];
    if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({ message: 'Accès interdit.' });
    }

    const id = req.params.id;

    User.findById(id, (err, results) => {
        if (err || results.length === 0) {
            return res.status(404).json({ message: 'Utilisateur non trouvé.' });
        }

        res.json(results[0]);
    });
};

exports.updateUser = (req, res) => {
    if (req.user.role !== 'Admin') return res.status(403).json({ message: 'Accès interdit.' });

    const id = req.params.id;
    const { nom, prenom, role, motDePasse, email, idHopital, telephone, sexe, dateNaissance, identifiant } = req.body;

    // Validation des champs
    if (nom && nom.trim() === '') return res.status(400).json({ message: 'Le nom ne peut pas être vide.' });
    if (prenom && prenom.trim() === '') return res.status(400).json({ message: 'Le prénom ne peut pas être vide.' });
    if (role && !['Médecin', 'Infirmier', 'Admin', 'Patient'].includes(role)) return res.status(400).json({ message: 'Le rôle doit être "Médecin", "Infirmier", "Admin" ou "Patient".' });
    if (motDePasse && motDePasse.length < 6) return res.status(400).json({ message: 'Le mot de passe doit contenir au moins 6 caractères.' });
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ message: 'Adresse e-mail invalide.' });
    if (telephone && telephone.trim() === '') return res.status(400).json({ message: 'Le numéro de téléphone ne peut pas être vide.' });
    if (sexe && !['H', 'F'].includes(sexe)) return res.status(400).json({ message: 'Le sexe doit être "H" ou "F".' });
    if (dateNaissance) {
        const birthDate = new Date(dateNaissance);
        const today = new Date();
        if (isNaN(birthDate.getTime())) return res.status(400).json({ message: 'Format de date invalide.' });
        if (birthDate > today) return res.status(400).json({ message: 'La date de naissance ne peut pas être dans le futur.' });
    }
    if (identifiant && identifiant.trim() === '') return res.status(400).json({ message: 'L’identifiant ne peut pas être vide.' });

    User.findById(id, (err, results) => {
        if (err) {
            console.error('Erreur lors de la récupération de l’utilisateur:', err);
            return res.status(500).json({ message: 'Erreur serveur lors de la récupération de l’utilisateur.' });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: 'Utilisateur non trouvé.' });
        }

        const existingUser = results[0];
        const userRole = role || existingUser.role;
        let finalIdHopital = idHopital !== undefined ? idHopital : existingUser.idHopital;

        if (finalIdHopital === '' || (finalIdHopital && isNaN(finalIdHopital))) {
            finalIdHopital = null;
        }

        if (['Médecin', 'Infirmier'].includes(userRole)) {
            if (finalIdHopital === null) {
                return res.status(400).json({ message: 'L’ID de l’hôpital est requis pour les médecins et infirmiers.' });
            }

            User.findHopitalById(finalIdHopital, (err, hospitalResults) => {
                if (err) {
                    console.error('Erreur lors de la vérification de l’hôpital:', err);
                    return res.status(500).json({ message: 'Erreur serveur lors de la vérification de l’hôpital.' });
                }
                if (hospitalResults.length === 0) {
                    return res.status(400).json({ message: 'L’ID de l’hôpital fourni n’existe pas.' });
                }

                proceedWithUpdate();
            });
        } else {
            proceedWithUpdate();
        }

        function proceedWithUpdate() {
            // Vérification des contraintes UNIQUE pour email
            if (email && email !== existingUser.email) {
                User.findByEmail(email, (err, emailResults) => {
                    if (err) {
                        console.error('Erreur lors de la vérification de l’e-mail:', err);
                        return res.status(500).json({ message: 'Erreur serveur lors de la vérification de l’e-mail.' });
                    }
                    if (emailResults.length > 0) {
                        return res.status(400).json({ message: 'Cet e-mail est déjà utilisé par un autre utilisateur.' });
                    }

                    checkIdentifiant();
                });
            } else {
                checkIdentifiant();
            }

            // Vérification des contraintes UNIQUE pour identifiant
            function checkIdentifiant() {
                if (identifiant && identifiant !== existingUser.identifiant) {
                    User.findByIdentifiant(identifiant, (err, identResults) => {
                        if (err) {
                            console.error('Erreur lors de la vérification de l’identifiant:', err);
                            return res.status(500).json({ message: 'Erreur serveur lors de la vérification de l’identifiant.' });
                        }
                        if (identResults.length > 0) {
                            return res.status(400).json({ message: 'Cet identifiant est déjà utilisé par un autre utilisateur.' });
                        }

                        updateUserData();
                    });
                } else {
                    updateUserData();
                }
            }

            function updateUserData() {
                const userData = {
                    nom: nom || existingUser.nom,
                    prenom: prenom || existingUser.prenom,
                    role: role || existingUser.role,
                    motDePasse: motDePasse || null,
                    email: email || existingUser.email,
                    idHopital: finalIdHopital,
                    telephone: telephone || existingUser.telephone,
                    sexe: sexe !== undefined ? sexe : existingUser.sexe,
                    dateNaissance: dateNaissance !== undefined ? dateNaissance : existingUser.dateNaissance,
                    identifiant: identifiant || existingUser.identifiant
                };

                User.update(id, userData, (err) => {
                    if (err) {
                        console.error('Erreur lors de la mise à jour de l’utilisateur:', err);
                        return res.status(500).json({ message: 'Erreur lors de la mise à jour de l’utilisateur.', error: err.message });
                    }

                    Trace.create({ action: 'modification utilisateur', idUtilisateur: req.user.id }, (err) => {
                        if (err) console.error('Erreur lors de l’enregistrement de la traçabilité:', err);
                    });

                    res.json({ message: 'Utilisateur mis à jour avec succès.' });
                });
            }
        }
    });
};

exports.deleteUser = (req, res) => {
    if (req.user.role !== 'Admin') return res.status(403).json({ message: 'Accès interdit.' });

    const id = req.params.id;
    User.delete(id, (err) => {
        if (err) {
            console.error('Erreur lors de la suppression de l’utilisateur:', err);
            return res.status(500).json({ message: 'Erreur lors de la suppression de l’utilisateur.' });
        }

        Trace.create({ action: 'suppression utilisateur', idUtilisateur: req.user.id }, (err) => {
            if (err) console.error('Erreur lors de l’enregistrement de la traçabilité:', err);
        });

        res.json({ message: 'Utilisateur supprimé avec succès.' });
    });
};