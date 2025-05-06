// PatientConsulterDossier.jsx

import React, { useEffect, useState } from 'react';
import axios from 'axios';

const PatientConsulterDossier = ({ idPatient }) => {
  const [dossiers, setDossiers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchDossiers = async () => {
      try {
        const response = await axios.get(`/api/dossiers/patient/${idPatient}`, {
          withCredentials: true, // si vous utilisez des cookies pour l'authentification
        });

        if (response.data.dossiers && response.data.dossiers.length > 0) {
          setDossiers(response.data.dossiers);
        } else {
          setMessage('Aucun dossier trouvé.');
        }
      } catch (error) {
        console.error('Erreur lors du chargement des dossiers :', error);
        setMessage('Erreur lors du chargement des dossiers.');
      } finally {
        setLoading(false);
      }
    };

    if (idPatient) {
      fetchDossiers();
    }
  }, [idPatient]);

  if (loading) return <p>Chargement des dossiers...</p>;

  return (
    <div className="container">
      <h2>Mes dossiers médicaux</h2>
      {message && <p>{message}</p>}
      {dossiers.map((dossier) => (
        <div key={dossier.idDossier} className="card my-3 p-3 shadow-sm">
          <h5>Dossier n° {dossier.idDossier}</h5>
          <p><strong>Date :</strong> {new Date(dossier.dateCreation).toLocaleDateString()}</p>
          <p><strong>Diagnostic :</strong> {dossier.diagnostic}</p>
          <p><strong>Traitement :</strong> {dossier.traitement}</p>
          <p><strong>État :</strong> {dossier.etat}</p>
          <div>
            <strong>Fichiers :</strong>
            {dossier.fichiers.length > 0 ? (
              <ul>
                {dossier.fichiers.map((idImage) => (
                  <li key={idImage}>
                    <a href={`/api/images/${idImage}`} target="_blank" rel="noopener noreferrer">
                      Voir image {idImage}
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p>Aucun fichier associé</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default PatientConsulterDossier;
