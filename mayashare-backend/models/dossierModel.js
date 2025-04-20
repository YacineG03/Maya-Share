const db = require('../config/db');

const Dossier = {
    create: (dossierData, callback) => {
        const query = 'INSERT INTO Dossier (idPatient, idMedecin, dateCreation, diagnostic, traitement, etat) VALUES (?, ?, NOW(), ?, ?, ?)';
        db.query(query, [dossierData.idPatient, dossierData.idMedecin, dossierData.diagnostic || '', dossierData.traitement || '', 'en cours'], callback);
    },

    findById: (id, callback) => {
        const query = 'SELECT * FROM Dossier WHERE idDossier = ?';
        db.query(query, [id], callback);
    },

    // findByPatient: (idPatient, callback) => {
    //     const query = 'SELECT * FROM Dossier WHERE idPatient = ?';
    //     db.query(query, [idPatient], callback);
    // },

    findByPatient: (idPatient, callback) => {
        const query = `
            SELECT d.*, GROUP_CONCAT(i.idImage) AS fichiers
            FROM Dossier d
            LEFT JOIN Image i ON d.idDossier = i.idDossier
            WHERE d.idPatient = ?
            GROUP BY d.idDossier
        `;
        db.query(query, [idPatient], callback);
    },
    
    findByMedecin: (idMedecin, callback) => {
        const query = 'SELECT * FROM Dossier WHERE idMedecin = ?';
        db.query(query, [idMedecin], callback);
    },

    update: (id, dossierData, callback) => {
        const query = 'UPDATE Dossier SET diagnostic = ?, traitement = ?, etat = ? WHERE idDossier = ?';
        db.query(query, [dossierData.diagnostic, dossierData.traitement, dossierData.etat, id], callback);
    }
};

module.exports = Dossier;