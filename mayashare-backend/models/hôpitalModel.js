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
    
    findAllWithMedecins: (callback) => {
    const query = `
        SELECT 
        h.idHôpital,
        h.nom,
        h.adresse,
        u.idUtilisateur AS medicin_id,
        u.nom AS medicin_nom,
        u.prenom AS medicin_prenom
        FROM Hopital h
        LEFT JOIN Utilisateur u ON h.idHôpital = u.idHôpital AND u.role = 'Médecin'
    `;
    db.query(query, (err, results) => {
        if (err) {
        callback(err, null);
        return;
        }
        // Regrouper manuellement les médecins par hôpital
        const hopitauxMap = {};
        results.forEach(row => {
        if (!hopitauxMap[row.idHôpital]) {
            hopitauxMap[row.idHôpital] = {
            idHôpital: row.idHôpital,
            nom: row.nom,
            adresse: row.adresse,
            medecins: [],
            };
        }
        if (row.medicin_id) {
            hopitauxMap[row.idHôpital].medecins.push({
            id: row.medicin_id,
            nom: row.medicin_nom,
            prenom: row.medicin_prenom,
            });
        }
        });
        const parsedResults = Object.values(hopitauxMap);
        callback(null, parsedResults);
    });
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