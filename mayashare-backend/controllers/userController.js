const User = require('../models/userModel');
const Trace = require('../models/traceModel');

// Fonction pour générer un identifiant unique basé sur le prénom et le nom
const generateIdentifiant = (nom, prenom) => {
    const randomNumber = Math.floor(Math.random() * 10000); 
    return `${prenom.charAt(0)}${nom}${randomNumber}`; 
};

exports.createUser = (req, res) => {
    if (req.user.role !== 'Admin') return res.status(403).json({ message: 'Accès interdit.' });

    const { nom, prenom, role, motDePasse, email, telephone, idHôpital } = req.body;
    const identifiant = generateIdentifiant(nom, prenom);

    // Validations communes
    if (!nom || nom.trim() === '') return res.status(400).json({ message: 'Le nom est requis.' });
    if (!prenom || prenom.trim() === '') return res.status(400).json({ message: 'Le prénom est requis.' });
    if (!role || !['Médecin', 'Infirmier', 'Admin', 'Patient'].includes(role)) return res.status(400).json({ message: 'Le rôle doit être "Médecin", "Infirmier", "Admin" ou "Patient".' });
    if (!motDePasse || motDePasse.length < 6) return res.status(400).json({ message: 'Le mot de passe doit contenir au moins 6 caractères.' });
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ message: 'Adresse e-mail invalide.' });
    if (!telephone || telephone.trim() === '') return res.status(400).json({ message: 'Le numéro de téléphone est requis.' });

    // Définir idHôpital pour Médecin et Infirmier, sinon null pour Patient et Admin
    const hospitalId = ['Médecin', 'Infirmier'].includes(role) && (!idHôpital || isNaN(idHôpital))
        ? null // Retournera une erreur si idHôpital est requis mais non valide
        : idHôpital || null;

    // Validation de l’idHôpital pour Médecin et Infirmier
    if (['Médecin', 'Infirmier'].includes(role) && !hospitalId) {
        return res.status(400).json({ message: 'L’ID de l’hôpital est requis pour les médecins et infirmiers.' });
    }

    // Vérifier si l’identifiant ou l’e-mail existe déjà
    User.findByEmail(email, (err, results) => {
        if (err) return res.status(500).json({ message: 'Erreur serveur.' });
        if (results.length > 0) return res.status(400).json({ message: 'Cet email est déjà utilisé.' });

        const userData = { nom, prenom, role, identifiant, motDePasse, email, telephone, idHôpital: hospitalId };
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
};

// exports.getAllUsers = (req, res) => {
//     const allowedRoles = ['Admin', 'Médecin', 'Infirmier'];
//     if (!allowedRoles.includes(req.user.role)) {
//         return res.status(403).json({ message: 'Accès interdit.' });
//     }

//     User.findAll((err, results) => {
//         if (err) return res.status(500).json({ message: 'Erreur lors de la récupération des utilisateurs.' });
//         res.json(results);
//     });
// };

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


// exports.updateUser = (req, res) => {
//     if (req.user.role !== 'Admin') return res.status(403).json({ message: 'Accès interdit.' });

//     const id = req.params.id;
//     const { nom, prenom, role, motDePasse, email, idHôpital } = req.body;

//     // Validations
//     if (nom && nom.trim() === '') return res.status(400).json({ message: 'Le nom ne peut pas être vide.' });
//     if (prenom && prenom.trim() === '') return res.status(400).json({ message: 'Le prénom ne peut pas être vide.' });
//     if (role && !['Médecin', 'Infirmier', 'Admin', 'Patient'].includes(role)) return res.status(400).json({ message: 'Le rôle doit être "Médecin", "Infirmier", "Admin" ou "Patient".' });
//     if (motDePasse && motDePasse.length < 6) return res.status(400).json({ message: 'Le mot de passe doit contenir au moins 6 caractères.' });
//     if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ message: 'Adresse e-mail invalide.' });

//     // Validation de l’idHôpital pour Médecin et Infirmier
//     if (['Médecin', 'Infirmier'].includes(role)) {
//         if (!idHôpital || isNaN(idHôpital)) {
//             return res.status(400).json({ message: 'L’ID de l’hôpital est requis pour les médecins et infirmiers.' });
//         }
//     }

//     const userData = { nom, prenom, role, motDePasse, email, idHôpital };
//     User.update(id, userData, (err) => {
//         if (err) return res.status(500).json({ message: 'Erreur lors de la mise à jour de l’utilisateur.' });

//         Trace.create({ action: 'modification utilisateur', idUtilisateur: req.user.id }, (err) => {
//             if (err) console.error('Erreur lors de l’enregistrement de la traçabilité:', err);
//         });

//         res.json({ message: 'Utilisateur mis à jour avec succès.' });
//     });
// };

exports.updateUser = (req, res) => {
    if (req.user.role !== 'Admin') return res.status(403).json({ message: 'Accès interdit.' });

    const id = req.params.id;
    const { nom, prenom, role, motDePasse, email, idHôpital, telephone } = req.body;

    // Validations
    if (nom && nom.trim() === '') return res.status(400).json({ message: 'Le nom ne peut pas être vide.' });
    if (prenom && prenom.trim() === '') return res.status(400).json({ message: 'Le prénom ne peut pas être vide.' });
    if (role && !['Médecin', 'Infirmier', 'Admin', 'Patient'].includes(role)) return res.status(400).json({ message: 'Le rôle doit être "Médecin", "Infirmier", "Admin" ou "Patient".' });
    if (motDePasse && motDePasse.length < 6) return res.status(400).json({ message: 'Le mot de passe doit contenir au moins 6 caractères.' });
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ message: 'Adresse e-mail invalide.' });
    if (telephone && telephone.trim() === '') return res.status(400).json({ message: 'Le numéro de téléphone ne peut pas être vide.' });

    // Récupérer l'utilisateur existant pour vérifier son rôle actuel
    User.findById(id, (err, results) => {
        if (err) {
            console.error('Erreur lors de la récupération de l’utilisateur:', err);
            return res.status(500).json({ message: 'Erreur serveur lors de la récupération de l’utilisateur.' });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: 'Utilisateur non trouvé.' });
        }

        const existingUser = results[0];
        const userRole = role || existingUser.role; // Utiliser le rôle existant si non fourni

        // Validation de l’idHôpital pour Médecin et Infirmier
        let finalIdHopital = idHôpital !== undefined ? idHôpital : existingUser.idHôpital;

        // Convertir une chaîne vide ou non numérique en NULL pour idHôpital
        if (finalIdHopital === '' || (finalIdHopital && isNaN(finalIdHopital))) {
            finalIdHopital = null;
        }

        if (['Médecin', 'Infirmier'].includes(userRole)) {
            if (finalIdHopital === null) {
                return res.status(400).json({ message: 'L’ID de l’hôpital est requis pour les médecins et infirmiers.' });
            }
            // Vérifier si idHôpital existe dans la table Hopital
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
            // Pour Patient et Admin, idHôpital peut être NULL
            proceedWithUpdate();
        }

        function proceedWithUpdate() {
            // Vérifier si l’e-mail est déjà utilisé par un autre utilisateur
            if (email && email !== existingUser.email) {
                User.findByEmail(email, (err, emailResults) => {
                    if (err) {
                        console.error('Erreur lors de la vérification de l’e-mail:', err);
                        return res.status(500).json({ message: 'Erreur serveur lors de la vérification de l’e-mail.' });
                    }
                    if (emailResults.length > 0) {
                        return res.status(400).json({ message: 'Cet e-mail est déjà utilisé par un autre utilisateur.' });
                    }

                    updateUserData();
                });
            } else {
                updateUserData();
            }

            function updateUserData() {
                // Construire les données de mise à jour
                const userData = {
                    nom: nom || existingUser.nom,
                    prenom: prenom || existingUser.prenom,
                    role: role || existingUser.role,
                    motDePasse: motDePasse || null,
                    email: email || existingUser.email,
                    idHôpital: finalIdHopital,
                    telephone: telephone || existingUser.telephone
                };

                // Mettre à jour l’utilisateur
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

// exports.deleteUser = (req, res) => {
//     if (req.user.role !== 'Admin') return res.status(403).json({ message: 'Accès interdit.' });

//     const id = req.params.id;
//     User.delete(id, (err) => {
//         if (err) return res.status(500).json({ message: 'Erreur lors de la suppression de l’utilisateur.' });

//         Trace.create({ action: 'suppression utilisateur', idUtilisateur: req.user.id }, (err) => {
//             if (err) console.error('Erreur lors de l’enregistrement de la traçabilité:', err);
//         });

//         res.json({ message: 'Utilisateur supprimé avec succès.' });
//     });
// };

exports.deleteUser = (req, res) => {
    if (req.user.role !== 'Admin') return res.status(403).json({ message: 'Accès interdit.' });

    const id = req.params.id;
    User.delete(id, (err) => {
        if (err) {
            console.error('Erreur lors de la suppression de l’utilisateur:', err);
            return res.status(500).json({ message: 'Erreur lors de la suppression de l’utilisateur.', error: err.message });
        }

        Trace.create({ action: 'suppression utilisateur', idUtilisateur: req.user.id }, (err) => {
            if (err) console.error('Erreur lors de l’enregistrement de la traçabilité:', err);
        });

        res.json({ message: 'Utilisateur supprimé avec succès.' });
    });
};