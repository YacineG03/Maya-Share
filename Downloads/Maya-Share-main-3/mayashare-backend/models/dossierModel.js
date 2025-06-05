const db = require('../config/db');

const Dossier = {
    create: (dossierData, callback) => {
        const query = `
            INSERT INTO dossier (
                idPatient, idMedecin, dateCreation, diagnostic, traitement, etat,
                groupeSanguin, antecedentsMedicaux, allergies, notesComplementaires
            ) VALUES (?, ?, NOW(), ?, ?, ?, ?, ?, ?, ?)
        `;
        db.query(query, [
            dossierData.idPatient,
            dossierData.idMedecin,
            dossierData.diagnostic || '',
            dossierData.traitement || '',
            'en cours',
            dossierData.groupeSanguin || null,
            dossierData.antecedentsMedicaux || '',
            dossierData.allergies || '',
            dossierData.notesComplementaires || ''
        ], callback);
    },

    findById: (id, callback) => {
        const query = `
            SELECT idDossier, idPatient, idMedecin, dateCreation, diagnostic, traitement, etat,
                   groupeSanguin, antecedentsMedicaux, allergies, notesComplementaires
            FROM Dossier WHERE idDossier = ?
        `;
        db.query(query, [id], callback);
    },

    findByPatient: (idPatient, callback) => {
        const query = `
    SELECT 
        d.idDossier, d.idPatient, d.idMedecin, d.dateCreation, d.diagnostic, d.traitement, d.etat,
        d.groupeSanguin, d.antecedentsMedicaux, d.allergies, d.notesComplementaires,
        u.nom AS patientNom, u.prenom AS patientPrenom, u.email, u.telephone,
        m.nom AS medecinNom, m.prenom AS medecinPrenom,
        GROUP_CONCAT(i.idImage) AS fichiers
    FROM Dossier d
    LEFT JOIN Utilisateur u ON d.idPatient = u.idUtilisateur
    LEFT JOIN Utilisateur m ON d.idMedecin = m.idUtilisateur
    LEFT JOIN Image i ON d.idDossier = i.idDossier
    WHERE d.idPatient = ?
    GROUP BY d.idDossier
`;

        db.query(query, [idPatient], (err, results) => {
            if (err) {
                console.error('Erreur dans findByPatient query:', err.message, err.stack);
            }
            callback(err, results);
        });
    },

    findByMedecin: (idMedecin, callback) => {
        const query = `
            SELECT idDossier, idPatient, idMedecin, dateCreation, diagnostic, traitement, etat,
                   groupeSanguin, antecedentsMedicaux, allergies, notesComplementaires
            FROM Dossier WHERE idMedecin = ?
        `;
        db.query(query, [idMedecin], callback);
    },

    getDossiersForInfirmier: (idInfirmier, callback) => {
        const query = `
            SELECT d.*, u.nom, u.prenom, u.email, u.telephone
            FROM Dossier d
            JOIN Utilisateur u ON d.idPatient = u.idUtilisateur
            WHERE d.idInfirmier = ?
        `;
        db.query(query, [idInfirmier], callback);
    },

    update: (id, dossierData, callback) => {
        const query = `
            UPDATE Dossier
            SET diagnostic = ?, traitement = ?, etat = ?,
                groupeSanguin = ?, antecedentsMedicaux = ?, allergies = ?, notesComplementaires = ?
            WHERE idDossier = ?
        `;
        db.query(query, [
            dossierData.diagnostic,
            dossierData.traitement,
            dossierData.etat,
            dossierData.groupeSanguin || null,
            dossierData.antecedentsMedicaux || '',
            dossierData.allergies || '',
            dossierData.notesComplementaires || '',
            id
        ], callback);
    },
};

module.exports = Dossier;