const db = require('../config/db');
const bcrypt = require('bcryptjs');

const User = {
    create: (userData, callback) => {
        const hashedPassword = bcrypt.hashSync(userData.motDePasse, 10);
        const query = 'INSERT INTO Utilisateur (nom, prenom, role, identifiant, motDePasse, email, idHôpital, telephone) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
        db.query(query, [userData.nom, userData.prenom, userData.role, userData.identifiant, hashedPassword, userData.email, userData.idHôpital, userData.telephone], callback);
    },

    findAll: (callback) => {
        const query = 'SELECT * FROM Utilisateur ';
        db.query(query,callback);
    },

    findByIdentifiant: (identifiant, callback) => {
        const query = 'SELECT * FROM Utilisateur WHERE identifiant = ?';
        db.query(query, [identifiant], callback);
    }, 
    
    findByEmail: (identifiant, callback) => {
        const query = 'SELECT * FROM Utilisateur WHERE email = ?';
        db.query(query, [identifiant], callback);
    },

    findByTel: (identifiant, callback) => {
        const query = 'SELECT * FROM Utilisateur WHERE telephone = ?';
        db.query(query, [identifiant], callback);
    },

    findById: (id, callback) => {
        const query = 'SELECT * FROM Utilisateur WHERE idUtilisateur = ?';
        db.query(query, [id], callback);
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
    
        db.query(query, params, callback);
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

    // update: (id, userData, callback) => {
    //     const hashedPassword = userData.motDePasse ? bcrypt.hashSync(userData.motDePasse, 10) : null;
    //     const query = 'UPDATE Utilisateur SET nom = ?, prenom = ?, role = ?, motDePasse = COALESCE(?, motDePasse), email = ?, idHôpital = ?, telephone = ? WHERE idUtilisateur = ?';
    //     db.query(query, [userData.nom, userData.prenom, userData.role, hashedPassword, userData.email, userData.idHôpital, userData.telephone,id], callback);
    // },
    findHopitalById: (idHopital, callback) => {
        const query = 'SELECT idHôpital FROM Hopital WHERE idHôpital = ?';
        db.query(query, [idHopital], callback);
    },

    update: (id, userData, callback) => {
        const fields = [];
        const params = [];
    
        if (userData.nom) {
            fields.push('nom = ?');
            params.push(userData.nom);
        }
        if (userData.prenom) {
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
        if (userData.idHôpital !== undefined) { // Permet de mettre à jour même avec null
            fields.push('idHôpital = ?');
            params.push(userData.idHôpital);
        }
        if (userData.telephone) {
            fields.push('telephone = ?');
            params.push(userData.telephone);
        }
    
        if (fields.length === 0) {
            return callback(new Error('Aucun champ à mettre à jour.'));
        }
    
        const query = `UPDATE Utilisateur SET ${fields.join(', ')} WHERE idUtilisateur = ?`;
        params.push(id);
    
        db.query(query, params, callback);
    },

    updateHôpital: (id, idHôpital, callback) => {
        const query = 'UPDATE Utilisateur SET idHôpital = ? WHERE idUtilisateur = ?';
        db.query(query, [idHôpital, id], callback);
    },

        // delete: (id, callback) => {
        //     const query = 'DELETE FROM Utilisateur WHERE idUtilisateur = ?';
        //     db.query(query, [id], callback);
        // }

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