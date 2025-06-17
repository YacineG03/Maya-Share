const db = require('../config/db');
const bcrypt = require('bcryptjs');

const User = {
    create: (userData, callback) => {
        const hashedPassword = bcrypt.hashSync(userData.motDePasse, 10);
        const query = 'INSERT INTO Utilisateur (nom, prenom, sexe, dateNaissance, role, identifiant, motDePasse, email, idHopital, telephone) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
        db.query(query, [
            userData.nom, 
            userData.prenom, 
            userData.sexe, 
            userData.dateNaissance, 
            userData.role, 
            userData.identifiant, 
            hashedPassword, 
            userData.email, 
            userData.idHopital, 
            userData.telephone
        ], callback);
    },

    findAll: (callback) => {
        const query = 'SELECT * FROM Utilisateur';
        db.query(query, callback);
    },

    findByIdentifiant: (identifiant, callback) => {
        const query = 'SELECT * FROM Utilisateur WHERE identifiant = ?';
        db.query(query, [identifiant], callback);
    }, 
    
    findByEmail: (email, callback) => {
        const query = 'SELECT * FROM Utilisateur WHERE email = ?';
        db.query(query, [email], callback);
    },

    findByTel: (telephone, callback) => {
        const query = 'SELECT * FROM Utilisateur WHERE telephone = ?';
        db.query(query, [telephone], callback);
    },

    findById: (id, callback) => {
        const query = 'SELECT * FROM Utilisateur WHERE idUtilisateur = ?';
        db.query(query, [id], (err, results) => {
            if (err) return callback(err);
            // Formater la date pour éviter les problèmes de fuseau horaire
            if (results.length > 0 && results[0].dateNaissance) {
                const date = new Date(results[0].dateNaissance);
                results[0].dateNaissance = date.toISOString().split('T')[0]; // Format YYYY-MM-DD
            }
            callback(null, results);
        });
    },

    findWithFilters: (filters, callback) => {
        let query = 'SELECT * FROM Utilisateur WHERE 1=1';
        const params = [];
    
        if (filters.role) {
            query += ' AND role = ?';
            params.push(filters.role);
        }
        if (filters.nom) {
            query += ' AND nom LIKE ?';
            params.push(`%${filters.nom}%`);
        }
        if (filters.prenom) {
            query += ' AND prenom LIKE ?';
            params.push(`%${filters.prenom}%`);
        }
        if (filters.email) {
            query += ' AND email LIKE ?';
            params.push(`%${filters.email}%`);
        }
        if (filters.telephone) {
            query += ' AND telephone LIKE ?';
            params.push(`%${filters.telephone}%`);
        }
    
        query += ' ORDER BY idUtilisateur DESC';
    
        // Pagination
        if (filters.limit) {
            query += ' LIMIT ?';
            params.push(parseInt(filters.limit));
            if (filters.offset) {
                query += ' OFFSET ?';
                params.push(parseInt(filters.offset));
            }
        }
    
        db.query(query, params, (err, results) => {
            if (err) return callback(err);
            // Formater les dates pour tous les utilisateurs
            results.forEach(user => {
                if (user.dateNaissance) {
                    const date = new Date(user.dateNaissance);
                    user.dateNaissance = date.toISOString().split('T')[0]; // Format YYYY-MM-DD
                }
            });
            callback(null, results);
        });
    },

    countWithFilters: (filters, callback) => {
        let query = 'SELECT COUNT(*) AS total FROM Utilisateur WHERE 1=1';
        const params = [];
    
        if (filters.role) {
            query += ' AND role = ?';
            params.push(filters.role);
        }
        if (filters.nom) {
            query += ' AND nom LIKE ?';
            params.push(`%${filters.nom}%`);
        }
        if (filters.prenom) {
            query += ' AND prenom LIKE ?';
            params.push(`%${filters.prenom}%`);
        }
        if (filters.email) {
            query += ' AND email LIKE ?';
            params.push(`%${filters.email}%`);
        }
        if (filters.telephone) {
            query += ' AND telephone LIKE ?';
            params.push(`%${filters.telephone}%`);
        }
    
        db.query(query, params, callback);
    },

    findHopitalById: (idHopital, callback) => {
        const query = 'SELECT idHopital FROM Hopital WHERE idHopital = ?';
        db.query(query, [idHopital], callback);
    },

    update: (id, userData, callback) => {
        const fields = [];
        const params = [];
    
        if (userData.nom) {
            fields.push('nom = ?');
            params.push(userData.nom);
        }
        if (userData.prenom !== undefined) {
            fields.push('prenom = ?');
            params.push(userData.prenom);
        }
        if (userData.role) {
            fields.push('role = ?');
            params.push(userData.role);
        }
        if (userData.motDePasse) {
            const hashedPassword = bcrypt.hashSync(userData.motDePasse, 10);
            fields.push('motDePasse = ?');
            params.push(hashedPassword);
        }
        if (userData.email) {
            fields.push('email = ?');
            params.push(userData.email);
        }
        if (userData.idHopital !== undefined) {
            fields.push('idHopital = ?');
            params.push(userData.idHopital);
        }
        if (userData.telephone !== undefined) {
            fields.push('telephone = ?');
            params.push(userData.telephone);
        }
        if (userData.sexe !== undefined) {
            fields.push('sexe = ?');
            params.push(userData.sexe);
        }
        if (userData.dateNaissance !== undefined) {
            fields.push('dateNaissance = ?');
            params.push(userData.dateNaissance);
        }
        if (userData.identifiant) {
            fields.push('identifiant = ?');
            params.push(userData.identifiant);
        }
    
        if (fields.length === 0) {
            return callback(new Error('Aucun champ à mettre à jour.'));
        }
    
        const query = `UPDATE Utilisateur SET ${fields.join(', ')} WHERE idUtilisateur = ?`;
        params.push(id);
    
        db.query(query, params, callback);
    },

    updateHôpital: (id, idHopital, callback) => {
        const query = 'UPDATE Utilisateur SET idHopital = ? WHERE idUtilisateur = ?';
        db.query(query, [idHopital, id], callback);
    },

    delete: (id, callback) => {
        // Supprimer les rendez-vous associés
        const deleteRendezVousQuery = 'DELETE FROM RendezVous WHERE idPatient = ? OR idMedecin = ?';
        db.query(deleteRendezVousQuery, [id, id], (err) => {
            if (err) return callback(err);
        
            // Supprimer les traces associées
            const deleteTraceQuery = 'DELETE FROM Tracabilite WHERE idUtilisateur = ?';
            db.query(deleteTraceQuery, [id], (err) => {
                if (err) return callback(err);
        
                // Supprimer l'utilisateur
                const deleteUserQuery = 'DELETE FROM Utilisateur WHERE idUtilisateur = ?';
                db.query(deleteUserQuery, [id], callback);
            });
        });
    },
};

module.exports = User;