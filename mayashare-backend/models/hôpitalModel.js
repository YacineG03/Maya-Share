const db = require('../config/db');

const Hôpital = {
    create: (hôpitalData, callback) => {
        const query = 'INSERT INTO Hôpital (nom, adresse, ville) VALUES (?, ?, ?)';
        db.query(query, [hôpitalData.nom, hôpitalData.adresse, hôpitalData.ville], callback);
    },

    findById: (id, callback) => {
        const query = 'SELECT * FROM Hôpital WHERE idHôpital = ?';
        db.query(query, [id], callback);
    },

    findAll: (callback) => {
        const query = 'SELECT * FROM Hôpital';
        db.query(query, callback);
    },

    update: (id, hôpitalData, callback) => {
        const query = 'UPDATE Hôpital SET nom = ?, adresse = ?, ville = ? WHERE idHôpital = ?';
        db.query(query, [hôpitalData.nom, hôpitalData.adresse, hôpitalData.ville, id], callback);
    },

    delete: (id, callback) => {
        const query = 'DELETE FROM Hôpital WHERE idHôpital = ?';
        db.query(query, [id], callback);
    }
};

module.exports = Hôpital;