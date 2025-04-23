import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Modal, TextField, Select, MenuItem, CircularProgress, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import ImageIcon from '@mui/icons-material/Image';
import ShareIcon from '@mui/icons-material/Share';
import RefreshIcon from '@mui/icons-material/Refresh';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { toast } from 'react-toastify';
import { getDossiers, createDossier, updateDossier, uploadImage, getUsers, shareDossier, deleteImage, getImagesByDossier } from '../../services/api';
import DicomViewer from './DicomViewer'; // Ajuster le chemin d'importation

const API_URL = 'http://localhost:5000';
const ORTHANC_URL = 'http://localhost:8042';

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

const fileModalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '80%',
  maxHeight: '80%',
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 2,
  borderRadius: 2,
  overflow: 'auto',
};

const FileViewerModal = ({ open, onClose, selectedFile }) => {
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (open && selectedFile) {
      console.log('Selected File:', selectedFile);
      setImageError(false); // Réinitialiser l'erreur à chaque ouverture
    }
  }, [open, selectedFile]);

  if (!selectedFile) {
    return null;
  }

  const isDicom =
    selectedFile.format.toLowerCase().includes('dicom') ||
    selectedFile.nomFichier.toLowerCase().endsWith('.dcm');

  let dicomWebUrl = null;
  if (isDicom) {
    let metadonnees;
    try {
      metadonnees = JSON.parse(selectedFile.metadonnees || '{}');
    } catch (e) {
      console.error('Erreur parsing métadonnées:', e);
      toast.error('Métadonnées invalides.');
      setImageError(true);
      return;
    }

    if (!metadonnees.orthancId) {
      toast.error('ID Orthanc manquant.');
      setImageError(true);
      return;
    }

    dicomWebUrl = selectedFile.dicomWebUrl
      ? selectedFile.dicomWebUrl.replace('wadouri:http://localhost:8042/wado', 'wadouri:http://localhost:5000/wado')
      : `wadouri:http://localhost:5000/wado?requestType=WADO&instanceID=${metadonnees.orthancId}`;
    console.log('URL DICOM générée:', dicomWebUrl);
  }

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={fileModalStyle}>
        <Typography variant="h6" gutterBottom>
          Visualisation du fichier : {selectedFile.nomFichier}
        </Typography>
        {isDicom ? (
          imageError ? (
            <Typography variant="body2" color="error">
              Impossible de charger l'image DICOM.
            </Typography>
          ) : (
            <DicomViewer dicomWebUrl={dicomWebUrl} />
          )
        ) : selectedFile.format.toLowerCase().includes('image') ? (
          imageError ? (
            <Typography variant="body2" color="error">
              Impossible de charger l'image.
            </Typography>
          ) : (
            <img
              src={`${API_URL}${selectedFile.url}`}
              alt={selectedFile.nomFichier}
              style={{ maxWidth: '100%', maxHeight: '500px' }}
              onError={() => setImageError(true)}
            />
          )
        ) : selectedFile.nomFichier.toLowerCase().endsWith('.pdf') ? (
          <iframe
            src={`${API_URL}${selectedFile.url}`}
            title={selectedFile.nomFichier}
            style={{ width: '100%', height: '500px', border: 'none' }}
          />
        ) : (
          <Typography variant="body2" color="textSecondary">
            Téléchargez le fichier :{' '}
            <a href={`${API_URL}${selectedFile.url}`} download>
              {selectedFile.nomFichier}
            </a>
          </Typography>
        )}
        <Button variant="contained" color="primary" onClick={onClose} sx={{ mt: 2 }}>
          Fermer
        </Button>
      </Box>
    </Modal>
  );
};

const MedecinGererDossier = () => {
  const [dossiers, setDossiers] = useState([]);
  const [patients, setPatients] = useState([]);
  const [infirmiers, setInfirmiers] = useState([]);
  const [medecins, setMedecins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openImageModal, setOpenImageModal] = useState(false);
  const [openShareModal, setOpenShareModal] = useState(false);
  const [openFileModal, setOpenFileModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedDossier, setSelectedDossier] = useState(null);
  const [expandedDossier, setExpandedDossier] = useState(null);
  const [newDossier, setNewDossier] = useState({ idPatient: '', diagnostic: '', traitement: '', etat: 'en cours' });
  const [editDossier, setEditDossier] = useState({ diagnostic: '', traitement: '', etat: '' });
  const [imageFile, setImageFile] = useState(null);
  const [shareType, setShareType] = useState('direct');
  const [selectedUser, setSelectedUser] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [duree, setDuree] = useState('');
  const [shareLoading, setShareLoading] = useState(false);
  const [lienPartage, setLienPartage] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await getUsers({ role: 'Patient' });
        setPatients(response.data.users || []);
        const infirmiersResponse = await getUsers({ role: 'Infirmier' });
        setInfirmiers(infirmiersResponse.data.users || []);
        const medecinsResponse = await getUsers({ role: 'Médecin' });
        setMedecins(medecinsResponse.data.users || []);
      } catch (error) {
        toast.error('Erreur récupération utilisateurs : ' + (error.response?.data?.message || 'Erreur inconnue'));
      }
    };
    fetchUsers();
    fetchDossiers();
  }, []);

  const fetchDossiers = async () => {
    setLoading(true);
    try {
      const response = await getDossiers();
      const dossiersWithImages = await Promise.all(
        response.data.dossiers.map(async (dossier) => {
          const imagesResponse = await getImagesByDossier(dossier.idDossier);
          return { ...dossier, fichiers: imagesResponse.data.images || [] };
        })
      );
      setDossiers(dossiersWithImages);
    } catch (error) {
      toast.error('Erreur récupération dossiers : ' + (error.response?.data?.message || 'Erreur inconnue'));
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchDossiers();
  };

  const handleOpenCreateModal = () => {
    setNewDossier({ idPatient: '', diagnostic: '', traitement: '', etat: 'en cours' });
    setOpenCreateModal(true);
  };

  const handleOpenEditModal = (dossier) => {
    setSelectedDossier(dossier);
    setEditDossier({
      diagnostic: dossier.diagnostic,
      traitement: dossier.traitement,
      etat: dossier.etat,
    });
    setOpenEditModal(true);
  };

  const handleOpenImageModal = (dossier) => {
    setSelectedDossier(dossier);
    setImageFile(null);
    setOpenImageModal(true);
  };

  const handleOpenShareModal = (dossier) => {
    setSelectedDossier(dossier);
    setShareType('direct');
    setSelectedUser('');
    setMotDePasse('');
    setDuree('');
    setLienPartage('');
    setOpenShareModal(true);
  };

  const handleOpenFileModal = (fichier) => {
    setSelectedFile(fichier);
    setOpenFileModal(true);
  };

  const handleToggleExpand = (dossier) => {
    setExpandedDossier(expandedDossier?.idDossier === dossier.idDossier ? null : dossier);
  };

  const handleCreateDossier = async (e) => {
    e.preventDefault();
    try {
      await createDossier(newDossier);
      toast.success('Dossier créé avec succès.');
      setOpenCreateModal(false);
      fetchDossiers();
    } catch (error) {
      toast.error('Erreur création dossier : ' + (error.response?.data?.message || 'Erreur inconnue'));
    }
  };

  const handleUpdateDossier = async (e) => {
    e.preventDefault();
    try {
      await updateDossier(selectedDossier.idDossier, editDossier);
      toast.success('Dossier mis à jour avec succès.');
      setOpenEditModal(false);
      fetchDossiers();
    } catch (error) {
      toast.error('Erreur mise à jour dossier : ' + (error.response?.data?.message || 'Erreur inconnue'));
    }
  };

  const handleUploadImage = async (e) => {
    e.preventDefault();
    if (!imageFile) {
      toast.error('Veuillez sélectionner une image.');
      return;
    }
    const formData = new FormData();
    formData.append('file', imageFile);
    formData.append('idDossier', selectedDossier.idDossier);
    try {
      await uploadImage(formData);
      toast.success('Fichier ajouté avec succès.');
      setOpenImageModal(false);
      fetchDossiers();
    } catch (error) {
      toast.error('Erreur ajout fichier : ' + (error.response?.data?.message || 'Erreur inconnue'));
    }
  };

  const handleDeleteImage = async (imageId) => {
    try {
      await deleteImage(imageId);
      toast.success('Fichier supprimé avec succès.');
      fetchDossiers();
    } catch (error) {
      toast.error('Erreur suppression fichier : ' + (error.response?.data?.message || 'Erreur inconnue'));
    }
  };

  const handleShare = async (e) => {
    e.preventDefault();
    setShareLoading(true);
    setLienPartage('');

    try {
      let shareData = { idDossier: selectedDossier.idDossier };

      if (shareType === 'direct') {
        if (!selectedUser) {
          toast.error('Veuillez sélectionner un utilisateur.');
          setShareLoading(false);
          return;
        }
        shareData.idUtilisateur = parseInt(selectedUser);
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5">
          Gérer les dossiers patients
        </Typography>
        <Box>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleOpenCreateModal}
            sx={{ mr: 1 }}
          >
            Créer un dossier
          </Button>
          <Button
            variant="contained"
            color="secondary"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
          >
            Rafraîchir
          </Button>
        </Box>
      </Box>

      {dossiers.length === 0 ? (
        <Typography variant="body1" color="textSecondary">
          Aucun dossier trouvé. Cliquez sur "Rafraîchir" pour charger les dossiers.
        </Typography>
      ) : (
        <Box sx={{ mt: 2 }}>
          {dossiers.map((dossier) => {
            const patient = patients.find((p) => p.idUtilisateur === dossier.idPatient) || {};
            const isExpanded = expandedDossier?.idDossier === dossier.idDossier;
            return (
              <Box
                key={dossier.idDossier}
                sx={{
                  p: 2,
                  mb: 2,
                  border: '1px solid #ddd',
                  borderRadius: 2,
                  cursor: 'pointer',
                }}
                onClick={() => handleToggleExpand(dossier)}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body1">
                    <strong>{patient.nom} {patient.prenom}</strong>
                  </Typography>
                  {isExpanded && (
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton onClick={(e) => { e.stopPropagation(); handleOpenEditModal(dossier); }} color="primary">
                        <EditIcon />
                      </IconButton>
                      <IconButton onClick={(e) => { e.stopPropagation(); handleOpenImageModal(dossier); }} color="primary">
                        <ImageIcon />
                      </IconButton>
                      <Button
                        variant="outlined"
                        color="primary"
                        onClick={(e) => { e.stopPropagation(); handleOpenShareModal(dossier); }}
                        startIcon={<ShareIcon />}
                      >
                        PARTAGER
                      </Button>
                    </Box>
                  )}
                </Box>
                {isExpanded && (
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="body2">
                      <strong>Dossier ID:</strong> {dossier.idDossier}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Patient:</strong> {patient.nom} {patient.prenom} (ID: {dossier.idPatient})
                    </Typography>
                    <Typography variant="body2">
                      <strong>Email:</strong> {patient.email || 'N/A'}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Téléphone:</strong> {patient.telephone || 'N/A'}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Diagnostic:</strong> {dossier.diagnostic}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Traitement:</strong> {dossier.traitement}
                    </Typography>
                    <Typography variant="body2">
                      <strong>État:</strong> {dossier.etat}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Fichiers:</strong>
                    </Typography>
                    {dossier.fichiers?.length > 0 ? (
                      <Box sx={{ mt: 1 }}>
                        {dossier.fichiers.map((fichier, index) => (
                          <Box key={index} sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Button
                              variant="text"
                              color="primary"
                              startIcon={<VisibilityIcon />}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenFileModal(fichier);
                              }}
                            >
                              {fichier.nomFichier} (ID: {fichier.idImage})
                            </Button>
                            <IconButton
                              color="error"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteImage(fichier.idImage);
                              }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Box>
                        ))}
                      </Box>
                    ) : (
                      <Typography variant="body2" color="textSecondary">
                        Aucun fichier
                      </Typography>
                    )}
                  </Box>
                )}
              </Box>
            );
          })}
        </Box>
      )}

      {/* Modale pour créer un dossier */}
      <Modal open={openCreateModal} onClose={() => setOpenCreateModal(false)}>
        <Box sx={modalStyle}>
          <Typography variant="h6" gutterBottom>
            Créer un dossier
          </Typography>
          <form onSubmit={handleCreateDossier}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body1" gutterBottom>
                Patient
              </Typography>
              <Select
                value={newDossier.idPatient}
                onChange={(e) => setNewDossier({ ...newDossier, idPatient: e.target.value })}
                fullWidth
                displayEmpty
                required
              >
                <MenuItem value="" disabled>
                  Choisir un patient
                </MenuItem>
                {patients.map((patient) => (
                  <MenuItem key={patient.idUtilisateur} value={patient.idUtilisateur}>
                    {patient.nom} {patient.prenom} (ID: {patient.idUtilisateur})
                  </MenuItem>
                ))}
              </Select>
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body1" gutterBottom>
                Diagnostic
              </Typography>
              <TextField
                value={newDossier.diagnostic}
                onChange={(e) => setNewDossier({ ...newDossier, diagnostic: e.target.value })}
                fullWidth
                required
              />
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body1" gutterBottom>
                Traitement
              </Typography>
              <TextField
                value={newDossier.traitement}
                onChange={(e) => setNewDossier({ ...newDossier, traitement: e.target.value })}
                fullWidth
                required
              />
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body1" gutterBottom>
                État
              </Typography>
              <Select
                value={newDossier.etat}
                onChange={(e) => setNewDossier({ ...newDossier, etat: e.target.value })}
                fullWidth
              >
                <MenuItem value="en cours">En cours</MenuItem>
                <MenuItem value="traité">Traité</MenuItem>
              </Select>
            </Box>
            <Button type="submit" variant="contained" color="primary" fullWidth>
              Créer
            </Button>
          </form>
        </Box>
      </Modal>

      {/* Modale pour modifier un dossier */}
      <Modal open={openEditModal} onClose={() => setOpenEditModal(false)}>
        <Box sx={modalStyle}>
          <Typography variant="h6" gutterBottom>
            Modifier le dossier (ID: {selectedDossier?.idDossier})
          </Typography>
          <form onSubmit={handleUpdateDossier}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body1" gutterBottom>
                Diagnostic
              </Typography>
              <TextField
                value={editDossier.diagnostic}
                onChange={(e) => setEditDossier({ ...editDossier, diagnostic: e.target.value })}
                fullWidth
                required
              />
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body1" gutterBottom>
                Traitement
              </Typography>
              <TextField
                value={editDossier.traitement}
                onChange={(e) => setEditDossier({ ...editDossier, traitement: e.target.value })}
                fullWidth
                required
              />
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body1" gutterBottom>
                État
              </Typography>
              <Select
                value={editDossier.etat}
                onChange={(e) => setEditDossier({ ...editDossier, etat: e.target.value })}
                fullWidth
              >
                <MenuItem value="en cours">En cours</MenuItem>
                <MenuItem value="traité">Traité</MenuItem>
              </Select>
            </Box>
            <Button type="submit" variant="contained" color="primary" fullWidth>
              Mettre à jour
            </Button>
          </form>
        </Box>
      </Modal>

      {/* Modale pour ajouter une image */}
      <Modal open={openImageModal} onClose={() => setOpenImageModal(false)}>
        <Box sx={modalStyle}>
          <Typography variant="h6" gutterBottom>
            Ajouter une image au dossier (ID: {selectedDossier?.idDossier})
          </Typography>
          <form onSubmit={handleUploadImage}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body1" gutterBottom>
                Sélectionner un fichier
              </Typography>
              <TextField
                type="file"
                onChange={(e) => setImageFile(e.target.files[0])}
                fullWidth
                inputProps={{ accept: '.dcm,.pdf,.jpg,.jpeg,.png,.docx,.txt' }}
              />
            </Box>
            <Button type="submit" variant="contained" color="primary" fullWidth>
              Ajouter
            </Button>
          </form>
        </Box>
      </Modal>

      {/* Modale pour partager un dossier */}
      <Modal open={openShareModal} onClose={() => setOpenShareModal(false)}>
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
                  Sélectionner un infirmier
                </Typography>
                <Select
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  fullWidth
                  displayEmpty
                >
                  <MenuItem value="" disabled>
                    Choisir un infirmier
                  </MenuItem>
                  {infirmiers.map((infirmier) => (
                    <MenuItem key={infirmier.idUtilisateur} value={infirmier.idUtilisateur}>
                      {infirmier.nom} {infirmier.prenom} (ID: {infirmier.idUtilisateur})
                    </MenuItem>
                  ))}
                </Select>
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

      <FileViewerModal
        open={openFileModal}
        onClose={() => setOpenFileModal(false)}
        selectedFile={selectedFile}
      />
    </Box>
  );
};

export default MedecinGererDossier;