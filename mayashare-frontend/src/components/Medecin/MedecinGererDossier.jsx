/* eslint-disable prettier/prettier */
'use client';

import { useState, useEffect, useRef } from 'react';
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
  Paper,
  Divider,
  Avatar,
  Tooltip,
  useMediaQuery,
  useTheme,
  FormControl,
  InputLabel,
  Grid,
  Badge,
  Skeleton,
  Alert,
  Fade,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import ShareIcon from '@mui/icons-material/Share';
import RefreshIcon from '@mui/icons-material/Refresh';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import DescriptionIcon from '@mui/icons-material/Description';
import PhotoIcon from '@mui/icons-material/Photo';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import NoteIcon from '@mui/icons-material/Note';
import PersonIcon from '@mui/icons-material/Person';
import FolderIcon from '@mui/icons-material/Folder';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import MedicationIcon from '@mui/icons-material/Medication';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import CloseIcon from '@mui/icons-material/Close';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import {
  getDossiers,
  createDossier,
  updateDossier,
  uploadImage,
  getUsers,
  shareDossier,
  deleteImage,
  getImagesByDossier,
  createConsultation,
  getConsultationsByDossier,
  updateConsultation,
} from '../../services/api';
import DicomViewer from './DicomViewer';

// Palette de couleurs modernisée
const colors = {
  primary: '#0077B6',
  primaryLight: '#0096C7',
  secondary: '#00B4D8',
  secondaryLight: '#48CAE4',
  background: '#F8F9FA',
  cardBackground: 'white',
  cardBackgroundHover: '#F9FAFB',
  text: '#1A202C',
  textSecondary: '#4A5568',
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',
  divider: 'rgba(0, 0, 0, 0.08)',
  shadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
  shadowHover: '0 8px 30px rgba(0, 0, 0, 0.12)',
  hover: 'rgba(0, 119, 182, 0.05)',
};

// Constantes
const API_URL = 'http://localhost:5000';
const ORTHANC_URL = 'http://localhost:8042';
const DEFAULT_SHARE_DURATION = 1440;

// Styles des modales
const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: { xs: '90%', sm: 480 },
  bgcolor: 'white',
  boxShadow: colors.shadowHover,
  p: 4,
  borderRadius: 3,
  outline: 'none',
  maxHeight: '90vh',
  overflow: 'auto',
};

const fileModalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: { xs: '90%', sm: '80%' },
  maxWidth: 960,
  maxHeight: '85%',
  bgcolor: 'white',
  boxShadow: colors.shadowHover,
  p: 4,
  borderRadius: 3,
  overflow: 'auto',
  outline: 'none',
};

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.5,
      when: 'beforeChildren',
      staggerChildren: 0.1,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.5,
      ease: [0.25, 0.1, 0.25, 1.0],
    },
  }),
  hover: {
    scale: 1.02,
    boxShadow: colors.shadowHover,
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

const buttonVariants = {
  hover: {
    scale: 1.05,
    transition: { duration: 0.2 },
  },
  tap: {
    scale: 0.98,
    transition: { duration: 0.1 },
  },
};

// Composant FileViewerModal
const FileViewerModal = ({ open, onClose, selectedFile }) => {
  const [imageError, setImageError] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

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
    selectedFile.format?.toLowerCase().includes('dicom') ||
    selectedFile.nomFichier?.toLowerCase().endsWith('.dcm');

  let dicomWebUrl = null;
  if (isDicom) {
    let metadonnees;
    try {
      metadonnees = JSON.parse(selectedFile.metadonnees || '{}');
    } catch (e) {
      console.error('Erreur parsing métadonnées:', e);
      toast.error('Métadonnées invalides.');
      setImageError(true);
      return null;
    }

    if (!metadonnees.orthancId) {
      toast.error('ID Orthanc manquant.');
      setImageError(true);
      return null;
    }

    dicomWebUrl = selectedFile.dicomWebUrl
      ? selectedFile.dicomWebUrl.replace(
          'wadouri:http://localhost:8042/wado',
          'wadouri:http://localhost:5000/wado'
        )
      : `wadouri:http://localhost:5000/wado?requestType=WADO&instanceID=${metadonnees.orthancId}`;
    console.log('URL DICOM générée:', dicomWebUrl);
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      closeAfterTransition
      sx={{ backdropFilter: 'blur(5px)' }}
    >
      <Fade in={open}>
        <Box sx={fileModalStyle}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 2,
            }}
          >
            <Typography
              variant='h6'
              sx={{ fontWeight: 600, color: colors.text }}
            >
              {isDicom ? 'Visualisation DICOM' : 'Visualisation du fichier'} :{' '}
              {selectedFile.nomFichier}
            </Typography>
            <IconButton
              onClick={onClose}
              size='small'
              sx={{ color: colors.text }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
          <Divider sx={{ my: 2, bgcolor: colors.divider }} />

          {isDicom ? (
            imageError ? (
              <Alert severity='error' sx={{ borderRadius: 2 }}>
                Impossible de charger l'image DICOM.
              </Alert>
            ) : (
              <Box
                sx={{
                  height: isMobile ? '50vh' : '65vh',
                  width: '100%',
                  borderRadius: 2,
                  overflow: 'hidden',
                }}
              >
                <DicomViewer dicomWebUrl={dicomWebUrl} />
              </Box>
            )
          ) : selectedFile.format?.toLowerCase().includes('image') ? (
            imageError ? (
              <Alert severity='error' sx={{ borderRadius: 2 }}>
                Impossible de charger l'image.
              </Alert>
            ) : (
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                <img
                  src={`${API_URL}${selectedFile.url}`}
                  alt={selectedFile.nomFichier}
                  style={{
                    maxWidth: '100%',
                    maxHeight: isMobile ? '50vh' : '65vh',
                    borderRadius: 12,
                    boxShadow: colors.shadow,
                  }}
                  onError={() => setImageError(true)}
                />
              </Box>
            )
          ) : selectedFile.nomFichier?.toLowerCase().endsWith('.pdf') ? (
            <iframe
              src={`${API_URL}${selectedFile.url}`}
              title={selectedFile.nomFichier}
              style={{
                width: '100%',
                height: isMobile ? '50vh' : '65vh',
                border: 'none',
                borderRadius: 12,
                boxShadow: colors.shadow,
              }}
            />
          ) : (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                p: 3,
                bgcolor: colors.background,
                borderRadius: 2,
              }}
            >
              <DescriptionIcon sx={{ color: colors.primary, fontSize: 40 }} />
              <Box>
                <Typography
                  variant='body1'
                  sx={{ fontWeight: 500, color: colors.text }}
                >
                  {selectedFile.nomFichier}
                </Typography>
                <Typography variant='body2' color={colors.textSecondary}>
                  Téléchargez le fichier :{' '}
                  <a
                    href={`${API_URL}${selectedFile.url}`}
                    download
                    style={{
                      color: colors.primary,
                      textDecoration: 'none',
                      fontWeight: 500,
                    }}
                  >
                    Cliquer pour télécharger
                  </a>
                </Typography>
              </Box>
            </Box>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
            <motion.div
              whileHover='hover'
              whileTap='tap'
              variants={buttonVariants}
            >
              <Button
                variant='contained'
                color='primary'
                onClick={onClose}
                sx={{
                  bgcolor: colors.primary,
                  '&:hover': { bgcolor: colors.primaryLight },
                  borderRadius: 2,
                  textTransform: 'none',
                  py: 1,
                  px: 3,
                  fontWeight: 500,
                  boxShadow: 'none',
                }}
              >
                Fermer
              </Button>
            </motion.div>
          </Box>
        </Box>
      </Fade>
    </Modal>
  );
};

// Sous-modale pour les détails de la consultation
const ConsultationDetailsModal = ({
  open,
  onClose,
  consultation,
  dossier,
  fetchDossiers,
  isCreationMode = false,
  scrollToConsultation,
  handleOpenFileViewer,
  user,
}) => {
  const [notes, setNotes] = useState(consultation?.notes || '');
  const [imageFiles, setImageFiles] = useState(
    consultation?.images?.map((img) => ({ ...img, isExisting: true })) || []
  );
  const [newFiles, setNewFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [ordonnance, setOrdonnance] = useState(consultation?.ordonnance || '');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
  setNotes(consultation?.notes || '');
  setImageFiles(consultation?.images?.map((img) => ({ ...img, isExisting: true })) || []);
  setNewFiles([]);
  setOrdonnance(consultation?.ordonnance || '');
}, [consultation]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isCreationMode) {
        const response = await createConsultation({
          idDossier: dossier.idDossier,
          notes: notes || null,
        });
        const newConsultationId = response.data.id;

        if (newFiles.length > 0) {
          for (const file of newFiles) {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('idDossier', dossier.idDossier);
            formData.append('idConsultation', newConsultationId);
            await uploadImage(formData);
          }
        }

        toast.success('Consultation créée avec succès.');
      } else {
        if (notes !== consultation.notes) {
          await updateConsultation(consultation.idConsultation, { notes });
          toast.success('Notes mises à jour avec succès.');
        }

        if (newFiles.length > 0) {
          for (const file of newFiles) {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('idDossier', dossier.idDossier);
            formData.append('idConsultation', consultation.idConsultation);
            await uploadImage(formData);
          }
          toast.success('Fichiers ajoutés avec succès.');
        }
      }

      await fetchDossiers();
      onClose();
      if (!isCreationMode && scrollToConsultation) {
        scrollToConsultation(consultation.idConsultation);
      }
    } catch (error) {
      console.error('Erreur lors de la création/mise à jour de la consultation:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Erreur inconnue';
      toast.error(`Erreur : ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddFiles = (e) => {
    const files = Array.from(e.target.files);
    setNewFiles((prev) => [...prev, ...files]);
    setImageFiles((prev) => [...prev, ...files.map((f) => ({ file: f, isExisting: false }))]);
  };

  const handleRemoveFile = (index, isExisting) => {
    if (isExisting) {
      const fileToRemove = imageFiles[index];
      handleDeleteExistingFile(fileToRemove.idImage);
    } else {
      setNewFiles((prev) => prev.filter((_, i) => i !== index));
      setImageFiles((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const handleDownloadOrdonnance = () => {
  if (!ordonnance) {
    toast.error('Aucune ordonnance à télécharger.');
    return;
  }

  try {
    import('jspdf').then((jsPDF) => {
      const doc = new jsPDF.default();
      doc.setFontSize(12);
      doc.text('Ordonnance Médicale', 10, 10);
      doc.text(`Médecin : ${user?.prenom || 'Non spécifié'} ${user?.nom || 'Non spécifié'}`, 10, 20);
      doc.text(`Date : ${new Date().toLocaleDateString('fr-FR')}`, 10, 30);
      doc.text('Contenu :', 10, 40);
      doc.setFontSize(10);
      const lines = doc.splitTextToSize(ordonnance, 180); // Ajuste la largeur à 180mm
      doc.text(lines, 10, 50);
      doc.save(`ordonnance_${consultation?.idConsultation || 'new'}_${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success('Ordonnance téléchargée avec succès.');
    });
  } catch (error) {
    toast.error('Erreur lors de la génération du PDF.');
  }
};

  const handleDeleteExistingFile = async (imageId) => {
    try {
      await deleteImage(imageId);
      setImageFiles((prev) => prev.filter((f) => f.idImage !== imageId));
      toast.success('Fichier supprimé avec succès.');
      await fetchDossiers();
    } catch (error) {
      toast.error('Erreur suppression fichier : ' + (error.response?.data?.message || 'Erreur inconnue'));
    }
  };

  return (
    <Modal open={open} onClose={onClose} closeAfterTransition sx={{ backdropFilter: 'blur(5px)' }}>
      <Fade in={open}>
        <Box sx={modalStyle}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant='h6' sx={{ fontWeight: 600, color: colors.text }}>
              {isCreationMode ? 'Créer une consultation complète' : `Détails de la consultation`}
            </Typography>
            <IconButton onClick={onClose} size='small' sx={{ color: colors.text }}>
              <CloseIcon />
            </IconButton>
          </Box>
          <Divider sx={{ my: 2, bgcolor: colors.divider }} />

          <form onSubmit={handleSubmit}>
            <Box sx={{ mb: 3 }}>
              <Typography variant='body2' gutterBottom sx={{ fontWeight: 500, color: colors.textSecondary }}>
                Notes
              </Typography>
              <TextField
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                fullWidth
                multiline
                rows={4}
                variant='outlined'
                placeholder='Saisissez vos notes médicales ici...'
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover fieldset': { borderColor: colors.secondary },
                    '&.Mui-focused fieldset': { borderColor: colors.primary },
                  },
                }}
              />
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography variant='body2' gutterBottom sx={{ fontWeight: 500, color: colors.textSecondary }}>
                Ordonnance (facultatif)
              </Typography>
              <TextField
                value={ordonnance}
                onChange={(e) => setOrdonnance(e.target.value)}
                fullWidth
                multiline
                rows={3}
                variant='outlined'
                placeholder='Saisissez l ordonnance (ex. : Prendre 1 comprimé par jour)...'
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover fieldset': { borderColor: colors.secondary },
                    '&.Mui-focused fieldset': { borderColor: colors.primary },
                  },
                }}
              />
              {ordonnance && (
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                  <motion.div whileHover='hover' whileTap='tap' variants={buttonVariants}>
                    <Button
                      variant='outlined'
                      color='primary'
                      startIcon={<DownloadIcon />}
                      onClick={handleDownloadOrdonnance}
                      sx={{
                        borderRadius: 2,
                        textTransform: 'none',
                        fontWeight: 500,
                      }}
                    >
                      Télécharger l'ordonnance
                    </Button>
                  </motion.div>
                </Box>
              )}
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography variant='body2' gutterBottom sx={{ fontWeight: 500, color: colors.textSecondary }}>
                Fichiers associés ({imageFiles.length})
              </Typography>
              {imageFiles.length > 0 && (
                <Paper variant='outlined' sx={{ p: 2, borderRadius: 2, borderColor: colors.divider, mb: 2, maxHeight: '200px', overflow: 'auto' }}>
                  {imageFiles.map((file, index) => (
                    <Box
                      key={index}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        p: 1,
                        mb: 1,
                        borderRadius: 1,
                        bgcolor: colors.background,
                        '&:last-child': { mb: 0 },
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {file.format?.toLowerCase().includes('dicom') || file.nomFichier?.toLowerCase().endsWith('.dcm') ? (
                          <MedicalServicesIcon fontSize='small' sx={{ color: colors.primary }} />
                        ) : file.format?.toLowerCase().includes('image') || (file.file && file.file.type.includes('image')) ? (
                          <PhotoIcon fontSize='small' sx={{ color: colors.primary }} />
                        ) : (
                          <DescriptionIcon fontSize='small' sx={{ color: colors.primary }} />
                        )}
                        <Typography
                          variant='body2'
                          sx={{
                            color: colors.text,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {file.nomFichier || file.file.name}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title='Visualiser'>
                          <IconButton
                            onClick={() => handleOpenFileViewer(file)}
                            size='small'
                            sx={{ color: colors.primary }}
                            disabled={!file.idImage && !file.isExisting}
                          >
                            <VisibilityIcon fontSize='small' />
                          </IconButton>
                        </Tooltip>
                        <IconButton
                          onClick={() => handleRemoveFile(index, file.isExisting)}
                          size='small'
                          sx={{ color: colors.error }}
                        >
                          <DeleteIcon fontSize='small' />
                        </IconButton>
                      </Box>
                    </Box>
                  ))}
                </Paper>
              )}
              <Box
                sx={{
                  border: '2px dashed',
                  borderColor: colors.divider,
                  borderRadius: 2,
                  p: 3,
                  textAlign: 'center',
                  mb: 2,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    borderColor: colors.primary,
                    bgcolor: 'rgba(0, 119, 182, 0.03)',
                  },
                }}
                component='label'
              >
                <input
                  type='file'
                  onChange={handleAddFiles}
                  hidden
                  accept='.dcm,.pdf,.jpg,.jpeg,.png,.docx,.txt'
                  multiple
                />
                <PhotoIcon sx={{ fontSize: 40, color: colors.primary, mb: 1 }} />
                <Typography variant='body1' sx={{ fontWeight: 500, color: colors.text }}>
                  Cliquez pour sélectionner des fichiers
                </Typography>
                <Typography variant='body2' color={colors.textSecondary}>
                  ou glissez-déposez vos fichiers ici
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
              <Button
                variant='outlined'
                color='primary'
                onClick={onClose}
                fullWidth
                sx={{
                  borderColor: colors.primary,
                  color: colors.primary,
                  '&:hover': {
                    borderColor: colors.primaryLight,
                    color: colors.primaryLight,
                  },
                  borderRadius: 2,
                  textTransform: 'none',
                  py: 1.2,
                  fontWeight: 500,
                }}
              >
                Annuler
              </Button>

              <motion.div whileHover='hover' whileTap='tap' variants={buttonVariants} style={{ width: '100%' }}>
                <Button
                  type='submit'
                  variant='contained'
                  color='primary'
                  fullWidth
                  disabled={isLoading}
                  sx={{
                    bgcolor: colors.primary,
                    '&:hover': { bgcolor: colors.primaryLight },
                    borderRadius: 2,
                    textTransform: 'none',
                    py: 1.2,
                    fontWeight: 500,
                    boxShadow: 'none',
                  }}
                >
                  {isLoading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : isCreationMode ? 'Créer la consultation' : 'Mettre à jour'}
                </Button>
              </motion.div>
            </Box>
          </form>
        </Box>
      </Fade>
    </Modal>
  );
};

// Composant principal
const MedecinGererDossier = ({ dossiersLoaded }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));

  const [dossiers, setDossiers] = useState([]);
  const [patients, setPatients] = useState([]);
  const [infirmiers, setInfirmiers] = useState([]);
  const [medecins, setMedecins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openConsultationModal, setOpenConsultationModal] = useState(false);
  const [openShareModal, setOpenShareModal] = useState(false);
  const [openFileViewer, setOpenFileViewer] = useState(false);
  const [openConsultationDetailsModal, setOpenConsultationDetailsModal] =
    useState(false);
  const [selectedDossier, setSelectedDossier] = useState(null);
  const [selectedConsultation, setSelectedConsultation] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [expandedDossier, setExpandedDossier] = useState(null);
  const [newDossier, setNewDossier] = useState({
    idPatient: '',
    diagnostic: '',
    traitement: '',
    etat: 'en cours',
    groupeSanguin: '',
    antecedentsMedicaux: '',
    allergies: '',
    notesComplementaires: '',
  });
  const [editDossier, setEditDossier] = useState({
    diagnostic: '',
    traitement: '',
    etat: '',
    groupeSanguin: '',
    antecedentsMedicaux: '',
    allergies: '',
    notesComplementaires: '',
  });
  const [shareType, setShareType] = useState('direct');
  const [selectedUser, setSelectedUser] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [duree, setDuree] = useState(DEFAULT_SHARE_DURATION.toString());
  const [shareLoading, setShareLoading] = useState(false);
  const [lienPartage, setLienPartage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEtat, setFilterEtat] = useState('tous');
  const [user, setUser] = useState(''); // Remplacez par votre logique d'authentification


  // Références pour le conteneur de défilement et les consultations
  const dossiersContainerRef = useRef(null);
  const consultationRefs = useRef({});

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
        toast.error(
          'Erreur récupération utilisateurs : ' +
            (error.response?.data?.message || 'Erreur inconnue')
        );
      }
    };
    fetchUsers();
    fetchDossiers();
  }, []);

  const fetchDossiers = async () => {
    setLoading(true);
    setRefreshing(true);
    try {
      const response = await getDossiers();
      const dossiersWithDetails = await Promise.all(
        response.data.dossiers.map(async (dossier) => {
          const imagesResponse = await getImagesByDossier(dossier.idDossier);
          const consultationsResponse = await getConsultationsByDossier(
            dossier.idDossier
          );
          const images = imagesResponse.data.images || [];
          const consultations = consultationsResponse.data.consultations || [];

          const consultationsWithImages = await Promise.all(
            consultations.map(async (consultation) => {
              const consultationImages = images.filter(
                (image) => image.idConsultation === consultation.idConsultation
              );
              return {
                ...consultation,
                images: consultationImages,
              };
            })
          );

          return {
            ...dossier,
            consultations: consultationsWithImages,
          };
        })
      );
      setDossiers(dossiersWithDetails);
    } catch (error) {
      toast.error(
        'Erreur récupération dossiers : ' +
          (error.response?.data?.message || 'Erreur inconnue')
      );
    } finally {
      setLoading(false);
      setTimeout(() => setRefreshing(false), 500);
    }
  };

  // Faire défiler automatiquement vers le bas après la création d'un dossier
  const handleCreateDossier = async (e) => {
    e.preventDefault();
    // Validation côté client pour groupeSanguin
    const validBloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    if (
      newDossier.groupeSanguin &&
      !validBloodGroups.includes(newDossier.groupeSanguin)
    ) {
      toast.error('Veuillez sélectionner un groupe sanguin valide.');
      return;
    }
    try {
      await createDossier(newDossier);
      toast.success('Dossier créé avec succès.');
      setOpenCreateModal(false);
      await fetchDossiers();
      // Défilement automatique vers le bas
      if (dossiersContainerRef.current) {
        dossiersContainerRef.current.scrollTo({
          top: dossiersContainerRef.current.scrollHeight,
          behavior: 'smooth',
        });
      }
    } catch (error) {
      toast.error(
        'Erreur création dossier : ' +
          (error.response?.data?.message || 'Erreur inconnue')
      );
    }
  };

  // Faire défiler vers une consultation spécifique
  const scrollToConsultation = (consultationId) => {
    const consultationElement = consultationRefs.current[consultationId];
    if (consultationElement && dossiersContainerRef.current) {
      consultationElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  };

  const handleRefresh = () => {
    fetchDossiers();
  };

  const handleOpenCreateModal = () => {
    setNewDossier({
      idPatient: '',
      diagnostic: '',
      traitement: '',
      etat: 'en cours',
      groupeSanguin: '',
      antecedentsMedicaux: '',
      allergies: '',
      notesComplementaires: '',
    });
    setOpenCreateModal(true);
  };

  const handleOpenEditModal = (dossier) => {
    setSelectedDossier(dossier);
    setEditDossier({
      diagnostic: dossier.diagnostic,
      traitement: dossier.traitement,
      etat: dossier.etat,
      groupeSanguin: dossier.groupeSanguin || '',
      antecedentsMedicaux: dossier.antecedentsMedicaux || '',
      allergies: dossier.allergies || '',
      notesComplementaires: dossier.notesComplementaires || '',
    });
    setOpenEditModal(true);
  };

  const handleOpenConsultationModal = (dossier) => {
    setSelectedDossier(dossier);
    setOpenConsultationModal(true);
  };

  const handleOpenShareModal = (dossier) => {
    setSelectedDossier(dossier);
    setShareType('direct');
    setSelectedUser('');
    setMotDePasse('');
    setDuree(DEFAULT_SHARE_DURATION.toString());
    setLienPartage('');
    setOpenShareModal(true);
  };

  const handleOpenFileViewer = (fichier) => {
    setSelectedFile(fichier);
    setOpenFileViewer(true);
  };

  const handleOpenConsultationDetailsModal = (consultation, dossier) => {
    setSelectedConsultation(consultation);
    setSelectedDossier(dossier);
    setOpenConsultationDetailsModal(true);
  };

  const handleCreateEmptyConsultation = async () => {
    try {
      await createConsultation({ idDossier: selectedDossier.idDossier });
      toast.success('Consultation vide créée avec succès.');
      setOpenConsultationModal(false);
      await fetchDossiers();
      // Défilement vers le bas après création
      if (dossiersContainerRef.current) {
        dossiersContainerRef.current.scrollTo({
          top: dossiersContainerRef.current.scrollHeight,
          behavior: 'smooth',
        });
      }
    } catch (error) {
      toast.error(
        'Erreur création consultation : ' +
          (error.response?.data?.message || 'Erreur inconnue')
      );
    }
  };

  const handleToggleExpand = (dossier) => {
    setExpandedDossier(
      expandedDossier?.idDossier === dossier.idDossier ? null : dossier
    );
  };

  const handleUpdateDossier = async (e) => {
    e.preventDefault();
    // Validation côté client pour groupeSanguin
    const validBloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    if (
      editDossier.groupeSanguin &&
      !validBloodGroups.includes(editDossier.groupeSanguin)
    ) {
      toast.error('Veuillez sélectionner un groupe sanguin valide.');
      return;
    }
    try {
      await updateDossier(selectedDossier.idDossier, editDossier);
      toast.success('Dossier mis à jour avec succès.');
      setOpenEditModal(false);
      fetchDossiers();
    } catch (error) {
      toast.error(
        'Erreur mise à jour dossier : ' +
          (error.response?.data?.message || 'Erreur inconnue')
      );
    }
  };

  const handleDeleteImage = async (imageId) => {
    try {
      await deleteImage(imageId);
      toast.success('Fichier supprimé avec succès.');
      fetchDossiers();
    } catch (error) {
      toast.error(
        'Erreur suppression fichier : ' +
          (error.response?.data?.message || 'Erreur inconnue')
      );
    }
  };

  const handleShare = async (e) => {
    e.preventDefault();
    setShareLoading(true);
    setLienPartage('');

    try {
      const shareData = { idDossier: selectedDossier.idDossier };

      if (shareType === 'direct') {
        if (!selectedUser) {
          toast.error('Veuillez sélectionner un utilisateur.');
          setShareLoading(false);
          return;
        }
        shareData.idUtilisateur = Number.parseInt(selectedUser);
      } else {
        if (!motDePasse || !duree) {
          toast.error('Veuillez entrer un mot de passe et une durée.');
          setShareLoading(false);
          return;
        }
        shareData.motDePasse = motDePasse;
        shareData.duree = Number.parseInt(duree);
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

  const formatDate = (dateString) => {
    if (!dateString) return 'Non spécifié';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  // Filtrage des dossiers
  const filteredDossiers = dossiers.filter((dossier) => {
    const patient =
      patients.find((p) => p.idUtilisateur === dossier.idPatient) || {};
    const patientName =
      `${patient.nom || ''} ${patient.prenom || ''}`.toLowerCase();
    const searchMatch =
      searchTerm === '' ||
      patientName.includes(searchTerm.toLowerCase()) ||
      dossier.diagnostic?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dossier.idDossier?.toString().includes(searchTerm);

    const stateMatch = filterEtat === 'tous' || dossier.etat === filterEtat;

    return searchMatch && stateMatch;
  });

  // Rendu des squelettes de chargement
  const renderSkeletons = () => {
    return Array.from(new Array(3)).map((_, index) => (
      <Paper
        key={`skeleton-${index}`}
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 3,
          boxShadow: colors.shadow,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Skeleton variant='circular' width={48} height={48} />
          <Box sx={{ flex: 1 }}>
            <Skeleton variant='text' width='60%' height={28} />
            <Skeleton variant='text' width='40%' height={20} />
          </Box>
          <Skeleton
            variant='rectangular'
            width={100}
            height={32}
            sx={{ borderRadius: 1 }}
          />
        </Box>
      </Paper>
    ));
  };

  if (loading && !refreshing) {
    return (
      <Box
        sx={{ p: { xs: 2, md: 4 }, bgcolor: colors.background, height: '100%' }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, gap: 2 }}>
          <Skeleton variant='circular' width={56} height={56} />
          <Box sx={{ flex: 1 }}>
            <Skeleton variant='text' width='40%' height={40} />
            <Skeleton variant='text' width='20%' height={24} />
          </Box>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
          <Skeleton
            variant='rectangular'
            width={200}
            height={40}
            sx={{ borderRadius: 2 }}
          />
          <Skeleton
            variant='rectangular'
            width={150}
            height={40}
            sx={{ borderRadius: 2 }}
          />
        </Box>

        {renderSkeletons()}
      </Box>
    );
  }

  return (
    <Box
      sx={{
        p: { xs: 2, md: 4 },
        bgcolor: colors.background,
        height: '100%',
        overflow: 'auto',
      }}
    >
      <motion.div
        variants={containerVariants}
        initial='hidden'
        animate='visible'
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, gap: 2 }}>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              type: 'spring',
              stiffness: 260,
              damping: 20,
              duration: 0.5,
            }}
          >
            <Badge
              overlap='circular'
              badgeContent={filteredDossiers.length}
              color='primary'
              sx={{
                '& .MuiBadge-badge': {
                  fontWeight: 'bold',
                  fontSize: '0.8rem',
                },
              }}
            >
              <Avatar sx={{ bgcolor: colors.primary, width: 56, height: 56 }}>
                <FolderIcon fontSize='large' />
              </Avatar>
            </Badge>
          </motion.div>
          <Box>
            <Typography
              variant='h4'
              component='h1'
              sx={{
                fontWeight: 700,
                color: colors.text,
                fontSize: { xs: '1.5rem', sm: '2rem', md: '2.25rem' },
              }}
            >
              Gestion des dossiers patients
            </Typography>
            <Typography variant='body1' color='text.secondary' sx={{ mt: 0.5 }}>
              {filteredDossiers.length} dossiers{' '}
              {filterEtat !== 'tous' ? `(${filterEtat})` : 'au total'}
            </Typography>
          </Box>
        </Box>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              placeholder='Rechercher un patient, un diagnostic...'
              variant='outlined'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <SearchIcon sx={{ color: colors.textSecondary, mr: 1 }} />
                ),
                sx: { borderRadius: 2 },
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': { borderColor: colors.secondary },
                  '&.Mui-focused fieldset': { borderColor: colors.primary },
                },
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth variant='outlined'>
              <InputLabel id='filter-etat-label'>État du dossier</InputLabel>
              <Select
                labelId='filter-etat-label'
                value={filterEtat}
                onChange={(e) => setFilterEtat(e.target.value)}
                label='État du dossier'
                sx={{ borderRadius: 2 }}
                startAdornment={
                  <FilterListIcon sx={{ mr: 1, color: colors.textSecondary }} />
                }
              >
                <MenuItem value='tous'>Tous les états</MenuItem>
                <MenuItem value='en cours'>En cours</MenuItem>
                <MenuItem value='traité'>Traité</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <motion.div
              whileHover='hover'
              whileTap='tap'
              variants={buttonVariants}
              style={{ height: '100%' }}
            >
              <Button
                variant='outlined'
                color='primary'
                startIcon={<RefreshIcon />}
                onClick={handleRefresh}
                disabled={refreshing}
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 500,
                  height: '100%',
                  width: '100%',
                }}
              >
                {refreshing ? 'Actualisation...' : 'Actualiser'}
              </Button>
            </motion.div>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <motion.div
              whileHover='hover'
              whileTap='tap'
              variants={buttonVariants}
              style={{ height: '100%' }}
            >
              <Button
                variant='contained'
                color='primary'
                startIcon={<AddIcon />}
                onClick={handleOpenCreateModal}
                sx={{
                  bgcolor: colors.primary,
                  '&:hover': { bgcolor: colors.primaryLight },
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 500,
                  height: '100%',
                  width: '100%',
                  boxShadow: 'none',
                }}
              >
                Créer un dossier
              </Button>
            </motion.div>
          </Grid>
        </Grid>

        {filteredDossiers.length === 0 ? (
          <Paper
            sx={{
              textAlign: 'center',
              py: 6,
              px: 3,
              borderRadius: 3,
              boxShadow: colors.shadow,
              bgcolor: 'white',
            }}
          >
            <FolderIcon
              sx={{
                fontSize: 60,
                color: colors.textSecondary,
                opacity: 0.5,
                mb: 2,
              }}
            />
            <Typography
              variant='h6'
              color={colors.textSecondary}
              sx={{ mb: 2 }}
            >
              {searchTerm || filterEtat !== 'tous'
                ? 'Aucun dossier ne correspond à votre recherche.'
                : 'Aucun dossier trouvé.'}
            </Typography>
            <motion.div
              whileHover='hover'
              whileTap='tap'
              variants={buttonVariants}
            >
              <Button
                variant='contained'
                color='primary'
                startIcon={
                  searchTerm || filterEtat !== 'tous' ? (
                    <FilterListIcon />
                  ) : (
                    <AddIcon />
                  )
                }
                onClick={
                  searchTerm || filterEtat !== 'tous'
                    ? () => {
                        setSearchTerm('');
                        setFilterEtat('tous');
                      }
                    : handleOpenCreateModal
                }
                sx={{
                  bgcolor: colors.primary,
                  '&:hover': { bgcolor: colors.primaryLight },
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 500,
                  boxShadow: 'none',
                }}
              >
                {searchTerm || filterEtat !== 'tous'
                  ? 'Effacer les filtres'
                  : 'Créer votre premier dossier'}
              </Button>
            </motion.div>
          </Paper>
        ) : (
          <Box
            sx={{
              maxHeight: '65vh',
              overflowY: 'auto',
              scrollBehavior: 'smooth',
              pr: 1,
              scrollbarWidth: 'thin',
              scrollbarColor: `${colors.primary} #f1f1f1`,
              '&::-webkit-scrollbar': {
                width: '8px',
              },
              '&::-webkit-scrollbar-track': {
                background: '#f1f1f1',
                borderRadius: '5px',
              },
              '&::-webkit-scrollbar-thumb': {
                background: colors.primary,
                borderRadius: '5px',
                border: '2px solid #f1f1f1',
              },
              '&::-webkit-scrollbar-thumb:hover': {
                background: colors.primaryLight,
              },
            }}
            ref={dossiersContainerRef}
          >
            <AnimatePresence>
              {filteredDossiers.map((dossier, index) => {
                const patient =
                  patients.find((p) => p.idUtilisateur === dossier.idPatient) ||
                  {};
                const isExpanded =
                  expandedDossier?.idDossier === dossier.idDossier;
                return (
                  <motion.div
                    key={dossier.idDossier}
                    custom={index}
                    variants={cardVariants}
                    initial='hidden'
                    animate='visible'
                    whileHover={isExpanded ? {} : 'hover'}
                    layout
                  >
                    <Paper
                      sx={{
                        p: 3,
                        mb: 3,
                        borderRadius: 3,
                        boxShadow: isExpanded
                          ? colors.shadowHover
                          : colors.shadow,
                        bgcolor: isExpanded
                          ? colors.cardBackgroundHover
                          : colors.cardBackground,
                        transition: 'all 0.3s ease',
                        border: '1px solid',
                        borderColor: isExpanded
                          ? 'rgba(0, 119, 182, 0.1)'
                          : 'transparent',
                      }}
                    >
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          cursor: 'pointer',
                        }}
                        onClick={() => handleToggleExpand(dossier)}
                      >
                        <Box
                          sx={{ display: 'flex', alignItems: 'center', gap: 2 }}
                        >
                          <Avatar
                            sx={{
                              bgcolor: colors.primary,
                              width: 48,
                              height: 48,
                              fontSize: '1.2rem',
                              fontWeight: 'bold',
                            }}
                          >
                            {patient.nom?.charAt(0) || 'P'}
                          </Avatar>
                          <Box>
                            <Typography
                              variant='h6'
                              sx={{ fontWeight: 600, color: colors.text }}
                            >
                              {patient.nom} {patient.prenom}
                            </Typography>
                            <Typography
                              variant='body2'
                              sx={{ color: colors.textSecondary }}
                            >
                              ID Patient: {dossier.idPatient} | Dossier:{' '}
                              {dossier.idDossier}
                            </Typography>
                          </Box>
                          <Chip
                            label={dossier.etat}
                            size='small'
                            color={
                              dossier.etat === 'en cours'
                                ? 'warning'
                                : 'success'
                            }
                            sx={{
                              fontWeight: 500,
                              borderRadius: 1,
                              ml: 1,
                            }}
                          />
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {isExpanded ? (
                            <ExpandLessIcon sx={{ color: colors.primary }} />
                          ) : (
                            <ExpandMoreIcon sx={{ color: colors.primary }} />
                          )}
                        </Box>
                      </Box>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            variants={expandVariants}
                            initial='hidden'
                            animate='visible'
                            exit='exit'
                          >
                            <Divider sx={{ my: 2, bgcolor: colors.divider }} />

                            <Grid container spacing={3} sx={{ mb: 3 }}>
                              <Grid item xs={12} md={6}>
                                <Box
                                  sx={{
                                    bgcolor: colors.background,
                                    p: 2,
                                    borderRadius: 2,
                                  }}
                                >
                                  <Typography
                                    variant='subtitle2'
                                    sx={{ color: colors.textSecondary, mb: 1 }}
                                  >
                                    Informations patient
                                  </Typography>
                                  <Box
                                    sx={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      mb: 1,
                                    }}
                                  >
                                    <PersonIcon
                                      sx={{
                                        color: colors.primary,
                                        mr: 1,
                                        fontSize: 20,
                                      }}
                                    />
                                    <Typography
                                      variant='body2'
                                      sx={{ color: colors.text }}
                                    >
                                      <strong>Nom complet:</strong>{' '}
                                      {patient.nom} {patient.prenom}
                                    </Typography>
                                  </Box>
                                  <Box
                                    sx={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      mb: 1,
                                    }}
                                  >
                                    <Typography
                                      variant='body2'
                                      sx={{ color: colors.text }}
                                    >
                                      <strong>Email:</strong>{' '}
                                      {patient.email || 'Non spécifié'}
                                    </Typography>
                                  </Box>
                                  <Box
                                    sx={{
                                      display: 'flex',
                                      alignItems: 'center',
                                    }}
                                  >
                                    <Typography
                                      variant='body2'
                                      sx={{ color: colors.text }}
                                    >
                                      <strong>Téléphone:</strong>{' '}
                                      {patient.telephone || 'Non spécifié'}
                                    </Typography>
                                  </Box>
                                </Box>
                              </Grid>
                              <Grid item xs={12} md={6}>
                                <Box
                                  sx={{
                                    bgcolor: colors.background,
                                    p: 2,
                                    borderRadius: 2,
                                  }}
                                >
                                  <Typography
                                    variant='subtitle2'
                                    sx={{ color: colors.textSecondary, mb: 1 }}
                                  >
                                    Informations médicales
                                  </Typography>
                                  <Box
                                    sx={{
                                      display: 'flex',
                                      alignItems: 'flex-start',
                                      mb: 1,
                                    }}
                                  >
                                    <HealthAndSafetyIcon
                                      sx={{
                                        color: colors.primary,
                                        mr: 1,
                                        fontSize: 20,
                                        mt: 0.5,
                                      }}
                                    />
                                    <Box>
                                      <Typography
                                        variant='body2'
                                        sx={{
                                          color: colors.text,
                                          fontWeight: 'bold',
                                        }}
                                      >
                                        Diagnostic:
                                      </Typography>
                                      <Typography
                                        variant='body2'
                                        sx={{ color: colors.text }}
                                      >
                                        {dossier.diagnostic || 'Non spécifié'}
                                      </Typography>
                                    </Box>
                                  </Box>
                                  <Box
                                    sx={{
                                      display: 'flex',
                                      alignItems: 'flex-start',
                                      mb: 1,
                                    }}
                                  >
                                    <MedicationIcon
                                      sx={{
                                        color: colors.primary,
                                        mr: 1,
                                        fontSize: 20,
                                        mt: 0.5,
                                      }}
                                    />
                                    <Box>
                                      <Typography
                                        variant='body2'
                                        sx={{
                                          color: colors.text,
                                          fontWeight: 'bold',
                                        }}
                                      >
                                        Traitement:
                                      </Typography>
                                      <Typography
                                        variant='body2'
                                        sx={{ color: colors.text }}
                                      >
                                        {dossier.traitement || 'Non spécifié'}
                                      </Typography>
                                    </Box>
                                  </Box>
                                  <Box
                                    sx={{
                                      display: 'flex',
                                      alignItems: 'flex-start',
                                      mb: 1,
                                    }}
                                  >
                                    <MedicalServicesIcon
                                      sx={{
                                        color: colors.primary,
                                        mr: 1,
                                        fontSize: 20,
                                        mt: 0.5,
                                      }}
                                    />
                                    <Box>
                                      <Typography
                                        variant='body2'
                                        sx={{
                                          color: colors.text,
                                          fontWeight: 'bold',
                                        }}
                                      >
                                        Groupe Sanguin:
                                      </Typography>
                                      <Typography
                                        variant='body2'
                                        sx={{ color: colors.text }}
                                      >
                                        {dossier.groupeSanguin ||
                                          'Non spécifié'}
                                      </Typography>
                                    </Box>
                                  </Box>
                                  <Box
                                    sx={{
                                      display: 'flex',
                                      alignItems: 'flex-start',
                                      mb: 1,
                                    }}
                                  >
                                    <Box>
                                      <Typography
                                        variant='body2'
                                        sx={{
                                          color: colors.text,
                                          fontWeight: 'bold',
                                        }}
                                      >
                                        Antécédents Médicaux:
                                      </Typography>
                                      <Typography
                                        variant='body2'
                                        sx={{ color: colors.text }}
                                      >
                                        {dossier.antecedentsMedicaux || 'Aucun'}
                                      </Typography>
                                    </Box>
                                  </Box>
                                  <Box
                                    sx={{
                                      display: 'flex',
                                      alignItems: 'flex-start',
                                      mb: 1,
                                    }}
                                  >
                                    <Box>
                                      <Typography
                                        variant='body2'
                                        sx={{
                                          color: colors.text,
                                          fontWeight: 'bold',
                                        }}
                                      >
                                        Allergies:
                                      </Typography>
                                      <Typography
                                        variant='body2'
                                        sx={{ color: colors.text }}
                                      >
                                        {dossier.allergies || 'Aucune'}
                                      </Typography>
                                    </Box>
                                  </Box>
                                  <Box
                                    sx={{
                                      display: 'flex',
                                      alignItems: 'flex-start',
                                    }}
                                  >
                                    <Box>
                                      <Typography
                                        variant='body2'
                                        sx={{
                                          color: colors.text,
                                          fontWeight: 'bold',
                                        }}
                                      >
                                        Notes Complémentaires:
                                      </Typography>
                                      <Typography
                                        variant='body2'
                                        sx={{ color: colors.text }}
                                      >
                                        {dossier.notesComplementaires ||
                                          'Aucune'}
                                      </Typography>
                                    </Box>
                                  </Box>
                                </Box>
                              </Grid>
                            </Grid>

                            <Box
                              sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                mb: 2,
                                flexWrap: 'wrap',
                                gap: 2,
                              }}
                            >
                              <motion.div
                                whileHover='hover'
                                whileTap='tap'
                                variants={buttonVariants}
                              >
                                <Button
                                  variant='outlined'
                                  color='primary'
                                  startIcon={<EditIcon />}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenEditModal(dossier);
                                  }}
                                  sx={{
                                    borderRadius: 2,
                                    textTransform: 'none',
                                    fontWeight: 500,
                                  }}
                                >
                                  Modifier le dossier
                                </Button>
                              </motion.div>
                              <motion.div
                                whileHover='hover'
                                whileTap='tap'
                                variants={buttonVariants}
                              >
                                <Button
                                  variant='outlined'
                                  color='primary'
                                  startIcon={<ShareIcon />}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenShareModal(dossier);
                                  }}
                                  sx={{
                                    borderRadius: 2,
                                    textTransform: 'none',
                                    fontWeight: 500,
                                  }}
                                >
                                  Partager le dossier
                                </Button>
                              </motion.div>
                            </Box>

                            <Divider sx={{ my: 2, bgcolor: colors.divider }} />

                            <Box sx={{ mb: 2 }}>
                              <Box
                                sx={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                  mb: 2,
                                }}
                              >
                                <Typography
                                  variant='h6'
                                  sx={{ color: colors.text, fontWeight: 600 }}
                                >
                                  Consultations
                                </Typography>
                                <motion.div
                                  whileHover='hover'
                                  whileTap='tap'
                                  variants={buttonVariants}
                                >
                                  <Button
                                    variant='contained'
                                    color='primary'
                                    startIcon={<AddIcon />}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleOpenConsultationModal(dossier);
                                    }}
                                    sx={{
                                      bgcolor: colors.primary,
                                      '&:hover': {
                                        bgcolor: colors.primaryLight,
                                      },
                                      borderRadius: 2,
                                      textTransform: 'none',
                                      fontWeight: 500,
                                      boxShadow: 'none',
                                    }}
                                  >
                                    Ajouter une consultation
                                  </Button>
                                </motion.div>
                              </Box>

                              {dossier.consultations &&
                              dossier.consultations.length > 0 ? (
                                <Box
                                  sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 2,
                                  }}
                                >
                                  {dossier.consultations.map(
                                    (consultation, index) => (
                                      <Paper
                                        key={consultation.idConsultation}
                                        ref={(el) =>
                                          (consultationRefs.current[
                                            consultation.idConsultation
                                          ] = el)
                                        }
                                        sx={{
                                          p: 2,
                                          borderRadius: 2,
                                          bgcolor: 'white',
                                          boxShadow:
                                            '0 2px 8px rgba(0, 0, 0, 0.05)',
                                          transition: 'background-color 0.3s',
                                          '&:hover': {
                                            bgcolor: colors.cardBackgroundHover,
                                          },
                                          border: '1px solid',
                                          borderColor: 'rgba(0, 0, 0, 0.05)',
                                        }}
                                      >
                                        <Box
                                          sx={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            mb: 1,
                                          }}
                                        >
                                          <Box
                                            sx={{
                                              display: 'flex',
                                              alignItems: 'center',
                                              gap: 1,
                                            }}
                                          >
                                            <NoteIcon
                                              sx={{ color: colors.primary }}
                                            />
                                            <Typography
                                              variant='subtitle1'
                                              sx={{
                                                color: colors.text,
                                                fontWeight: 500,
                                              }}
                                            >
                                              Consultation {index + 1} -{' '}
                                              {formatDate(
                                                consultation.dateConsultation
                                              )}
                                            </Typography>
                                          </Box>
                                          <Box sx={{ display: 'flex', gap: 1 }}>
                                            <Tooltip title='Modifier la consultation'>
                                              <IconButton
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  handleOpenConsultationDetailsModal(
                                                    consultation,
                                                    dossier,
                                                    user
                                                  );
                                                }}
                                                size='small'
                                                sx={{ color: colors.primary }}
                                              >
                                                <EditIcon fontSize='small' />
                                              </IconButton>
                                            </Tooltip>
                                          </Box>
                                        </Box>

                                        <Box
                                          sx={{
                                            bgcolor: colors.background,
                                            p: 2,
                                            borderRadius: 2,
                                            mb: 2,
                                          }}
                                        >
                                          <Typography
                                            variant='body2'
                                            sx={{
                                              color: colors.text,
                                              whiteSpace: 'pre-wrap',
                                            }}
                                          >
                                            {consultation.notes ||
                                              'Aucune note pour cette consultation.'}
                                          </Typography>
                                        </Box>
                                        {consultation.ordonnance && (
                                          <Box sx={{ mb: 2 }}>
                                            <Typography variant='subtitle2' sx={{ color: colors.textSecondary, mb: 1 }}>
                                              Ordonnance
                                            </Typography>
                                            <Paper
                                              sx={{
                                                p: 2,
                                                borderRadius: 2,
                                                bgcolor: 'white',
                                                boxShadow: '0 1px 4px rgba(0, 0, 0, 0.05)',
                                                border: '1px solid rgba(0, 0, 0, 0.05)',
                                              }}
                                            >
                                              <Typography variant='body2' sx={{ color: colors.text, whiteSpace: 'pre-wrap' }}>
                                                {consultation.ordonnance}
                                              </Typography>
                                              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                                                <motion.div whileHover='hover' whileTap='tap' variants={buttonVariants}>
                                                  <Button
                                                    variant='outlined'
                                                    color='primary'
                                                    startIcon={<DownloadIcon />}
                                                    onClick={() => {
                                                      const pdfContent = `
                                                        Ordonnance Médicale
                                                        ==================
                                                        Médecin : ${user?.prenom || 'Non spécifié'} ${user?.nom || 'Non spécifié'}
                                                        Date : ${new Date().toLocaleDateString('fr-FR')}
                                                        Contenu : ${consultation.ordonnance}
                                                      `;
                                                      const blob = new Blob([pdfContent], { type: 'application/pdf' });
                                                      const url = window.URL.createObjectURL(blob);
                                                      const link = document.createElement('a');
                                                      link.href = url;
                                                      link.download = `ordonnance_${consultation.idConsultation}_${new Date().toISOString().split('T')[0]}.pdf`;
                                                      document.body.appendChild(link);
                                                      link.click();
                                                      document.body.removeChild(link);
                                                      window.URL.revokeObjectURL(url);
                                                      toast.success('Ordonnance téléchargée avec succès.');
                                                    }}
                                                    sx={{
                                                      borderRadius: 2,
                                                      textTransform: 'none',
                                                      fontWeight: 500,
                                                    }}
                                                  >
                                                    Télécharger
                                                  </Button>
                                                </motion.div>
                                              </Box>
                                            </Paper>
                                          </Box>
                                        )}
                                        <Typography
                                          variant='subtitle2'
                                          sx={{
                                            color: colors.textSecondary,
                                            mb: 1,
                                          }}
                                        >
                                          Fichiers associés (
                                          {consultation.images?.length || 0})
                                        </Typography>

                                        {consultation.images &&
                                        consultation.images.length > 0 ? (
                                          <Grid container spacing={1}>
                                            {consultation.images.map(
                                              (fichier) => {
                                                const isDicom =
                                                  fichier.format
                                                    ?.toLowerCase()
                                                    .includes('dicom') ||
                                                  fichier.nomFichier
                                                    ?.toLowerCase()
                                                    .endsWith('.dcm');
                                                const isImage = fichier.format
                                                  ?.toLowerCase()
                                                  .includes('image');
                                                const isPDF = fichier.nomFichier
                                                  ?.toLowerCase()
                                                  .endsWith('.pdf');

                                                return (
                                                  <Grid
                                                    item
                                                    xs={12}
                                                    sm={6}
                                                    md={4}
                                                    key={fichier.idImage}
                                                  >
                                                    <Paper
                                                      sx={{
                                                        p: 1,
                                                        borderRadius: 2,
                                                        bgcolor: 'white',
                                                        boxShadow:
                                                          '0 1px 4px rgba(0, 0, 0, 0.05)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: 1,
                                                        border: '1px solid',
                                                        borderColor:
                                                          'rgba(0, 0, 0, 0.05)',
                                                      }}
                                                    >
                                                      {isDicom ? (
                                                        <MedicalServicesIcon
                                                          sx={{
                                                            color:
                                                              colors.primary,
                                                          }}
                                                        />
                                                      ) : isImage ? (
                                                        <PhotoIcon
                                                          sx={{
                                                            color:
                                                              colors.primary,
                                                          }}
                                                        />
                                                      ) : isPDF ? (
                                                        <DescriptionIcon
                                                          sx={{
                                                            color:
                                                              colors.primary,
                                                          }}
                                                        />
                                                      ) : (
                                                        <DescriptionIcon
                                                          sx={{
                                                            color:
                                                              colors.primary,
                                                          }}
                                                        />
                                                      )}
                                                      <Box
                                                        sx={{
                                                          flex: 1,
                                                          overflow: 'hidden',
                                                        }}
                                                      >
                                                        <Typography
                                                          variant='body2'
                                                          sx={{
                                                            color: colors.text,
                                                            fontWeight: 500,
                                                            whiteSpace:
                                                              'nowrap',
                                                            overflow: 'hidden',
                                                            textOverflow:
                                                              'ellipsis',
                                                          }}
                                                        >
                                                          {fichier.nomFichier}
                                                        </Typography>
                                                      </Box>
                                                      <Box
                                                        sx={{ display: 'flex' }}
                                                      >
                                                        <Tooltip title='Visualiser'>
                                                          <IconButton
                                                            onClick={(e) => {
                                                              e.stopPropagation();
                                                              handleOpenFileViewer(
                                                                fichier
                                                              );
                                                            }}
                                                            size='small'
                                                            sx={{
                                                              color:
                                                                colors.primary,
                                                            }}
                                                          >
                                                            <VisibilityIcon fontSize='small' />
                                                          </IconButton>
                                                        </Tooltip>
                                                        <Tooltip title='Supprimer'>
                                                          <IconButton
                                                            onClick={(e) => {
                                                              e.stopPropagation();
                                                              handleDeleteImage(
                                                                fichier.idImage
                                                              );
                                                            }}
                                                            size='small'
                                                            sx={{
                                                              color:
                                                                colors.error,
                                                            }}
                                                          >
                                                            <DeleteIcon fontSize='small' />
                                                          </IconButton>
                                                        </Tooltip>
                                                      </Box>
                                                    </Paper>
                                                  </Grid>
                                                );
                                              }
                                            )}
                                          </Grid>
                                        ) : (
                                          <Typography
                                            variant='body2'
                                            color={colors.textSecondary}
                                          >
                                            Aucun fichier associé à cette
                                            consultation.
                                          </Typography>
                                        )}
                                      </Paper>
                                    )
                                  )}
                                </Box>
                              ) : (
                                <Paper
                                  sx={{
                                    p: 3,
                                    borderRadius: 2,
                                    bgcolor: colors.background,
                                    textAlign: 'center',
                                  }}
                                >
                                  <NoteIcon
                                    sx={{
                                      fontSize: 40,
                                      color: colors.textSecondary,
                                      opacity: 0.5,
                                      mb: 1,
                                    }}
                                  />
                                  <Typography
                                    variant='body1'
                                    color={colors.textSecondary}
                                    sx={{ mb: 2 }}
                                  >
                                    Aucune consultation enregistrée pour ce
                                    patient.
                                  </Typography>
                                  <motion.div
                                    whileHover='hover'
                                    whileTap='tap'
                                    variants={buttonVariants}
                                  >
                                    <Button
                                      variant='outlined'
                                      color='primary'
                                      startIcon={<AddIcon />}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleOpenConsultationModal(dossier);
                                      }}
                                      sx={{
                                        borderRadius: 2,
                                        textTransform: 'none',
                                        fontWeight: 500,
                                      }}
                                    >
                                      Créer la première consultation
                                    </Button>
                                  </motion.div>
                                </Paper>
                              )}
                            </Box>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </Paper>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </Box>
        )}
      </motion.div>

      {/* Modale pour créer un dossier */}
      <Modal
        open={openCreateModal}
        onClose={() => setOpenCreateModal(false)}
        closeAfterTransition
        sx={{ backdropFilter: 'blur(5px)' }}
      >
        <Fade in={openCreateModal}>
          <Box sx={modalStyle}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 2,
              }}
            >
              <Typography
                variant='h6'
                sx={{ fontWeight: 600, color: colors.text }}
              >
                Créer un dossier médical
              </Typography>
              <IconButton
                onClick={() => setOpenCreateModal(false)}
                size='small'
                sx={{ color: colors.text }}
              >
                <CloseIcon />
              </IconButton>
            </Box>
            <Divider sx={{ my: 2, bgcolor: colors.divider }} />

            <form onSubmit={handleCreateDossier}>
              <Box sx={{ mb: 3 }}>
                <Typography
                  variant='body2'
                  gutterBottom
                  sx={{ fontWeight: 500, color: colors.textSecondary }}
                >
                  Patient
                </Typography>
                <FormControl fullWidth variant='outlined'>
                  <InputLabel id='patient-select-label'>
                    Choisir un patient
                  </InputLabel>
                  <Select
                    labelId='patient-select-label'
                    value={newDossier.idPatient}
                    onChange={(e) =>
                      setNewDossier({
                        ...newDossier,
                        idPatient: e.target.value,
                      })
                    }
                    label='Choisir un patient'
                    required
                    sx={{
                      borderRadius: 2,
                    }}
                  >
                    <MenuItem value='' disabled>
                      Choisir un patient
                    </MenuItem>
                    {patients.map((patient) => (
                      <MenuItem
                        key={patient.idUtilisateur}
                        value={patient.idUtilisateur}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <PersonIcon
                            sx={{ mr: 1, color: colors.primary, fontSize: 20 }}
                          />
                          {patient.nom} {patient.prenom} (ID:{' '}
                          {patient.idUtilisateur})
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography
                  variant='body2'
                  gutterBottom
                  sx={{ fontWeight: 500, color: colors.textSecondary }}
                >
                  Diagnostic
                </Typography>
                <TextField
                  value={newDossier.diagnostic}
                  onChange={(e) =>
                    setNewDossier({ ...newDossier, diagnostic: e.target.value })
                  }
                  fullWidth
                  required
                  variant='outlined'
                  placeholder='Entrez le diagnostic du patient'
                  multiline
                  rows={2}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '&:hover fieldset': { borderColor: colors.secondary },
                      '&.Mui-focused fieldset': { borderColor: colors.primary },
                    },
                  }}
                />
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography
                  variant='body2'
                  gutterBottom
                  sx={{ fontWeight: 500, color: colors.textSecondary }}
                >
                  Traitement
                </Typography>
                <TextField
                  value={newDossier.traitement}
                  onChange={(e) =>
                    setNewDossier({ ...newDossier, traitement: e.target.value })
                  }
                  fullWidth
                  required
                  variant='outlined'
                  placeholder='Entrez le traitement prescrit'
                  multiline
                  rows={2}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '&:hover fieldset': { borderColor: colors.secondary },
                      '&.Mui-focused fieldset': { borderColor: colors.primary },
                    },
                  }}
                />
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography
                  variant='body2'
                  gutterBottom
                  sx={{ fontWeight: 500, color: colors.textSecondary }}
                >
                  Groupe Sanguin
                </Typography>
                <FormControl fullWidth variant='outlined'>
                  <InputLabel id='groupe-sanguin-select-label'>
                    Sélectionner un groupe sanguin
                  </InputLabel>
                  <Select
                    labelId='groupe-sanguin-select-label'
                    value={newDossier.groupeSanguin}
                    onChange={(e) =>
                      setNewDossier({
                        ...newDossier,
                        groupeSanguin: e.target.value,
                      })
                    }
                    label='Sélectionner un groupe sanguin'
                    sx={{
                      borderRadius: 2,
                    }}
                  >
                    <MenuItem value='' selected>
                      Aucun
                    </MenuItem>
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(
                      (group) => (
                        <MenuItem key={group} value={group}>
                          {group}
                        </MenuItem>
                      )
                    )}
                  </Select>
                </FormControl>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography
                  variant='body2'
                  gutterBottom
                  sx={{ fontWeight: 500, color: colors.textSecondary }}
                >
                  Antécédents Médicaux
                </Typography>
                <TextField
                  value={newDossier.antecedentsMedicaux}
                  onChange={(e) =>
                    setNewDossier({
                      ...newDossier,
                      antecedentsMedicaux: e.target.value,
                    })
                  }
                  fullWidth
                  variant='outlined'
                  placeholder='Entrez les antécédents médicaux'
                  multiline
                  rows={3}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '&:hover fieldset': { borderColor: colors.secondary },
                      '&.Mui-focused fieldset': { borderColor: colors.primary },
                    },
                  }}
                />
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography
                  variant='body2'
                  gutterBottom
                  sx={{ fontWeight: 500, color: colors.textSecondary }}
                >
                  Allergies
                </Typography>
                <TextField
                  value={newDossier.allergies}
                  onChange={(e) =>
                    setNewDossier({ ...newDossier, allergies: e.target.value })
                  }
                  fullWidth
                  variant='outlined'
                  placeholder='Entrez les allergies connues'
                  multiline
                  rows={3}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '&:hover fieldset': { borderColor: colors.secondary },
                      '&.Mui-focused fieldset': { borderColor: colors.primary },
                    },
                  }}
                />
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography
                  variant='body2'
                  gutterBottom
                  sx={{ fontWeight: 500, color: colors.textSecondary }}
                >
                  Notes Complémentaires
                </Typography>
                <TextField
                  value={newDossier.notesComplementaires}
                  onChange={(e) =>
                    setNewDossier({
                      ...newDossier,
                      notesComplementaires: e.target.value,
                    })
                  }
                  fullWidth
                  variant='outlined'
                  placeholder='Entrez des notes supplémentaires'
                  multiline
                  rows={3}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '&:hover fieldset': { borderColor: colors.secondary },
                      '&.Mui-focused fieldset': { borderColor: colors.primary },
                    },
                  }}
                />
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography
                  variant='body2'
                  gutterBottom
                  sx={{ fontWeight: 500, color: colors.textSecondary }}
                >
                  État
                </Typography>
                <FormControl fullWidth variant='outlined'>
                  <InputLabel id='etat-select-label'>
                    État du dossier
                  </InputLabel>
                  <Select
                    labelId='etat-select-label'
                    value={newDossier.etat}
                    onChange={(e) =>
                      setNewDossier({ ...newDossier, etat: e.target.value })
                    }
                    label='État du dossier'
                    sx={{
                      borderRadius: 2,
                    }}
                  >
                    <MenuItem value='en cours'>En cours</MenuItem>
                    <MenuItem value='traité'>Traité</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
                <Button
                  variant='outlined'
                  color='primary'
                  onClick={() => setOpenCreateModal(false)}
                  fullWidth
                  sx={{
                    borderColor: colors.primary,
                    color: colors.primary,
                    '&:hover': {
                      borderColor: colors.primaryLight,
                      color: colors.primaryLight,
                    },
                    borderRadius: 2,
                    textTransform: 'none',
                    py: 1.2,
                    fontWeight: 500,
                  }}
                >
                  Annuler
                </Button>

                <motion.div
                  whileHover='hover'
                  whileTap='tap'
                  variants={buttonVariants}
                  style={{ width: '100%' }}
                >
                  <Button
                    type='submit'
                    variant='contained'
                    color='primary'
                    fullWidth
                    sx={{
                      bgcolor: colors.primary,
                      '&:hover': { bgcolor: colors.primaryLight },
                      borderRadius: 2,
                      textTransform: 'none',
                      py: 1.2,
                      fontWeight: 500,
                      boxShadow: 'none',
                    }}
                  >
                    Créer le dossier
                  </Button>
                </motion.div>
              </Box>
            </form>
          </Box>
        </Fade>
      </Modal>

      {/* Modale pour modifier un dossier */}
      <Modal
        open={openEditModal}
        onClose={() => setOpenEditModal(false)}
        closeAfterTransition
        sx={{ backdropFilter: 'blur(5px)' }}
      >
        <Fade in={openEditModal}>
          <Box sx={modalStyle}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 2,
              }}
            >
              <Typography
                variant='h6'
                sx={{ fontWeight: 600, color: colors.text }}
              >
                Modifier le dossier (ID: {selectedDossier?.idDossier})
              </Typography>
              <IconButton
                onClick={() => setOpenEditModal(false)}
                size='small'
                sx={{ color: colors.text }}
              >
                <CloseIcon />
              </IconButton>
            </Box>
            <Divider sx={{ my: 2, bgcolor: colors.divider }} />

            <form onSubmit={handleUpdateDossier}>
              <Box sx={{ mb: 3 }}>
                <Typography
                  variant='body2'
                  gutterBottom
                  sx={{ fontWeight: 500, color: colors.textSecondary }}
                >
                  Diagnostic
                </Typography>
                <TextField
                  value={editDossier.diagnostic}
                  onChange={(e) =>
                    setEditDossier({
                      ...editDossier,
                      diagnostic: e.target.value,
                    })
                  }
                  fullWidth
                  required
                  variant='outlined'
                  multiline
                  rows={2}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '&:hover ': { borderColor: colors.secondary },
                      '&.Mui-focused fieldset': { borderColor: colors.primary },
                    },
                  }}
                />
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography
                  variant='body2'
                  gutterBottom
                  sx={{ fontWeight: 500, color: colors.textSecondary }}
                >
                  Traitement
                </Typography>
                <TextField
                  value={editDossier.traitement}
                  onChange={(e) =>
                    setEditDossier({
                      ...editDossier,
                      traitement: e.target.value,
                    })
                  }
                  fullWidth
                  required
                  variant='outlined'
                  multiline
                  rows={2}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '&:hover fieldset': { borderColor: colors.secondary },
                      '&.Mui-focused fieldset': { borderColor: colors.primary },
                    },
                  }}
                />
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography
                  variant='body2'
                  gutterBottom
                  sx={{ fontWeight: 500, color: colors.textSecondary }}
                >
                  Groupe Sanguin
                </Typography>
                <FormControl fullWidth variant='outlined'>
                  <InputLabel id='edit-groupe-sanguin-select-label'>
                    Sélectionner un groupe sanguin
                  </InputLabel>
                  <Select
                    labelId='edit-groupe-sanguin-select-label'
                    value={editDossier.groupeSanguin}
                    onChange={(e) =>
                      setEditDossier({
                        ...editDossier,
                        groupeSanguin: e.target.value,
                      })
                    }
                    label='Sélectionner un groupe sanguin'
                    sx={{
                      borderRadius: 2,
                    }}
                  >
                    <MenuItem value='' selected>
                      Aucun
                    </MenuItem>
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(
                      (group) => (
                        <MenuItem key={group} value={group}>
                          {group}
                        </MenuItem>
                      )
                    )}
                  </Select>
                </FormControl>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography
                  variant='body2'
                  gutterBottom
                  sx={{ fontWeight: 500, color: colors.textSecondary }}
                >
                  Antécédents Médicaux
                </Typography>
                <TextField
                  value={editDossier.antecedentsMedicaux}
                  onChange={(e) =>
                    setEditDossier({
                      ...editDossier,
                      antecedentsMedicaux: e.target.value,
                    })
                  }
                  fullWidth
                  variant='outlined'
                  multiline
                  rows={3}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '&:hover fieldset': { borderColor: colors.secondary },
                      '&.Mui-focused fieldset': { borderColor: colors.primary },
                    },
                  }}
                />
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography
                  variant='body2'
                  gutterBottom
                  sx={{ fontWeight: 500, color: colors.textSecondary }}
                >
                  Allergies
                </Typography>
                <TextField
                  value={editDossier.allergies}
                  onChange={(e) =>
                    setEditDossier({
                      ...editDossier,
                      allergies: e.target.value,
                    })
                  }
                  fullWidth
                  variant='outlined'
                  multiline
                  rows={3}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '&:hover fieldset': { borderColor: colors.secondary },
                      '&.Mui-focused fieldset': { borderColor: colors.primary },
                    },
                  }}
                />
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography
                  variant='body2'
                  gutterBottom
                  sx={{ fontWeight: 500, color: colors.textSecondary }}
                >
                  Notes Complémentaires
                </Typography>
                <TextField
                  value={editDossier.notesComplementaires}
                  onChange={(e) =>
                    setEditDossier({
                      ...editDossier,
                      notesComplementaires: e.target.value,
                    })
                  }
                  fullWidth
                  variant='outlined'
                  multiline
                  rows={3}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '&:hover fieldset': { borderColor: colors.secondary },
                      '&.Mui-focused fieldset': { borderColor: colors.primary },
                    },
                  }}
                />
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography
                  variant='body2'
                  gutterBottom
                  sx={{ fontWeight: 500, color: colors.textSecondary }}
                >
                  État
                </Typography>
                <FormControl fullWidth variant='outlined'>
                  <InputLabel id='edit-etat-select-label'>
                    État du dossier
                  </InputLabel>
                  <Select
                    labelId='edit-etat-select-label'
                    value={editDossier.etat}
                    onChange={(e) =>
                      setEditDossier({ ...editDossier, etat: e.target.value })
                    }
                    label='État du dossier'
                    sx={{
                      borderRadius: 2,
                    }}
                  >
                    <MenuItem value='en cours'>En cours</MenuItem>
                    <MenuItem value='traité'>Traité</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
                <Button
                  variant='outlined'
                  color='primary'
                  onClick={() => setOpenEditModal(false)}
                  fullWidth
                  sx={{
                    borderColor: colors.primary,
                    color: colors.primary,
                    '&:hover': {
                      borderColor: colors.primaryLight,
                      color: colors.primaryLight,
                    },
                    borderRadius: 2,
                    textTransform: 'none',
                    py: 1.2,
                    fontWeight: 500,
                  }}
                >
                  Annuler
                </Button>

                <motion.div
                  whileHover='hover'
                  whileTap='tap'
                  variants={buttonVariants}
                  style={{ width: '100%' }}
                >
                  <Button
                    type='submit'
                    variant='contained'
                    color='primary'
                    fullWidth
                    sx={{
                      bgcolor: colors.primary,
                      '&:hover': { bgcolor: colors.primaryLight },
                      borderRadius: 2,
                      textTransform: 'none',
                      py: 1.2,
                      fontWeight: 500,
                      boxShadow: 'none',
                    }}
                  >
                    Mettre à jour
                  </Button>
                </motion.div>
              </Box>
            </form>
          </Box>
        </Fade>
      </Modal>

      {/* Modale pour ajouter une consultation */}
      <Modal
        open={openConsultationModal}
        onClose={() => setOpenConsultationModal(false)}
        closeAfterTransition
        sx={{ backdropFilter: 'blur(5px)' }}
      >
        <Fade in={openConsultationModal}>
          <Box sx={modalStyle}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 2,
              }}
            >
              <Typography
                variant='h6'
                sx={{ fontWeight: 600, color: colors.text }}
              >
                Ajouter une consultation
              </Typography>
              <IconButton
                onClick={() => setOpenConsultationModal(false)}
                size='small'
                sx={{ color: colors.text }}
              >
                <CloseIcon />
              </IconButton>
            </Box>
            <Divider sx={{ my: 2, bgcolor: colors.divider }} />

            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Typography
                variant='body1'
                sx={{ color: colors.textSecondary, mb: 2 }}
              >
                Voulez-vous créer une consultation vide ou ajouter une
                consultation avec des détails ?
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <motion.div
                  whileHover='hover'
                  whileTap='tap'
                  variants={buttonVariants}
                  style={{ flex: 1 }}
                >
                  <Button
                    variant='outlined'
                    color='primary'
                    onClick={handleCreateEmptyConsultation}
                    fullWidth
                    sx={{
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 500,
                      py: 1.2,
                    }}
                  >
                    Consultation vide
                  </Button>
                </motion.div>
                <motion.div
                  whileHover='hover'
                  whileTap='tap'
                  variants={buttonVariants}
                  style={{ flex: 1 }}
                >
                  <Button
                    variant='contained'
                    color='primary'
                    onClick={() => {
                      setOpenConsultationModal(false);
                      setOpenConsultationDetailsModal(true);
                    }}
                    fullWidth
                    sx={{
                      bgcolor: colors.primary,
                      '&:hover': { bgcolor: colors.primaryLight },
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 500,
                      py: 1.2,
                      boxShadow: 'none',
                    }}
                  >
                    Consultation détaillée
                  </Button>
                </motion.div>
              </Box>
            </Box>
          </Box>
        </Fade>
      </Modal>

      {/* Modale pour partager un dossier */}
      <Modal
        open={openShareModal}
        onClose={() => setOpenShareModal(false)}
        closeAfterTransition
        sx={{ backdropFilter: 'blur(5px)' }}
      >
        <Fade in={openShareModal}>
          <Box sx={modalStyle}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 2,
              }}
            >
              <Typography
                variant='h6'
                sx={{ fontWeight: 600, color: colors.text }}
              >
                Partager le dossier (ID: {selectedDossier?.idDossier})
              </Typography>
              <IconButton
                onClick={() => setOpenShareModal(false)}
                size='small'
                sx={{ color: colors.text }}
              >
                <CloseIcon />
              </IconButton>
            </Box>
            <Divider sx={{ my: 2, bgcolor: colors.divider }} />

            <form onSubmit={handleShare}>
              <Box sx={{ mb: 3 }}>
                <Typography
                  variant='body2'
                  gutterBottom
                  sx={{ fontWeight: 500, color: colors.textSecondary }}
                >
                  Type de partage
                </Typography>
                <FormControl fullWidth variant='outlined'>
                  <Select
                    value={shareType}
                    onChange={(e) => setShareType(e.target.value)}
                    sx={{ borderRadius: 2 }}
                  >
                    <MenuItem value='direct'>Partage direct</MenuItem>
                    <MenuItem value='link'>Partage par lien</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              {shareType === 'direct' ? (
                <Box sx={{ mb: 3 }}>
                  <Typography
                    variant='body2'
                    gutterBottom
                    sx={{ fontWeight: 500, color: colors.textSecondary }}
                  >
                    Sélectionner un utilisateur
                  </Typography>
                  <FormControl fullWidth variant='outlined'>
                    <InputLabel id='user-select-label'>
                      Choisir un utilisateur
                    </InputLabel>
                    <Select
                      labelId='user-select-label'
                      value={selectedUser}
                      onChange={(e) => setSelectedUser(e.target.value)}
                      label='Choisir un utilisateur'
                      sx={{ borderRadius: 2 }}
                    >
                      <MenuItem value='' disabled>
                        Choisir un utilisateur
                      </MenuItem>
                      {[...infirmiers, ...medecins].map((user) => (
                        <MenuItem
                          key={user.idUtilisateur}
                          value={user.idUtilisateur}
                        >
                          {user.nom} {user.prenom} ({user.role})
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              ) : (
                <>
                  <Box sx={{ mb: 3 }}>
                    <Typography
                      variant='body2'
                      gutterBottom
                      sx={{ fontWeight: 500, color: colors.textSecondary }}
                    >
                      Mot de passe
                    </Typography>
                    <TextField
                      value={motDePasse}
                      onChange={(e) => setMotDePasse(e.target.value)}
                      fullWidth
                      variant='outlined'
                      placeholder='Entrez un mot de passe'
                      type='password'
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          '&:hover fieldset': { borderColor: colors.secondary },
                          '&.Mui-focused fieldset': {
                            borderColor: colors.primary,
                          },
                        },
                      }}
                    />
                  </Box>
                  <Box sx={{ mb: 3 }}>
                    <Typography
                      variant='body2'
                      gutterBottom
                      sx={{ fontWeight: 500, color: colors.textSecondary }}
                    >
                      Durée du partage (minutes)
                    </Typography>
                    <TextField
                      value={duree}
                      onChange={(e) => setDuree(e.target.value)}
                      fullWidth
                      variant='outlined'
                      type='number'
                      placeholder='Entrez la durée en minutes'
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          '&:hover fieldset': { borderColor: colors.secondary },
                          '&.Mui-focused fieldset': {
                            borderColor: colors.primary,
                          },
                        },
                      }}
                    />
                  </Box>
                </>
              )}

              {lienPartage && (
                <Box sx={{ mb: 3 }}>
                  <Typography
                    variant='body2'
                    gutterBottom
                    sx={{ fontWeight: 500, color: colors.textSecondary }}
                  >
                    Lien de partage généré
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TextField
                      value={lienPartage}
                      fullWidth
                      variant='outlined'
                      InputProps={{
                        readOnly: true,
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                        },
                      }}
                    />
                    <Tooltip title='Copier le lien'>
                      <IconButton
                        onClick={() => {
                          navigator.clipboard.writeText(lienPartage);
                          toast.success('Lien copié !');
                        }}
                        sx={{ color: colors.primary }}
                      >
                        <ContentCopyIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
              )}

              <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
                <Button
                  variant='outlined'
                  color='primary'
                  onClick={() => setOpenShareModal(false)}
                  fullWidth
                  sx={{
                    borderColor: colors.primary,
                    color: colors.primary,
                    '&:hover': {
                      borderColor: colors.primaryLight,
                      color: colors.primaryLight,
                    },
                    borderRadius: 2,
                    textTransform: 'none',
                    py: 1.2,
                    fontWeight: 500,
                  }}
                >
                  Annuler
                </Button>

                <motion.div
                  whileHover='hover'
                  whileTap='tap'
                  variants={buttonVariants}
                  style={{ width: '100%' }}
                >
                  <Button
                    type='submit'
                    variant='contained'
                    color='primary'
                    fullWidth
                    disabled={shareLoading}
                    sx={{
                      bgcolor: colors.primary,
                      '&:hover': { bgcolor: colors.primaryLight },
                      borderRadius: 2,
                      textTransform: 'none',
                      py: 1.2,
                      fontWeight: 500,
                      boxShadow: 'none',
                    }}
                  >
                    {shareLoading ? (
                      <CircularProgress size={24} sx={{ color: 'white' }} />
                    ) : (
                      'Partager'
                    )}
                  </Button>
                </motion.div>
              </Box>
            </form>
          </Box>
        </Fade>
      </Modal>

      {/* Modale pour visualiser un fichier */}
      <FileViewerModal
        open={openFileViewer}
        onClose={() => setOpenFileViewer(false)}
        selectedFile={selectedFile}
      />

      {/* Modale pour les détails de la consultation */}
      <ConsultationDetailsModal
        open={openConsultationDetailsModal}
        onClose={() => setOpenConsultationDetailsModal(false)}
        consultation={selectedConsultation}
        dossier={selectedDossier}
        fetchDossiers={fetchDossiers}
        isCreationMode={!selectedConsultation}
        scrollToConsultation={scrollToConsultation}
        user={user} // Ajout de la prop user
      /> 
    </Box>
  );
};

export default MedecinGererDossier;
