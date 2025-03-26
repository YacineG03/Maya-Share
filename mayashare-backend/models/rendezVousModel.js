const db = require('../config/db');

const RendezVous = {
    create: (rendezVousData, callback) => {
        const query = 'INSERT INTO RendezVous (idPatient, idMedecin, dateDemande, dateRendezVous, motif, etat) VALUES (?, ?, NOW(), ?, ?, ?)';
        db.query(query, [rendezVousData.idPatient, rendezVousData.idMedecin, rendezVousData.dateRendezVous, rendezVousData.motif, 'en attente'], callback);
    },

    findById: (id, callback) => {
        const query = 'SELECT * FROM RendezVous WHERE idRendezVous = ?';
        db.query(query, [id], callback);
    },

    findByPatient: (idPatient, callback) => {
        const query = 'SELECT * FROM RendezVous WHERE idPatient = ?';
        db.query(query, [idPatient], callback);
    },

    findByMedecin: (idMedecin, callback) => {
        const query = 'SELECT * FROM RendezVous WHERE idMedecin = ?';
        db.query(query, [idMedecin], callback);
    },

    update: (id, rendezVousData, callback) => {
        const query = 'UPDATE RendezVous SET etat = ?, commentaire = ? WHERE idRendezVous = ?';
        db.query(query, [rendezVousData.etat, rendezVousData.commentaire || '', id], callback);
    }
};

module.exports = RendezVous;