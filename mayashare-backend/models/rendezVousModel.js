const db = require('../config/db');

const RendezVous = {
  create: (rendezVousData, callback) => {
    const query = 'INSERT INTO RendezVous (idPatient, idMedecin, idInfirmier, dateDemande, dateRendezVous, motif, etat) VALUES (?, ?, ?, NOW(), ?, ?, ?)';
    db.query(query, [
      rendezVousData.idPatient,
      rendezVousData.idMedecin,
      rendezVousData.idInfirmier || null,
      rendezVousData.dateRendezVous,
      rendezVousData.motif,
      'en attente'
    ], callback);
  },

  getMedecinEtHopital: (idMedecin, callback) => {
    const query = `
      SELECT 
        u.nom AS nomMedecin, 
        u.prenom AS prenomMedecin, 
        h.nom AS nomHopital, 
        h.adresse AS adresseHopital
      FROM Utilisateur u
      LEFT JOIN Hopital h ON u.idHopital = h.idHopital
      WHERE u.idUtilisateur = ?
    `;
    db.query(query, [idMedecin], callback);
  },

  findById: (id, callback) => {
    const query = `
      SELECT 
        rv.*, 
        CONCAT(p.nom, ' ', p.prenom) AS nomPatient, 
        p.prenom AS prenomPatient,
        CONCAT(m.nom, ' ', m.prenom) AS nomMedecin,
        CONCAT(i.nom, ' ', i.prenom) AS nomInfirmier
      FROM RendezVous rv
      JOIN Utilisateur p ON rv.idPatient = p.idUtilisateur
      JOIN Utilisateur m ON rv.idMedecin = m.idUtilisateur
      LEFT JOIN Utilisateur i ON rv.idInfirmier = i.idUtilisateur
      WHERE rv.idRendezVous = ?
    `;
    db.query(query, [id], callback);
  },

  findByPatient: (idPatient, callback) => {
    const query = `
      SELECT 
        rv.idRendezVous, 
        rv.idPatient, 
        rv.idMedecin, 
        rv.idInfirmier,
        rv.dateRendezVous, 
        rv.motif, 
        rv.etat, 
        rv.commentaire, 
        CONCAT(m.nom, ' ', m.prenom) AS nomMedecin, 
        CONCAT(i.nom, ' ', i.prenom) AS nomInfirmier,
        h.nom AS nomHopital, 
        h.adresse AS adresseHopital
      FROM RendezVous rv
      JOIN Utilisateur m ON rv.idMedecin = m.idUtilisateur
      LEFT JOIN Utilisateur i ON rv.idInfirmier = i.idUtilisateur
      LEFT JOIN Hopital h ON m.idHopital = h.idHopital
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
        rv.idInfirmier,
        rv.dateRendezVous, 
        rv.motif, 
        rv.etat, 
        rv.commentaire, 
        CONCAT(p.nom, ' ', p.prenom) AS nomPatient,
        p.prenom AS prenomPatient,
        CONCAT(i.nom, ' ', i.prenom) AS nomInfirmier
      FROM RendezVous rv
      JOIN Utilisateur p ON rv.idPatient = p.idUtilisateur
      LEFT JOIN Utilisateur i ON rv.idInfirmier = i.idUtilisateur
      WHERE rv.idMedecin = ?
      ORDER BY rv.dateRendezVous DESC
    `;
    db.query(query, [idMedecin], (err, results) => {
      if (err) {
        console.error('Erreur SQL:', err);
        return callback(err, null);
      }
      callback(null, results);
    });
  },

  findByInfirmier: (idInfirmier, callback) => {
    const query = `
      SELECT 
        rv.idRendezVous, 
        rv.idPatient, 
        rv.idMedecin, 
        rv.idInfirmier,
        rv.dateRendezVous, 
        rv.motif, 
        rv.etat, 
        rv.commentaire, 
        CONCAT(p.nom, ' ', p.prenom) AS nomPatient,
        p.prenom AS prenomPatient,
        CONCAT(m.nom, ' ', m.prenom) AS nomMedecin,
        CONCAT(i.nom, ' ', i.prenom) AS nomInfirmier
      FROM RendezVous rv
      JOIN Utilisateur p ON rv.idPatient = p.idUtilisateur
      JOIN Utilisateur m ON rv.idMedecin = m.idUtilisateur
      LEFT JOIN Utilisateur i ON rv.idInfirmier = i.idUtilisateur
      WHERE rv.idInfirmier = ?
      ORDER BY rv.dateRendezVous DESC
    `;
    db.query(query, [idInfirmier], callback);
  },

  update: (id, rendezVousData, callback) => {
    const query = 'UPDATE RendezVous SET etat = ?, commentaire = ?, idInfirmier = ? WHERE idRendezVous = ?';
    db.query(query, [
      rendezVousData.etat || 'en attente',
      rendezVousData.commentaire || '',
      rendezVousData.idInfirmier || null,
      id
    ], callback);
  },

  delete: (id, callback) => {
    const query = 'DELETE FROM RendezVous WHERE idRendezVous = ?';
    db.query(query, [id], callback);
  },

  checkExistingAppointment: (idPatient, idMedecin, dateRendezVous, callback) => {
    const query = `
      SELECT COUNT(*) AS count 
      FROM RendezVous 
      WHERE idPatient = ? 
      AND idMedecin = ? 
      AND DATE(dateRendezVous) = DATE(?)
    `;
    db.query(query, [idPatient, idMedecin, dateRendezVous], callback);
  },

  createPartageAgenda: (partageData, callback) => {
    const query = 'INSERT INTO PartagesAgenda (idMedecin, idInfirmier, idRendezVous, dateDebut, dateFin, dateCreation) VALUES (?, ?, ?, ?, ?, NOW())';
    db.query(query, [
      partageData.idMedecin,
      partageData.idInfirmier,
      partageData.idRendezVous,
      partageData.dateDebut,
      partageData.dateFin
    ], callback);
  },

  findPartagesByInfirmier: (idInfirmier, callback) => {
    const query = `
      SELECT 
        pa.idPartage,
        pa.idMedecin,
        pa.idInfirmier,
        pa.idRendezVous,
        pa.dateDebut,
        pa.dateFin,
        pa.dateCreation,
        CONCAT(m.nom, ' ', m.prenom) AS nomMedecin
      FROM PartagesAgenda pa
      JOIN Utilisateur m ON pa.idMedecin = m.idUtilisateur
      WHERE pa.idInfirmier = ?
      AND pa.dateFin >= CURDATE()
      ORDER BY pa.dateCreation DESC
    `;
    db.query(query, [idInfirmier], callback);
  },
};

module.exports = RendezVous;