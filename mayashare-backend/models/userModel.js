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

    update: (id, userData, callback) => {
        const hashedPassword = userData.motDePasse ? bcrypt.hashSync(userData.motDePasse, 10) : null;
        const query = 'UPDATE Utilisateur SET nom = ?, prenom = ?, role = ?, motDePasse = COALESCE(?, motDePasse), email = ?, idHôpital = ?, telephone = ? WHERE idUtilisateur = ?';
        db.query(query, [userData.nom, userData.prenom, userData.role, hashedPassword, userData.email, userData.idHôpital, userData.telephone,id], callback);
    },

    updateHôpital: (id, idHôpital, callback) => {
        const query = 'UPDATE Utilisateur SET idHôpital = ? WHERE idUtilisateur = ?';
        db.query(query, [idHôpital, id], callback);
    },

    delete: (id, callback) => {
        const query = 'DELETE FROM Utilisateur WHERE idUtilisateur = ?';
        db.query(query, [id], callback);
    }
};

module.exports = User;