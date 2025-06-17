const db = require('../config/db');

const Share = {
    create: (shareData, callback) => {
        const query = 'INSERT INTO Partage (idDossier, lienPartage, motDePasse, dateExpiration) VALUES (?, ?, ?, ?)';
        db.query(query, [shareData.idDossier, shareData.lienPartage, shareData.motDePasse, shareData.dateExpiration], callback);
    },

    findByLink: (lienPartage, callback) => {
        const query = `
            SELECT p.*, d.idPatient
            FROM Partage p
            LEFT JOIN Dossier d ON p.idDossier = d.idDossier
            WHERE p.lienPartage = ? AND p.dateExpiration > NOW()
        `;
        db.query(query, [lienPartage], callback);
    },

    findImagesByDossier: (idDossier, callback) => {
        const query = 'SELECT * FROM Image WHERE idDossier = ?';
        db.query(query, [idDossier], callback);
    },

    shareWithUser: (shareData, callback) => {
        const query = 'INSERT INTO PartageDossier (idDossier, idUtilisateur, datePartage) VALUES (?, ?, NOW())';
        db.query(query, [shareData.idDossier, shareData.idUtilisateur], callback);
    },

    findSharedDossier: (idDossier, idUtilisateur, callback) => {
        const query = 'SELECT * FROM PartageDossier WHERE idDossier = ? AND idUtilisateur = ?';
        db.query(query, [idDossier, idUtilisateur], callback);
    },

    findSharedWithUser: (idUtilisateur, callback) => {
        const query = `
            SELECT d.*
            FROM Dossier d
            JOIN PartageDossier pd ON d.idDossier = pd.idDossier
            WHERE pd.idUtilisateur = ?
        `;
        db.query(query, [idUtilisateur], callback);
    },
};

module.exports = Share;