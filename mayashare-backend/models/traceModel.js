const db = require('../config/db');

const Trace = {
    create: (traceData, callback) => {
        const query = 'INSERT INTO Tracabilite (action, idUtilisateur, idImage, dateHeure) VALUES (?, ?, ?, NOW())';
        db.query(query, [traceData.action, traceData.idUtilisateur, traceData.idImage], callback);
    },

    findAll: (filters, callback) => {
        let query = 'SELECT * FROM Tracabilite WHERE 1=1';
        const params = [];
        if (filters.idUtilisateur) {
            query += ' AND idUtilisateur = ?';
            params.push(filters.idUtilisateur);
        }
        if (filters.action) {
            query += ' AND action = ?';
            params.push(filters.action);
        }
        db.query(query, params, callback);
    }
};

module.exports = Trace;