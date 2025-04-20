const db = require('../config/db');

const Share = {
    create: (shareData, callback) => {
        const query = 'INSERT INTO Partage (idImage, lienPartage, motDePasse, dateExpiration) VALUES (?, ?, ?, ?)';
        db.query(query, [shareData.idImage, shareData.lienPartage, shareData.motDePasse, shareData.dateExpiration], callback);
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
    
};

module.exports = Share;