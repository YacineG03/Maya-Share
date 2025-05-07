import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Avatar,
  Chip,
  IconButton,
  Tooltip,
  Divider,
  Modal,
  Button,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import ImageIcon from '@mui/icons-material/Image';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import DescriptionIcon from '@mui/icons-material/Description';
import NoteIcon from '@mui/icons-material/Note';
import VisibilityIcon from '@mui/icons-material/Visibility';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import PhotoIcon from '@mui/icons-material/Photo';
import { motion, AnimatePresence } from 'framer-motion';
import { getDossiersByPatient, getImagesByDossier, getConsultationsByDossier } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

// Constantes
const API_URL = 'http://localhost:5000';

// Palette de couleurs enrichie
const colors = {
  primary: '#0077B6',
  primaryDark: '#005F8C',
  secondary: '#00B4D8',
  secondaryLight: '#48CAE4',
  background: 'linear-gradient(135deg, #F8F9FA 0%, #E9ECEF 100%)',
  cardBackground: 'linear-gradient(145deg, #FFFFFF 0%, #F9FAFB 100%)',
  modalBackground: 'rgba(255, 255, 255, 0.95)',
  text: '#1A202C',
  textSecondary: '#4A5568',
  accent: '#48CAE4',
  success: '#34C759',
  error: '#FF3B30',
  warning: '#FF9500',
  divider: 'rgba(0, 0, 0, 0.08)',
  shadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
};

// Styles des modales avec effet de verre dépoli
const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 480,
  bgcolor: colors.modalBackground,
  backdropFilter: 'blur(10px)',
  boxShadow: colors.shadow,
  p: 4,
  borderRadius: 4,
  outline: 'none',
  border: '1px solid rgba(255, 255, 255, 0.2)',
};

const fileModalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '80%',
  maxWidth: 960,
  maxHeight: '85%',
  bgcolor: colors.modalBackground,
  backdropFilter: 'blur(10px)',
  boxShadow: colors.shadow,
  p: 4,
  borderRadius: 4,
  overflow: 'auto',
  outline: 'none',
  border: '1px solid rgba(255, 255, 255, 0.2)',
};

// Animation variants
const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.15,
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
  hover: {
    scale: 1.03,
    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)',
    transition: { duration: 0.3 },
  },
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.9, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    y: 20,
    transition: { duration: 0.3 },
  },
};

const expandVariants = {
  hidden: { height: 0, opacity: 0 },
  visible: {
    height: 'auto',
    opacity: 1,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  },
  exit: {
    height: 0,
    opacity: 0,
    transition: { duration: 0.3 },
  },
};

// Modale pour la visualisation des fichiers
const FileViewerModal = ({ open, onClose, selectedFile }) => {
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (open && selectedFile) {
      console.log('Fichier sélectionné:', selectedFile);
      setImageError(false);
    }
  }, [open, selectedFile]);

  if (!selectedFile) {
    return null;
  }

  const isDicom =
    selectedFile.format?.toLowerCase().includes('dicom') ||
    selectedFile.nomFichier.toLowerCase().endsWith('.dcm');
  const isImage =
    selectedFile.format?.toLowerCase().includes('image') ||
    selectedFile.nomFichier.toLowerCase().match(/\.(jpg|jpeg|png)$/);
  const isPdf = selectedFile.nomFichier.toLowerCase().endsWith('.pdf');

  return (
    <Modal open={open} onClose={onClose} sx={{ backdropFilter: 'blur(5px)' }}>
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
          <Divider sx={{ my: 2, bgcolor: colors.divider }} />
          {isDicom && selectedFile.viewerUrl ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
              <Button
                variant="contained"
                color="primary"
                href={selectedFile.viewerUrl}
                target="_blank"
                sx={{
                  bgcolor: colors.primary,
                  '&:hover': { bgcolor: colors.secondary },
                  borderRadius: 3,
                  textTransform: 'none',
                  py: 1.2,
                  fontWeight: 500,
                }}
              >
                Ouvrir dans la visionneuse DICOM
              </Button>
            </Box>
          ) : isImage ? (
            imageError ? (
              <Typography variant="body2" color={colors.error}>
                Impossible de charger l'image.
              </Typography>
            ) : (
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                <img
                  src={`${API_URL}${selectedFile.url}`}
                  alt={selectedFile.nomFichier}
                  style={{ maxWidth: '100%', maxHeight: '500px', borderRadius: 12, boxShadow: colors.shadow }}
                  onError={() => setImageError(true)}
                />
              </Box>
            )
          ) : isPdf ? (
            <iframe
              src={`${API_URL}${selectedFile.url}`}
              title={selectedFile.nomFichier}
              style={{ width: '100%', height: '500px', border: 'none', borderRadius: 12, boxShadow: colors.shadow }}
            />
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <DescriptionIcon sx={{ color: colors.primary }} />
              <Typography variant="body2" color={colors.textSecondary}>
                Téléchargez le fichier :{' '}
                <a href={`${API_URL}${selectedFile.url}`} download style={{ color: colors.primary, textDecoration: 'none' }}>
                  {selectedFile.nomFichier}
                </a>
              </Typography>
            </Box>
          )}
          <Button
            variant="contained"
            color="primary"
            onClick={onClose}
            sx={{
              mt: 3,
              bgcolor: colors.primary,
              '&:hover': { bgcolor: colors.secondary },
              borderRadius: 3,
              textTransform: 'none',
              py: 1.2,
              fontWeight: 500,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            }}
          >
            Fermer
          </Button>
        </Box>
      </motion.div>
    </Modal>
  );
};

// Sous-modale pour les détails de la consultation
const ConsultationDetailsModal = ({ open, onClose, consultation }) => {
  return (
    <Modal open={open} onClose={onClose} sx={{ backdropFilter: 'blur(5px)' }}>
      <motion.div
        variants={modalVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        <Box sx={modalStyle}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: colors.text }}>
            Détails de la consultation (ID: {consultation?.idConsultation})
          </Typography>
          <Divider sx={{ my: 2, bgcolor: colors.divider }} />
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" gutterBottom sx={{ fontWeight: 500, color: colors.textSecondary }}>
              Notes
            </Typography>
            <Typography variant="body1" sx={{ color: colors.text }}>
              {consultation?.notes || 'Aucune note'}
            </Typography>
          </Box>
          <Button
            variant="outlined"
            color="primary"
            onClick={onClose}
            fullWidth
            sx={{
              mt: 2,
              borderColor: colors.primary,
              color: colors.primary,
              '&:hover': { borderColor: colors.secondary, color: colors.secondary },
              borderRadius: 3,
              textTransform: 'none',
              py: 1.5,
              fontWeight: 500,
            }}
          >
            Fermer
          </Button>
        </Box>
      </motion.div>
    </Modal>
  );
};

const PatientConsulterDossier = () => {
  const [dossiers, setDossiers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [imagesMap, setImagesMap] = useState({});
  const [expandedDossier, setExpandedDossier] = useState(null);
  const [openConsultationDetailsModal, setOpenConsultationDetailsModal] = useState(false);
  const [openFileModal, setOpenFileModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedConsultation, setSelectedConsultation] = useState(null);
  const navigate = useNavigate();

  const dossiersContainerRef = useRef(null);

  const fetchDossiers = async () => {
    setLoading(true);
    try {
      const response = await getDossiersByPatient();
      const data = response.data.dossiers || [];
      console.log('Dossiers reçus:', data);

      const dossiersWithDetails = await Promise.all(
        data.map(async (dossier) => {
          const imagesResponse = await getImagesByDossier(dossier.idDossier);
          const consultationsResponse = await getConsultationsByDossier(dossier.idDossier);
          const images = imagesResponse.data.images || [];
          const consultations = consultationsResponse.data.consultations || [];

          const consultationsWithImages = consultations.map((consultation) => {
            const consultationImages = images.filter(image => image.idConsultation === consultation.idConsultation);
            return {
              ...consultation,
              images: consultationImages,
            };
          });

          return {
            ...dossier,
            consultations: consultationsWithImages,
            fichiers: images,
          };
        })
      );

      setDossiers(dossiersWithDetails);

      const imagesMapping = dossiersWithDetails.reduce((acc, dossier) => {
        acc[dossier.idDossier] = dossier.fichiers;
        return acc;
      }, {});
      setImagesMap(imagesMapping);

      setError(null);
    } catch (err) {
      console.error('Erreur lors de fetchDossiers:', err);
      if (err.response?.status === 401) {
        toast.error('Session expirée. Veuillez vous reconnecter.');
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        setError('Erreur récupération dossiers : ' + (err.response?.data?.message || 'Erreur inconnue'));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDossiers();
  }, [navigate]);

  const formatDate = (dateString) => {
    if (!dateString) return 'Non spécifié';
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const handleToggleExpand = (dossier) => {
    setExpandedDossier(expandedDossier?.idDossier === dossier.idDossier ? null : dossier);
  };

  const handleOpenConsultationDetailsModal = (consultation) => {
    setSelectedConsultation(consultation);
    setOpenConsultationDetailsModal(true);
  };

  const handleOpenFileModal = (fichier) => {
    setSelectedFile(fichier);
    setOpenFileModal(true);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: colors.background }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <CircularProgress size={60} sx={{ color: colors.primary }} thickness={5} />
          <Typography sx={{ mt: 2, color: colors.text, fontWeight: 500, letterSpacing: 0.5 }}>
            Chargement des dossiers...
          </Typography>
        </motion.div>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4, bgcolor: colors.background, minHeight: '100vh' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: colors.text, letterSpacing: -0.5 }}>
          Consulter un dossier médical
        </Typography>
        <Button
          variant="outlined"
          color="primary"
          startIcon={<RefreshIcon />}
          onClick={fetchDossiers}
          disabled={loading}
          sx={{
            borderColor: colors.primary,
            color: colors.primary,
            '&:hover': { borderColor: colors.secondary, color: colors.secondary },
            borderRadius: 3,
            textTransform: 'none',
            fontWeight: 500,
            py: 1.2,
            px: 3,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          }}
        >
          Rafraîchir
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {dossiers.length === 0 ? (
        <Box sx={{ textAlign: 'center', mt: 6 }}>
          <Typography variant="h6" color={colors.textSecondary} sx={{ mb: 2 }}>
            Aucun dossier médical trouvé.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<RefreshIcon />}
            onClick={fetchDossiers}
            sx={{
              bgcolor: colors.primary,
              '&:hover': { bgcolor: colors.secondary },
              borderRadius: 3,
              textTransform: 'none',
              fontWeight: 500,
            }}
          >
            Rafraîchir les dossiers
          </Button>
        </Box>
      ) : (
        <Box
          sx={{
            mt: 2,
            maxHeight: '70vh',
            overflowY: 'auto',
            scrollBehavior: 'smooth',
            paddingRight: '8px',
            scrollbarWidth: 'thin',
            scrollbarColor: `${colors.primary} #f1f1f1`,
            '&::-webkit-scrollbar': {
              width: '10px',
            },
            '&::-webkit-scrollbar-track': {
              background: '#f1f1f1',
              borderRadius: '5px',
              boxShadow: 'inset 0 0 5px rgba(0, 0, 0, 0.1)',
            },
            '&::-webkit-scrollbar-thumb': {
              background: colors.primary,
              borderRadius: '5px',
              border: '2px solid #f1f1f1',
            },
            '&::-webkit-scrollbar-thumb:hover': {
              background: colors.secondary,
            },
          }}
          ref={dossiersContainerRef}
        >
          {dossiers.map((dossier, index) => {
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
                    mb: 3,
                    borderRadius: 4,
                    boxShadow: '0 6px 24px rgba(0, 0, 0, 0.08)',
                    bgcolor: colors.cardBackground,
                    transition: 'all 0.3s ease',
                    border: '1px solid rgba(0, 0, 0, 0.05)',
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ bgcolor: colors.primary, width: 48, height: 48, fontSize: '1.2rem' }}>
                        {dossier.patientPrenom?.charAt(0) || 'P'}
                      </Avatar>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 600, color: colors.text }}>
                          {dossier.patientNom} {dossier.patientPrenom}
                        </Typography>
                        <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                          ID Patient: {dossier.idPatient}
                        </Typography>
                      </Box>
                      <Chip
                        label={dossier.etat}
                        size="small"
                        sx={{
                          bgcolor: dossier.etat === 'en cours' ? colors.warning : colors.success,
                          color: 'white',
                          fontWeight: 500,
                          borderRadius: 1,
                        }}
                      />
                    </Box>
                    <IconButton onClick={() => handleToggleExpand(dossier)}>
                      {isExpanded ? <ExpandLessIcon sx={{ color: colors.primary }} /> : <ExpandMoreIcon sx={{ color: colors.primary }} />}
                    </IconButton>
                  </Box>
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        variants={expandVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                      >
                        <Divider sx={{ my: 2, bgcolor: colors.divider }} />
                        <Box sx={{ mt: 2 }}>
                          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 0.5 }}>
                                <strong>Date :</strong> {formatDate(dossier.dateCreation)}
                              </Typography>
                              <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 0.5 }}>
                                <strong>Email :</strong> {dossier.email || 'N/A'}
                              </Typography>
                              <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 0.5 }}>
                                <strong>Téléphone :</strong> {dossier.telephone || 'N/A'}
                              </Typography>
                            </Box>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 0.5 }}>
                                <strong>Diagnostic :</strong> {dossier.diagnostic || 'N/A'}
                              </Typography>
                              <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 0.5 }}>
                                <strong>Traitement :</strong> {dossier.traitement || 'N/A'}
                              </Typography>
                              <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 0.5 }}>
                                <strong>Médecin :</strong> {dossier.medecinNom || 'N/A'}
                              </Typography>
                            </Box>
                          </Box>
                          <Divider sx={{ my: 2, bgcolor: colors.divider }} />
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="subtitle1" sx={{ color: colors.text, fontWeight: 600 }}>
                              Consultations
                            </Typography>
                            {dossier.consultations && dossier.consultations.length > 0 ? (
                              dossier.consultations.map((consultation, index) => (
                                <Paper
                                  key={consultation.idConsultation}
                                  sx={{
                                    p: 2,
                                    mb: 2,
                                    borderRadius: 3,
                                    bgcolor: 'white',
                                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                                    transition: 'background-color 0.3s',
                                    '&:hover': { bgcolor: '#f5faff' },
                                  }}
                                >
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography variant="body2" sx={{ color: colors.text, fontWeight: 500, mb: 1 }}>
                                      Consultation {index + 1} - {formatDate(consultation.dateConsultation)}
                                    </Typography>
                                    <Tooltip title="Visualiser">
                                      <IconButton
                                        onClick={() => handleOpenConsultationDetailsModal(consultation)}
                                        sx={{ color: colors.primary, '&:hover': { color: colors.secondary } }}
                                      >
                                        <NoteIcon fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                  </Box>
                                  <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 1 }}>
                                    Notes: {consultation.notes || 'Aucune note'}
                                  </Typography>
                                  <Divider sx={{ my: 1, bgcolor: colors.divider }} />
                                  <Typography variant="body2" sx={{ color: colors.text, fontWeight: 500, mb: 1 }}>
                                    Fichiers associés :
                                  </Typography>
                                  {consultation.images && consultation.images.length > 0 ? (
                                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 1 }}>
                                      {consultation.images.map((fichier) => {
                                        const isDicom =
                                          fichier.format?.toLowerCase().includes('dicom') ||
                                          fichier.nomFichier.toLowerCase().endsWith('.dcm');
                                        const isImage =
                                          fichier.format?.toLowerCase().includes('image') ||
                                          fichier.nomFichier.toLowerCase().match(/\.(jpg|jpeg|png)$/);
                                        const isPdf = fichier.nomFichier.toLowerCase().endsWith('.pdf');
                                        const IconComponent = isDicom ? MedicalServicesIcon : isImage ? PhotoIcon : DescriptionIcon;

                                        return (
                                          <Paper
                                            key={fichier.idImage}
                                            sx={{
                                              p: 1,
                                              borderRadius: 2,
                                              bgcolor: 'white',
                                              boxShadow: '0 1px 4px rgba(0, 0, 0, 0.05)',
                                              display: 'flex',
                                              alignItems: 'center',
                                              gap: 1,
                                            }}
                                          >
                                            <IconComponent sx={{ color: colors.primary }} />
                                            <Box sx={{ flex: 1, overflow: 'hidden' }}>
                                              <Typography
                                                variant="body2"
                                                sx={{
                                                  color: colors.text,
                                                  fontWeight: 500,
                                                  whiteSpace: 'nowrap',
                                                  overflow: 'hidden',
                                                  textOverflow: 'ellipsis',
                                                }}
                                              >
                                                {fichier.nomFichier}
                                              </Typography>
                                              <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                                                ID: {fichier.idImage}
                                              </Typography>
                                            </Box>
                                            <Tooltip title="Visualiser">
                                              <IconButton
                                                onClick={() => handleOpenFileModal(fichier)}
                                                sx={{ color: colors.primary, '&:hover': { color: colors.secondary } }}
                                              >
                                                <VisibilityIcon fontSize="small" />
                                              </IconButton>
                                            </Tooltip>
                                          </Paper>
                                        );
                                      })}
                                    </Box>
                                  ) : (
                                    <Typography variant="body2" color={colors.textSecondary}>
                                      Aucun fichier associé à cette consultation.
                                    </Typography>
                                  )}
                                </Paper>
                              ))
                            ) : (
                              <Typography variant="body2" color={colors.textSecondary}>
                                Aucune consultation enregistrée.
                              </Typography>
                            )}
                          </Box>
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

      <ConsultationDetailsModal
        open={openConsultationDetailsModal}
        onClose={() => setOpenConsultationDetailsModal(false)}
        consultation={selectedConsultation}
      />
      <FileViewerModal
        open={openFileModal}
        onClose={() => setOpenFileModal(false)}
        selectedFile={selectedFile}
      />
    </Box>
  );
};

export default PatientConsulterDossier;