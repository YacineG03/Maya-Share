const db = require('../config/db');

const RendezVous = {
    create: (rendezVousData, callback) => {
        const query = 'INSERT INTO RendezVous (idPatient, idMedecin, dateDemande, dateRendezVous, motif, etat) VALUES (?, ?, NOW(), ?, ?, ?)';
        db.query(query, [rendezVousData.idPatient, rendezVousData.idMedecin, rendezVousData.dateRendezVous, rendezVousData.motif, 'en attente'], callback);
    },

    getMedecinEtHopital: (idMedecin, callback) => {
        const query = `
            SELECT 
                u.nom AS nomMedecin, 
                u.prenom AS prenomMedecin, 
                h.nom AS nomHopital, 
                h.adresse AS adresseHopital
            FROM Utilisateur u
            LEFT JOIN Hopital h ON u.idHôpital = h.idHôpital
            WHERE u.idUtilisateur = ?
        `;
        db.query(query, [idMedecin], callback);
    },
    
    findById: (id, callback) => {
        const query = 'SELECT * FROM RendezVous WHERE idRendezVous = ?';
        db.query(query, [id], callback);
    },

    findByPatient: (idPatient, callback) => {
        const query = `
            SELECT 
                rv.idRendezVous, 
                rv.idPatient, 
                rv.idMedecin, 
                rv.dateRendezVous, 
                rv.motif, 
                rv.etat, 
                rv.commentaire, 
                CONCAT(m.nom, ' ', m.prenom) AS nomMedecin, 
                h.nom AS nomHopital, 
                h.adresse AS adresseHopital
            FROM RendezVous rv
            JOIN Utilisateur m ON rv.idMedecin = m.idUtilisateur
            LEFT JOIN Hopital h ON m.idHôpital = h.idHôpital
            WHERE rv.idPatient = ?
            ORDER BY rv.dateRendezVous DESC
        `;
        db.query(query, [idPatient], callback);
    },

    findByMedecin: (idMedecin, callback) => {
        const query = `
            SELECT 
                rv.idRendezVous, 
                rv.idPatient, 
                rv.idMedecin, 
                rv.dateRendezVous, 
                rv.motif, 
                rv.etat, 
                rv.commentaire, 
                CONCAT(p.nom, ' ', p.prenom) AS nomPatient
            FROM RendezVous rv
            JOIN Utilisateur p ON rv.idPatient = p.idUtilisateur
            WHERE rv.idMedecin = ?
            ORDER BY rv.dateRendezVous DESC
        `;
        db.query(query, [idMedecin], callback);
    },

    update: (id, rendezVousData, callback) => {
        const query = 'UPDATE RendezVous SET etat = ?, commentaire = ? WHERE idRendezVous = ?';
        db.query(query, [rendezVousData.etat, rendezVousData.commentaire || '', id], callback);
    },

    // Nouvelle méthode pour vérifier les rendez-vous existants le même jour
    checkExistingAppointment: (idPatient, idMedecin, dateRendezVous, callback) => {
        const query = `
            SELECT COUNT(*) AS count 
            FROM RendezVous 
            WHERE idPatient = ? 
            AND idMedecin = ? 
            AND DATE(dateRendezVous) = DATE(?)
        `;
        db.query(query, [idPatient, idMedecin, dateRendezVous], callback);
    }
};

module.exports = RendezVous;