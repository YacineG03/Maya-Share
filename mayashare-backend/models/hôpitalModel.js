const db = require('../config/db');

const Hopital = {
    create: (hopitalData, callback) => {
        const query = 'INSERT INTO Hopital (nom, adresse, ville) VALUES (?, ?, ?)';
        db.query(query, [hopitalData.nom, hopitalData.adresse, hopitalData.ville], callback);
    },

    findById: (id, callback) => {
        const query = 'SELECT * FROM Hopital WHERE idHôpital = ?';
        db.query(query, [id], callback);
    },

    findAll: (callback) => {
        const query = 'SELECT * FROM Hopital';
        db.query(query, callback);
    },

    update: (id, hopitalData, callback) => {
        const query = 'UPDATE Hopital SET nom = ?, adresse = ?, ville = ? WHERE idHôpital = ?';
        db.query(query, [hopitalData.nom, hopitalData.adresse, hopitalData.ville, id], callback);
    },

    delete: (id, callback) => {
        const query = 'DELETE FROM Hopital WHERE idHôpital = ?';
        db.query(query, [id], callback);
    }
};

module.exports = Hopital;