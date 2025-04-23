import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Modal, 
  TextField, 
  Select, 
  MenuItem, 
  CircularProgress, 
  IconButton, 
  Chip, 
  Paper 
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import ImageIcon from '@mui/icons-material/Image';
import ShareIcon from '@mui/icons-material/Share';
import RefreshIcon from '@mui/icons-material/Refresh';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { getDossiers, createDossier, updateDossier, uploadImage, getUsers, shareDossier, deleteImage, getImagesByDossier } from '../../services/api';
import DicomViewer from './DicomViewer';

// Constantes
const API_URL = 'http://localhost:5000';
const ORTHANC_URL = 'http://localhost:8042';

// Palette de couleurs
const colors = {
  primary: '#0077B6',
  secondary: '#00B4D8',
  background: '#F8F9FA',
  text: '#333',
  accent: '#48CAE4',
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  divider: 'rgba(0, 0, 0, 0.12)',
};

// Styles des modales
const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 450,
  bgcolor: 'white',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  p: 4,
  borderRadius: 3,
  outline: 'none',
};

const fileModalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '80%',
  maxWidth: 900,
  maxHeight: '80%',
  bgcolor: 'white',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  p: 3,
  borderRadius: 3,
  overflow: 'auto',
  outline: 'none',
};

// Animation variants pour framer-motion
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1],
    },
  }),
  hover: {
    scale: 1.02,
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)',
    transition: { duration: 0.2 },
  },
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
  },
  exit: { 
    opacity: 0, 
    scale: 0.95, 
    transition: { duration: 0.2 },
  },
};

const expandVariants = {
  hidden: { height: 0, opacity: 0 },
  visible: { 
    height: 'auto', 
    opacity: 1, 
    transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
  },
  exit: { 
    height: 0, 
    opacity: 0, 
    transition: { duration: 0.2 },
  },
};

// Composant FileViewerModal amélioré
const FileViewerModal = ({ open, onClose, selectedFile }) => {
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (open && selectedFile) {
      console.log('Selected File:', selectedFile);
      setImageError(false);
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
      <motion.div
        variants={modalVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        <Box sx={fileModalStyle}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: colors.text }}>
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
                style={{ maxWidth: '100%', maxHeight: '500px', borderRadius: 8 }}
                onError={() => setImageError(true)}
              />
            )
          ) : selectedFile.nomFichier.toLowerCase().endsWith('.pdf') ? (
            <iframe
              src={`${API_URL}${selectedFile.url}`}
              title={selectedFile.nomFichier}
              style={{ width: '100%', height: '500px', border: 'none', borderRadius: 8 }}
            />
          ) : (
            <Typography variant="body2" color={colors.text}>
              Téléchargez le fichier :{' '}
              <a href={`${API_URL}${selectedFile.url}`} download style={{ color: colors.primary }}>
                {selectedFile.nomFichier}
              </a>
            </Typography>
          )}
          <Button 
            variant="contained" 
            color="primary" 
            onClick={onClose} 
            sx={{ mt: 2, bgcolor: colors.primary, '&:hover': { bgcolor: colors.secondary } }}
          >
            Fermer
          </Button>
        </Box>
      </motion.div>
    </Modal>
  );
};

// Composant principal amélioré
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
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <CircularProgress size={50} sx={{ color: colors.primary }} />
          <Typography sx={{ mt: 2, color: colors.text, fontWeight: 500 }}>
            Chargement des dossiers...
          </Typography>
        </motion.div>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4, bgcolor: colors.background, minHeight: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 600, color: colors.text }}>
          Gérer les dossiers patients
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleOpenCreateModal}
            sx={{
              bgcolor: colors.primary,
              '&:hover': { bgcolor: colors.secondary },
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 500,
            }}
          >
            Créer un dossier
          </Button>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            sx={{
              borderColor: colors.primary,
              color: colors.primary,
              '&:hover': { borderColor: colors.secondary, color: colors.secondary },
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 500,
            }}
          >
            Rafraîchir
          </Button>
        </Box>
      </Box>

      {dossiers.length === 0 ? (
        <Typography variant="body1" color={colors.text} sx={{ textAlign: 'center', mt: 4 }}>
          Aucun dossier trouvé. Cliquez sur "Rafraîchir" pour charger les dossiers.
        </Typography>
      ) : (
        <Box sx={{ mt: 2 }}>
          {dossiers.map((dossier, index) => {
            const patient = patients.find((p) => p.idUtilisateur === dossier.idPatient) || {};
            const isExpanded = expandedDossier?.idDossier === dossier.idDossier;
            return (
              <motion.div
                key={dossier.idDossier}
                custom={index}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                whileHover="hover"
              >
                <Paper
                  sx={{
                    p: 3,
                    mb: 2,
                    borderRadius: 3,
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                    bgcolor: 'white',
                    transition: 'all 0.3s ease',
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, color: colors.text }}>
                        {patient.nom} {patient.prenom}
                      </Typography>
                      <Chip
                        label={dossier.etat}
                        size="small"
                        sx={{
                          bgcolor: dossier.etat === 'en cours' ? colors.warning : colors.success,
                          color: 'white',
                          fontWeight: 500,
                        }}
                      />
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {isExpanded && (
                        <>
                          <IconButton 
                            onClick={(e) => { e.stopPropagation(); handleOpenEditModal(dossier); }} 
                            sx={{ color: colors.primary, '&:hover': { color: colors.secondary } }}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton 
                            onClick={(e) => { e.stopPropagation(); handleOpenImageModal(dossier); }} 
                            sx={{ color: colors.primary, '&:hover': { color: colors.secondary } }}
                          >
                            <ImageIcon />
                          </IconButton>
                          <Button
                            variant="outlined"
                            color="primary"
                            onClick={(e) => { e.stopPropagation(); handleOpenShareModal(dossier); }}
                            startIcon={<ShareIcon />}
                            sx={{
                              borderColor: colors.primary,
                              color: colors.primary,
                              '&:hover': { borderColor: colors.secondary, color: colors.secondary },
                              borderRadius: 2,
                              textTransform: 'none',
                            }}
                          >
                            Partager
                          </Button>
                        </>
                      )}
                      <IconButton onClick={() => handleToggleExpand(dossier)}>
                        {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                      </IconButton>
                    </Box>
                  </Box>
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        variants={expandVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                      >
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="body2" sx={{ color: colors.text, mb: 1 }}>
                            <strong>Dossier ID :</strong> {dossier.idDossier}
                          </Typography>
                          <Typography variant="body2" sx={{ color: colors.text, mb: 1 }}>
                            <strong>Patient :</strong> {patient.nom} {patient.prenom} (ID: {dossier.idPatient})
                          </Typography>
                          <Typography variant="body2" sx={{ color: colors.text, mb: 1 }}>
                            <strong>Email :</strong> {patient.email || 'N/A'}
                          </Typography>
                          <Typography variant="body2" sx={{ color: colors.text, mb: 1 }}>
                            <strong>Téléphone :</strong> {patient.telephone || 'N/A'}
                          </Typography>
                          <Typography variant="body2" sx={{ color: colors.text, mb: 1 }}>
                            <strong>Diagnostic :</strong> {dossier.diagnostic}
                          </Typography>
                          <Typography variant="body2" sx={{ color: colors.text, mb: 1 }}>
                            <strong>Traitement :</strong> {dossier.traitement}
                          </Typography>
                          <Typography variant="body2" sx={{ color: colors.text, mb: 1 }}>
                            <strong>Fichiers :</strong>
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
                                    sx={{
                                      textTransform: 'none',
                                      color: colors.primary,
                                      '&:hover': { color: colors.secondary },
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
                                    sx={{ '&:hover': { color: colors.error } }}
                                  >
                                    <DeleteIcon />
                                  </IconButton>
                                </Box>
                              ))}
                            </Box>
                          ) : (
                            <Typography variant="body2" color={colors.text} sx={{ ml: 2 }}>
                              Aucun fichier
                            </Typography>
                          )}
                        </Box>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Paper>
              </motion.div>
            );
          })}
        </Box>
      )}

      {/* Modale pour créer un dossier */}
      <Modal open={openCreateModal} onClose={() => setOpenCreateModal(false)}>
        <motion.div
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <Box sx={modalStyle}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: colors.text }}>
              Créer un dossier
            </Typography>
            <form onSubmit={handleCreateDossier}>
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" gutterBottom sx={{ fontWeight: 500, color: colors.text }}>
                  Patient
                </Typography>
                <Select
                  value={newDossier.idPatient}
                  onChange={(e) => setNewDossier({ ...newDossier, idPatient: e.target.value })}
                  fullWidth
                  displayEmpty
                  required
                  sx={{ borderRadius: 2 }}
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
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" gutterBottom sx={{ fontWeight: 500, color: colors.text }}>
                  Diagnostic
                </Typography>
                <TextField
                  value={newDossier.diagnostic}
                  onChange={(e) => setNewDossier({ ...newDossier, diagnostic: e.target.value })}
                  fullWidth
                  required
                  variant="outlined"
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Box>
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" gutterBottom sx={{ fontWeight: 500, color: colors.text }}>
                  Traitement
                </Typography>
                <TextField
                  value={newDossier.traitement}
                  onChange={(e) => setNewDossier({ ...newDossier, traitement: e.target.value })}
                  fullWidth
                  required
                  variant="outlined"
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Box>
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" gutterBottom sx={{ fontWeight: 500, color: colors.text }}>
                  État
                </Typography>
                <Select
                  value={newDossier.etat}
                  onChange={(e) => setNewDossier({ ...newDossier, etat: e.target.value })}
                  fullWidth
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="en cours">En cours</MenuItem>
                  <MenuItem value="traité">Traité</MenuItem>
                </Select>
              </Box>
              <Button 
                type="submit" 
                variant="contained" 
                color="primary" 
                fullWidth
                sx={{
                  bgcolor: colors.primary,
                  '&:hover': { bgcolor: colors.secondary },
                  borderRadius: 2,
                  textTransform: 'none',
                  py: 1.5,
                  fontWeight: 500,
                }}
              >
                Créer
              </Button>
            </form>
          </Box>
        </motion.div>
      </Modal>

      {/* Modale pour modifier un dossier */}
      <Modal open={openEditModal} onClose={() => setOpenEditModal(false)}>
        <motion.div
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <Box sx={modalStyle}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: colors.text }}>
              Modifier le dossier (ID: {selectedDossier?.idDossier})
            </Typography>
            <form onSubmit={handleUpdateDossier}>
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" gutterBottom sx={{ fontWeight: 500, color: colors.text }}>
                  Diagnostic
                </Typography>
                <TextField
                  value={editDossier.diagnostic}
                  onChange={(e) => setEditDossier({ ...editDossier, diagnostic: e.target.value })}
                  fullWidth
                  required
                  variant="outlined"
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Box>
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" gutterBottom sx={{ fontWeight: 500, color: colors.text }}>
                  Traitement
                </Typography>
                <TextField
                  value={editDossier.traitement}
                  onChange={(e) => setEditDossier({ ...editDossier, traitement: e.target.value })}
                  fullWidth
                  required
                  variant="outlined"
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Box>
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" gutterBottom sx={{ fontWeight: 500, color: colors.text }}>
                  État
                </Typography>
                <Select
                  value={editDossier.etat}
                  onChange={(e) => setEditDossier({ ...editDossier, etat: e.target.value })}
                  fullWidth
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="en cours">En cours</MenuItem>
                  <MenuItem value="traité">Traité</MenuItem>
                </Select>
              </Box>
              <Button 
                type="submit" 
                variant="contained" 
                color="primary" 
                fullWidth
                sx={{
                  bgcolor: colors.primary,
                  '&:hover': { bgcolor: colors.secondary },
                  borderRadius: 2,
                  textTransform: 'none',
                  py: 1.5,
                  fontWeight: 500,
                }}
              >
                Mettre à jour
              </Button>
            </form>
          </Box>
        </motion.div>
      </Modal>

      {/* Modale pour ajouter une image */}
      <Modal open={openImageModal} onClose={() => setOpenImageModal(false)}>
        <motion.div
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <Box sx={modalStyle}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: colors.text }}>
              Ajouter une image au dossier (ID: {selectedDossier?.idDossier})
            </Typography>
            <form onSubmit={handleUploadImage}>
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" gutterBottom sx={{ fontWeight: 500, color: colors.text }}>
                  Sélectionner un fichier
                </Typography>
                <TextField
                  type="file"
                  onChange={(e) => setImageFile(e.target.files[0])}
                  fullWidth
                  inputProps={{ accept: '.dcm,.pdf,.jpg,.jpeg,.png,.docx,.txt' }}
                  variant="outlined"
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Box>
              <Button 
                type="submit" 
                variant="contained" 
                color="primary" 
                fullWidth
                sx={{
                  bgcolor: colors.primary,
                  '&:hover': { bgcolor: colors.secondary },
                  borderRadius: 2,
                  textTransform: 'none',
                  py: 1.5,
                  fontWeight: 500,
                }}
              >
                Ajouter
              </Button>
            </form>
          </Box>
        </motion.div>
      </Modal>

      {/* Modale pour partager un dossier */}
      <Modal open={openShareModal} onClose={() => setOpenShareModal(false)}>
        <motion.div
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <Box sx={modalStyle}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: colors.text }}>
              Partager le dossier (ID: {selectedDossier?.idDossier})
            </Typography>
            <form onSubmit={handleShare}>
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" gutterBottom sx={{ fontWeight: 500, color: colors.text }}>
                  Type de partage
                </Typography>
                <Select
                  value={shareType}
                  onChange={(e) => setShareType(e.target.value)}
                  fullWidth
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="direct">Avec un infirmier</MenuItem>
                  <MenuItem value="link">Générer un lien (pour un autre médecin)</MenuItem>
                </Select>
              </Box>

              {shareType === 'direct' ? (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" gutterBottom sx={{ fontWeight: 500, color: colors.text }}>
                    Sélectionner un infirmier
                  </Typography>
                  <Select
                    value={selectedUser}
                    onChange={(e) => setSelectedUser(e.target.value)}
                    fullWidth
                    displayEmpty
                    sx={{ borderRadius: 2 }}
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
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="body2" gutterBottom sx={{ fontWeight: 500, color: colors.text }}>
                      Mot de passe
                    </Typography>
                    <TextField
                      type="text"
                      value={motDePasse}
                      onChange={(e) => setMotDePasse(e.target.value)}
                      fullWidth
                      placeholder="Entrez un mot de passe"
                      variant="outlined"
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />
                  </Box>
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="body2" gutterBottom sx={{ fontWeight: 500, color: colors.text }}>
                      Durée (en minutes)
                    </Typography>
                    <TextField
                      type="number"
                      value={duree}
                      onChange={(e) => setDuree(e.target.value)}
                      fullWidth
                      placeholder="Entrez la durée en minutes"
                      variant="outlined"
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
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
                sx={{
                  bgcolor: colors.primary,
                  '&:hover': { bgcolor: colors.secondary },
                  borderRadius: 2,
                  textTransform: 'none',
                  py: 1.5,
                  fontWeight: 500,
                }}
              >
                {shareLoading ? 'Partage en cours...' : 'Partager'}
              </Button>
            </form>

            {lienPartage && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" gutterBottom sx={{ fontWeight: 500, color: colors.text }}>
                  Lien de partage :
                </Typography>
                <Typography variant="body2" sx={{ wordBreak: 'break-all', color: colors.primary }}>
                  <a href={lienPartage} target="_blank" rel="noopener noreferrer">
                    {lienPartage}
                  </a>
                </Typography>
              </Box>
            )}
          </Box>
        </motion.div>
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