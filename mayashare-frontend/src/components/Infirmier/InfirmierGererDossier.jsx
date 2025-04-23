import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Modal, TextField, Select, MenuItem, CircularProgress } from '@mui/material';
import { toast } from 'react-toastify';
import { getDossiers, shareDossier } from '../../services/api';

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
};

const InfirmierGererDossier = () => {
  const [dossiers, setDossiers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [selectedDossier, setSelectedDossier] = useState(null);
  const [shareType, setShareType] = useState('direct');
  const [idUtilisateur, setIdUtilisateur] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [duree, setDuree] = useState('');
  const [shareLoading, setShareLoading] = useState(false);
  const [lienPartage, setLienPartage] = useState('');

  useEffect(() => {
    const fetchDossiers =  async () => {
      try {
        const response = await getDossiers();
        setDossiers(response.data.dossiers || []);
      } catch (error) {
        toast.error('Erreur lors de la récupération des dossiers : ' + (error.response?.data?.message || 'Erreur inconnue'));
      } finally {
        setLoading(false);
      }
    };
    fetchDossiers();
  }, []);

  const handleOpenModal = (dossier) => {
    setSelectedDossier(dossier);
    setOpenModal(true);
    setShareType('direct');
    setIdUtilisateur('');
    setMotDePasse('');
    setDuree('');
    setLienPartage('');
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedDossier(null);
  };

  const handleShare = async (e) => {
    e.preventDefault();
    setShareLoading(true);
    setLienPartage('');

    try {
      let shareData = { idDossier: selectedDossier.idDossier };

      if (shareType === 'direct') {
        if (!idUtilisateur) {
          toast.error('Veuillez entrer un ID d’utilisateur (infirmier).');
          setShareLoading(false);
          return;
        }
        shareData.idUtilisateur = parseInt(idUtilisateur);
      } else {
        if (!motDePasse || !duree) {
          toast.error('Veuillez entrer un mot de passe et une durée.');
          setShareLoading(false);
          return;
        }
        shareData.motDePasse = motDePasse;
        shareData.duree = parseInt(duree);
      }

      const response = await shareDossier(shareData);
      if (shareType === 'direct') {
        toast.success(response.data.message);
      } else {
        setLienPartage(response.data.lienPartage);
        toast.success('Lien de partage généré avec succès.');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors du partage.');
    } finally {
      setShareLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h5" gutterBottom>
        Gérer les dossiers patients
      </Typography>
      {dossiers.length === 0 ? (
        <Typography variant="body1" color="textSecondary">
          Aucun dossier trouvé.
        </Typography>
      ) : (
        <Box sx={{ mt: 2 }}>
          {dossiers.map((dossier) => (
            <Box
              key={dossier.idDossier}
              sx={{
                p: 2,
                mb: 2,
                border: '1px solid #ddd',
                borderRadius: 2,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Box>
                <Typography variant="body1">
                  <strong>Dossier ID:</strong> {dossier.idDossier}
                </Typography>
                <Typography variant="body2">
                  <strong>Patient ID:</strong> {dossier.idPatient}
                </Typography>
                <Typography variant="body2">
                  <strong>Diagnostic:</strong> {dossier.diagnostic}
                </Typography>
                <Typography variant="body2">
                  <strong>Traitement:</strong> {dossier.traitement}
                </Typography>
              </Box>
              <Button
                variant="outlined"
                color="primary"
                onClick={() => handleOpenModal(dossier)}
              >
                Partager
              </Button>
            </Box>
          ))}
        </Box>
      )}

      {/* Modale pour le partage */}
      <Modal open={openModal} onClose={handleCloseModal}>
        <Box sx={modalStyle}>
          <Typography variant="h6" gutterBottom>
            Partager le dossier (ID: {selectedDossier?.idDossier})
          </Typography>
          <form onSubmit={handleShare}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body1" gutterBottom>
                Type de partage
              </Typography>
              <Select
                value={shareType}
                onChange={(e) => setShareType(e.target.value)}
                fullWidth
              >
                <MenuItem value="direct">Avec un infirmier</MenuItem>
                <MenuItem value="link">Générer un lien (pour un autre médecin)</MenuItem>
              </Select>
            </Box>

            {shareType === 'direct' ? (
              <Box sx={{ mb: 2 }}>
                <Typography variant="body1" gutterBottom>
                  ID de l’infirmier
                </Typography>
                <TextField
                  type="number"
                  value={idUtilisateur}
                  onChange={(e) => setIdUtilisateur(e.target.value)}
                  fullWidth
                  placeholder="Entrez l’ID de l’infirmier"
                />
              </Box>
            ) : (
              <>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body1" gutterBottom>
                    Mot de passe
                  </Typography>
                  <TextField
                    type="text"
                    value={motDePasse}
                    onChange={(e) => setMotDePasse(e.target.value)}
                    fullWidth
                    placeholder="Entrez un mot de passe"
                  />
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body1" gutterBottom>
                    Durée (en minutes)
                  </Typography>
                  <TextField
                    type="number"
                    value={duree}
                    onChange={(e) => setDuree(e.target.value)}
                    fullWidth
                    placeholder="Entrez la durée en minutes"
                  />
                </Box>
              </>
            )}

            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              disabled={shareLoading}
              startIcon={shareLoading ? <CircularProgress size={20} /> : null}
            >
              {shareLoading ? 'Partage en cours...' : 'Partager'}
            </Button>
          </form>

          {lienPartage && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body1" gutterBottom>
                Lien de partage :
              </Typography>
              <Typography variant="body2" sx={{ wordBreak: 'break-all', color: 'blue' }}>
                <a href={lienPartage} target="_blank" rel="noopener noreferrer">
                  {lienPartage}
                </a>
              </Typography>
            </Box>
          )}
        </Box>
      </Modal>
    </Box>
  );
};

export default InfirmierGererDossier;