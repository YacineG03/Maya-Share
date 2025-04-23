// const db = require('../config/db');

// const Image = {
//     // create: (imageData, callback) => {
//     //     const query = 'INSERT INTO Image (nomFichier, format, dateUpload, metadonnees, idUtilisateur, idDossier) VALUES (?, ?, NOW(), ?, ?, ?)';
//     //     db.query(query, [imageData.nomFichier, imageData.format, imageData.metadonnees, imageData.idUtilisateur, imageData.idDossier], callback);
//     // },
//     create: (imageData, callback) => {
//         const query = 'INSERT INTO Image SET ?';
//         db.query(query, imageData, (err, result) => {
//             if (err) return callback(err, null);
//             callback(null, result);
//         });
//     },
    
//     // findById: (id, callback) => {
//     //     const query = 'SELECT * FROM Image WHERE idImage = ?';
//     //     db.query(query, [id], callback);
//     // },

//     findById: (id, callback) => {
//         const query = 'SELECT * FROM Image WHERE idImage = ?';
//         db.query(query, [id], (err, results) => {
//             if (err) return callback(err, null);
//             callback(null, results);
//         });
//     },

//     // findByUser: (idUtilisateur, callback) => {
//     //     const query = 'SELECT * FROM Image WHERE idUtilisateur = ?';
//     //     db.query(query, [idUtilisateur], callback);
//     // },

//     findByUser: (idUtilisateur, callback) => {
//         const query = 'SELECT * FROM Image WHERE idUtilisateur = ?';
//         db.query(query, [idUtilisateur], (err, results) => {
//             if (err) return callback(err, null);
//             callback(null, results);
//         });
//     },

//     // findByDossier: (idDossier, callback) => {
//     //     const query = 'SELECT * FROM Image WHERE idDossier = ?';
//     //     db.query(query, [idDossier], callback);
//     // },
//     findByDossier: (idDossier, callback) => {
//         const query = 'SELECT * FROM Image WHERE idDossier = ?';
//         db.query(query, [idDossier], (err, results) => {
//             if (err) return callback(err, null);
//             callback(null, results);
//         });
//     },
//     delete: (id, callback) => {
//         const query = 'DELETE FROM Image WHERE idImage = ?';
//         db.query(query, [id], callback);
//     },
//     updateMetadonnees(idImage, metadonnees, callback) {
//         const query = 'UPDATE Image SET metadonnees = ? WHERE idImage = ?';
//         db.query(query, [metadonnees, idImage], callback);
//     },

//     findAll(callback) {
//         const query = 'SELECT * FROM Image';
//         db.query(query, (err, results) => {
//             if (err) {
//                 console.error('Erreur lors de la récupération des images:', err);
//                 callback(err, null);
//                 return;
//             }
//             callback(null, results);
//         });
//     }
// };

// module.exports = Image;
// backend/models/imageModel.js
// backend/models/imageModel.js
// backend/models/imageModel.js
const db = require('../config/db');

const Image = {
  create: (imageData, callback) => {
    const query = 'INSERT INTO Image SET ?'; // Ajuste "Image" selon le nom exact de la table
    db.query(query, imageData, (err, result) => {
      if (err) return callback(err, null);
      callback(null, result);
    });
  },

  findById: (id, callback) => {
    const query = 'SELECT * FROM Image WHERE idImage = ?';
    db.query(query, [id], (err, results) => {
      if (err) return callback(err, null);
      callback(null, results);
    });
  },

  findByUser: (idUtilisateur, callback) => {
    const query = 'SELECT * FROM Image WHERE idUtilisateur = ?';
    db.query(query, [idUtilisateur], (err, results) => {
      if (err) return callback(err, null);
      callback(null, results);
    });
  },

  findByDossier: (idDossier, callback) => {
    const query = 'SELECT * FROM Image WHERE idDossier = ?';
    db.query(query, [idDossier], (err, results) => {
      if (err) return callback(err, null);
      callback(null, results);
    });
  },

  delete: (id, callback) => {
    const query = 'DELETE FROM Image WHERE idImage = ?';
    db.query(query, [id], callback);
  },

  updateMetadonnees: (idImage, metadonnees, callback) => {
    const query = 'UPDATE Image SET metadonnees = ? WHERE idImage = ?';
    db.query(query, [metadonnees, idImage], callback);
  },

  findAll: (callback) => {
    const query = 'SELECT * FROM Image';
    db.query(query, (err, results) => {
      if (err) {
        console.error('Erreur récupération images:', err);
        callback(err, null);
        return;
      }
      callback(null, results);
    });
  },
};

module.exports = Image;