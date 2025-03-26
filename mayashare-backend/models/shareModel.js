const db = require('../config/db');

const Share = {
    create: (shareData, callback) => {
        const query = 'INSERT INTO Partage (idImage, lienPartage, motDePasse, dateExpiration) VALUES (?, ?, ?, ?)';
        db.query(query, [shareData.idImage, shareData.lienPartage, shareData.motDePasse, shareData.dateExpiration], callback);
    },

    findByLink: (lienPartage, callback) => {
        const query = 'SELECT * FROM Partage WHERE lienPartage = ? AND dateExpiration > NOW()';
        db.query(query, [lienPartage], callback);
    }
};

module.exports = Share;