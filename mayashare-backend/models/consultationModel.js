const db = require('../config/db');

const Consultation = {
    create: (consultationData, callback) => {
        const query = 'INSERT INTO Consultation (idDossier, dateConsultation, notes, ordonnance, signatureMedecin) VALUES (?, NOW(), ?, ?, ?)';
        db.query(query, [consultationData.idDossier, consultationData.notes || '', consultationData.ordonnance || null, consultationData.signatureMedecin || null], callback);
    },

    findByDossier: (idDossier, callback) => {
        const query = `
            SELECT c.idConsultation, c.dateConsultation, c.notes, c.ordonnance, c.signatureMedecin,
                   GROUP_CONCAT(i.idImage) AS imageIds
            FROM Consultation c
            LEFT JOIN Image i ON c.idConsultation = i.idConsultation
            WHERE c.idDossier = ?
            GROUP BY c.idConsultation, c.dateConsultation, c.notes, c.ordonnance, c.signatureMedecin
        `;
        db.query(query, [idDossier], (err, results) => {
            if (err) {
                console.error('Erreur dans findByDossier consultation:', err.message, err.stack);
            }
            callback(err, results);
        });
    },

    findById: (idConsultation, callback) => {
        const query = 'SELECT * FROM Consultation WHERE idConsultation = ?';
        db.query(query, [idConsultation], callback);
    },

    update: (idConsultation, consultationData, callback) => {
        const query = 'UPDATE Consultation SET notes = ?, ordonnance = ?, signatureMedecin = ? WHERE idConsultation = ?';
        db.query(query, [consultationData.notes, consultationData.ordonnance || null, consultationData.signatureMedecin || null, idConsultation], callback);
    },

    delete: (idConsultation, callback) => {
        const query = 'DELETE FROM Consultation WHERE idConsultation = ?';
        db.query(query, [idConsultation], callback);
    }
};

module.exports = Consultation;