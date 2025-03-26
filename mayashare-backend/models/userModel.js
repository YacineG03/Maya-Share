const db = require('../config/db');
const bcrypt = require('bcryptjs');

const User = {
    create: (userData, callback) => {
        const hashedPassword = bcrypt.hashSync(userData.motDePasse, 10);
        const query = 'INSERT INTO Utilisateur (nom, prenom, role, identifiant, motDePasse, email, idHôpital) VALUES (?, ?, ?, ?, ?, ?, ?)';
        db.query(query, [userData.nom, userData.prenom, userData.role, userData.identifiant, hashedPassword, userData.email, userData.idHôpital], callback);
    },

    findByIdentifiant: (identifiant, callback) => {
        const query = 'SELECT * FROM Utilisateur WHERE identifiant = ?';
        db.query(query, [identifiant], callback);
    }, 
    
    findByEmail: (identifiant, callback) => {
        const query = 'SELECT * FROM Utilisateur WHERE email = ?';
        db.query(query, [identifiant], callback);
    },

    findById: (id, callback) => {
        const query = 'SELECT * FROM Utilisateur WHERE idUtilisateur = ?';
        db.query(query, [id], callback);
    },

    update: (id, userData, callback) => {
        const hashedPassword = userData.motDePasse ? bcrypt.hashSync(userData.motDePasse, 10) : null;
        const query = 'UPDATE Utilisateur SET nom = ?, prenom = ?, role = ?, motDePasse = COALESCE(?, motDePasse), email = ?, idHôpital = ? WHERE idUtilisateur = ?';
        db.query(query, [userData.nom, userData.prenom, userData.role, hashedPassword, userData.email, userData.idHôpital, id], callback);
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