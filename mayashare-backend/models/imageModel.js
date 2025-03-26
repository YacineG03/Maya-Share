const db = require('../config/db');

const Image = {
    create: (imageData, callback) => {
        const query = 'INSERT INTO Image (nomFichier, format, dateUpload, metadonnees, idUtilisateur, idDossier) VALUES (?, ?, NOW(), ?, ?, ?)';
        db.query(query, [imageData.nomFichier, imageData.format, imageData.metadonnees, imageData.idUtilisateur, imageData.idDossier], callback);
    },

    findById: (id, callback) => {
        const query = 'SELECT * FROM Image WHERE idImage = ?';
        db.query(query, [id], callback);
    },

    findByUser: (idUtilisateur, callback) => {
        const query = 'SELECT * FROM Image WHERE idUtilisateur = ?';
        db.query(query, [idUtilisateur], callback);
    }
};

module.exports = Image;