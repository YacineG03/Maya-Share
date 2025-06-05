'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
  Alert,
  Avatar,
  Chip,
  IconButton,
  Tooltip,
  Divider,
  Modal,
  Button,
  TextField,
  Grid,
  Badge,
  Fade,
  useTheme,
  useMediaQuery,
  Tabs,
  Tab,
  Skeleton,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import DescriptionIcon from '@mui/icons-material/Description';
import NoteIcon from '@mui/icons-material/Note';
import VisibilityIcon from '@mui/icons-material/Visibility';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import PhotoIcon from '@mui/icons-material/Photo';
import PersonIcon from '@mui/icons-material/Person';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import MedicationIcon from '@mui/icons-material/Medication';
import EventNoteIcon from '@mui/icons-material/EventNote';
import CloseIcon from '@mui/icons-material/Close';
import DownloadIcon from '@mui/icons-material/Download';
import { motion, AnimatePresence } from 'framer-motion';
import {
  getDossiersByPatient,
  getImagesByDossier,
  getConsultationsByDossier,
} from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

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
const API_URL = 'http://localhost:3000';

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

// Modale pour la visualisation des fichiers
const FileViewerModal = ({ open, onClose, selectedFile }) => {
  const [imageError, setImageError] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    if (open && selectedFile) {
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

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = `${API_URL}${selectedFile.url}`;
    link.download = selectedFile.nomFichier;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Téléchargement démarré');
  };

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
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title='Télécharger'>
                <IconButton
                  onClick={handleDownload}
                  size='small'
                  sx={{ color: colors.primary }}
                >
                  <DownloadIcon />
                </IconButton>
              </Tooltip>
              <IconButton
                onClick={onClose}
                size='small'
                sx={{ color: colors.text }}
              >
                <CloseIcon />
              </IconButton>
            </Box>
          </Box>
          <Divider sx={{ my: 2, bgcolor: colors.divider }} />

          {isDicom && selectedFile.viewerUrl ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
              <Button
                variant='contained'
                color='primary'
                href={selectedFile.viewerUrl}
                target='_blank'
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
                Ouvrir dans la visionneuse DICOM
              </Button>
            </Box>
          ) : isImage ? (
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
          ) : isPdf ? (
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
                  Ce type de fichier ne peut pas être prévisualisé. Veuillez le
                  télécharger pour le consulter.
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
const ConsultationDetailsModal = ({ open, onClose, consultation }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [activeTab, setActiveTab] = useState(0);

  if (!consultation) return null;

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Non spécifié';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      closeAfterTransition
      sx={{ backdropFilter: 'blur(5px)' }}
    >
      <Fade in={open}>
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
              Détails de la consultation
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

          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <EventNoteIcon sx={{ color: colors.primary }} />
              <Typography
                variant='subtitle1'
                sx={{ fontWeight: 500, color: colors.text }}
              >
                Date: {formatDate(consultation.dateConsultation)}
              </Typography>
            </Box>

            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              variant='fullWidth'
              sx={{
                mb: 2,
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontWeight: 500,
                  borderRadius: '8px 8px 0 0',
                },
                '& .Mui-selected': {
                  color: `${colors.primary} !important`,
                },
                '& .MuiTabs-indicator': {
                  backgroundColor: colors.primary,
                  height: 3,
                  borderRadius: '3px 3px 0 0',
                },
              }}
            >
              <Tab label='Notes' />
              <Tab label='Informations' />
            </Tabs>

            <Box
              hidden={activeTab !== 0}
              sx={{ p: 2, bgcolor: colors.background, borderRadius: 2 }}
            >
              <Typography
                variant='body1'
                sx={{
                  color: colors.text,
                  whiteSpace: 'pre-wrap',
                  fontFamily: 'inherit',
                }}
              >
                {consultation.notes || 'Aucune note pour cette consultation.'}
              </Typography>
            </Box>

            <Box hidden={activeTab !== 1}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Box
                    sx={{ p: 2, bgcolor: colors.background, borderRadius: 2 }}
                  >
                    <Typography
                      variant='subtitle2'
                      sx={{ color: colors.textSecondary, mb: 1 }}
                    >
                      ID Consultation
                    </Typography>
                    <Typography
                      variant='body1'
                      sx={{ color: colors.text, fontWeight: 500 }}
                    >
                      {consultation.idConsultation}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box
                    sx={{ p: 2, bgcolor: colors.background, borderRadius: 2 }}
                  >
                    <Typography
                      variant='subtitle2'
                      sx={{ color: colors.textSecondary, mb: 1 }}
                    >
                      Médecin
                    </Typography>
                    <Typography
                      variant='body1'
                      sx={{ color: colors.text, fontWeight: 500 }}
                    >
                      {consultation.nomMedecin || 'Non spécifié'}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </Box>

          <motion.div
            whileHover='hover'
            whileTap='tap'
            variants={buttonVariants}
          >
            <Button
              variant='outlined'
              color='primary'
              onClick={onClose}
              fullWidth
              sx={{
                mt: 2,
                borderColor: colors.primary,
                color: colors.primary,
                '&:hover': {
                  borderColor: colors.primaryLight,
                  color: colors.primaryLight,
                },
                borderRadius: 2,
                textTransform: 'none',
                py: 1.5,
                fontWeight: 500,
              }}
            >
              Fermer
            </Button>
          </motion.div>
        </Box>
      </Fade>
    </Modal>
  );
};

const PatientConsulterDossier = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));

  const [dossiers, setDossiers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [expandedDossier, setExpandedDossier] = useState(null);
  const [openConsultationDetailsModal, setOpenConsultationDetailsModal] =
    useState(false);
  const [openFileModal, setOpenFileModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedConsultation, setSelectedConsultation] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const navigate = useNavigate();

  const dossiersContainerRef = useRef(null);
  const consultationRefs = useRef({});

  const fetchDossiers = async () => {
    setLoading(true);
    setRefreshing(true);
    try {
      const response = await getDossiersByPatient();
      const data = response.data.dossiers || [];

      const dossiersWithDetails = await Promise.all(
        data.map(async (dossier) => {
          const imagesResponse = await getImagesByDossier(dossier.idDossier);
          const consultationsResponse = await getConsultationsByDossier(
            dossier.idDossier
          );
          const images = imagesResponse.data.images || [];
          const consultations = consultationsResponse.data.consultations || [];

          const consultationsWithImages = consultations.map((consultation) => {
            const consultationImages = images.filter(
              (image) => image.idConsultation === consultation.idConsultation
            );
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
      setError(null);
    } catch (err) {
      console.error('Erreur lors de fetchDossiers:', err);
      if (err.response?.status === 401) {
        toast.error('Session expirée. Veuillez vous reconnecter.');
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        setError(
          'Erreur récupération dossiers : ' +
            (err.response?.data?.message || 'Erreur inconnue')
        );
      }
    } finally {
      setLoading(false);
      setTimeout(() => setRefreshing(false), 500);
    }
  };

  useEffect(() => {
    fetchDossiers();
  }, [navigate]);

  const formatDate = (dateString) => {
    if (!dateString) return 'Non spécifié';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const handleToggleExpand = (dossier) => {
    setExpandedDossier(
      expandedDossier?.idDossier === dossier.idDossier ? null : dossier
    );
  };

  const handleOpenConsultationDetailsModal = (consultation) => {
    setSelectedConsultation(consultation);
    setOpenConsultationDetailsModal(true);
  };

  const handleOpenFileModal = (fichier) => {
    setSelectedFile(fichier);
    setOpenFileModal(true);
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Filtrage des dossiers
  const filteredDossiers = dossiers.filter((dossier) => {
    const searchMatch =
      searchTerm === '' ||
      (dossier.diagnostic &&
        dossier.diagnostic.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (dossier.traitement &&
        dossier.traitement.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (dossier.medecinNom &&
        dossier.medecinNom.toLowerCase().includes(searchTerm.toLowerCase()));

    return searchMatch;
  });

  // Rendu des squelettes de chargement
  const renderSkeletons = () => {
    return Array.from(new Array(2)).map((_, index) => (
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
        minHeight: '100vh',
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
                <LocalHospitalIcon fontSize='large' />
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
              Mes dossiers médicaux
            </Typography>
            <Typography variant='body1' color='text.secondary' sx={{ mt: 0.5 }}>
              {filteredDossiers.length} dossier
              {filteredDossiers.length !== 1 ? 's' : ''} disponible
              {filteredDossiers.length !== 1 ? 's' : ''}
            </Typography>
          </Box>
        </Box>

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 3,
            flexDirection: { xs: 'column', sm: 'row' },
            gap: { xs: 2, sm: 0 },
          }}
        >
          <TextField
            placeholder='Rechercher par diagnostic, traitement...'
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
              width: { xs: '100%', sm: 300 },
              '& .MuiOutlinedInput-root': {
                '&:hover fieldset': { borderColor: colors.secondary },
                '&.Mui-focused fieldset': { borderColor: colors.primary },
              },
            }}
          />

          <motion.div
            variants={buttonVariants}
            whileHover='hover'
            whileTap='tap'
          >
            <Button
              variant='outlined'
              color='primary'
              startIcon={<RefreshIcon />}
              onClick={fetchDossiers}
              disabled={refreshing}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 500,
                px: 3,
                width: { xs: '100%', sm: 'auto' },
              }}
            >
              {refreshing ? 'Actualisation...' : 'Actualiser'}
            </Button>
          </motion.div>
        </Box>

        {error && (
          <Alert
            severity='error'
            sx={{
              mb: 3,
              borderRadius: 2,
              '& .MuiAlert-icon': {
                alignItems: 'center',
              },
            }}
          >
            {error}
          </Alert>
        )}

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
            <LocalHospitalIcon
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
              {searchTerm
                ? 'Aucun dossier ne correspond à votre recherche.'
                : 'Aucun dossier médical trouvé.'}
            </Typography>
            {searchTerm && (
              <motion.div
                whileHover='hover'
                whileTap='tap'
                variants={buttonVariants}
              >
                <Button
                  variant='contained'
                  color='primary'
                  onClick={() => setSearchTerm('')}
                  sx={{
                    bgcolor: colors.primary,
                    '&:hover': { bgcolor: colors.primaryLight },
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 500,
                    boxShadow: 'none',
                  }}
                >
                  Effacer la recherche
                </Button>
              </motion.div>
            )}
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
                            {dossier.patientPrenom?.charAt(0) || 'P'}
                          </Avatar>
                          <Box>
                            <Typography
                              variant='h6'
                              sx={{ fontWeight: 600, color: colors.text }}
                            >
                              {dossier.patientNom} {dossier.patientPrenom}
                            </Typography>
                            <Typography
                              variant='body2'
                              sx={{ color: colors.textSecondary }}
                            >
                              Dossier créé le:{' '}
                              {formatDate(dossier.dateCreation)}
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
                                      <strong>Email:</strong>{' '}
                                      {dossier.email || 'Non spécifié'}
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
                                      {dossier.telephone || 'Non spécifié'}
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
                                          fontWeight: 500,
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
                                    }}
                                  >
                                    <LocalHospitalIcon
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
                                          fontWeight: 500,
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
                                </Box>
                              </Grid>
                            </Grid>

                            <Divider sx={{ my: 2, bgcolor: colors.divider }} />

                            <Box sx={{ mb: 2 }}>
                              <Tabs
                                value={activeTab}
                                onChange={handleTabChange}
                                variant='fullWidth'
                                sx={{
                                  mb: 2,
                                  '& .MuiTab-root': {
                                    textTransform: 'none',
                                    fontWeight: 500,
                                    borderRadius: '8px 8px 0 0',
                                  },
                                  '& .Mui-selected': {
                                    color: `${colors.primary} !important`,
                                  },
                                  '& .MuiTabs-indicator': {
                                    backgroundColor: colors.primary,
                                    height: 3,
                                    borderRadius: '3px 3px 0 0',
                                  },
                                }}
                              >
                                <Tab
                                  label='Consultations'
                                  icon={<EventNoteIcon />}
                                  iconPosition='start'
                                />
                                <Tab
                                  label='Médecin'
                                  icon={<PersonIcon />}
                                  iconPosition='start'
                                />
                              </Tabs>

                              <Box hidden={activeTab !== 0}>
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
                                              bgcolor:
                                                colors.cardBackgroundHover,
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
                                            <Tooltip title='Voir les détails'>
                                              <IconButton
                                                onClick={() =>
                                                  handleOpenConsultationDetailsModal(
                                                    consultation
                                                  )
                                                }
                                                size='small'
                                                sx={{ color: colors.primary }}
                                              >
                                                <VisibilityIcon fontSize='small' />
                                              </IconButton>
                                            </Tooltip>
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
                                                display: '-webkit-box',
                                                WebkitLineClamp: 2,
                                                WebkitBoxOrient: 'vertical',
                                                overflow: 'hidden',
                                              }}
                                            >
                                              {consultation.notes ||
                                                'Aucune note pour cette consultation.'}
                                            </Typography>
                                          </Box>

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
                                                  const isPDF =
                                                    fichier.nomFichier
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
                                                          cursor: 'pointer',
                                                          '&:hover': {
                                                            bgcolor:
                                                              colors.hover,
                                                          },
                                                        }}
                                                        onClick={() =>
                                                          handleOpenFileModal(
                                                            fichier
                                                          )
                                                        }
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
                                                              color:
                                                                colors.text,
                                                              fontWeight: 500,
                                                              whiteSpace:
                                                                'nowrap',
                                                              overflow:
                                                                'hidden',
                                                              textOverflow:
                                                                'ellipsis',
                                                            }}
                                                          >
                                                            {fichier.nomFichier}
                                                          </Typography>
                                                        </Box>
                                                        <VisibilityIcon
                                                          fontSize='small'
                                                          sx={{
                                                            color:
                                                              colors.primary,
                                                          }}
                                                        />
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
                                    <EventNoteIcon
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
                                    >
                                      Aucune consultation enregistrée pour ce
                                      dossier.
                                    </Typography>
                                  </Paper>
                                )}
                              </Box>

                              <Box hidden={activeTab !== 1}>
                                <Paper
                                  sx={{
                                    p: 3,
                                    borderRadius: 2,
                                    bgcolor: 'white',
                                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                                  }}
                                >
                                  <Box
                                    sx={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      mb: 2,
                                    }}
                                  >
                                    <Avatar
                                      sx={{
                                        bgcolor: colors.primary,
                                        width: 48,
                                        height: 48,
                                        mr: 2,
                                      }}
                                    >
                                      <PersonIcon />
                                    </Avatar>
                                    <Box>
                                      <Typography
                                        variant='h6'
                                        sx={{
                                          fontWeight: 600,
                                          color: colors.text,
                                        }}
                                      >
                                        {dossier.medecinNom ||
                                          'Médecin non assigné'}
                                      </Typography>
                                      <Typography
                                        variant='body2'
                                        color={colors.textSecondary}
                                      >
                                        {dossier.medecinSpecialite ||
                                          'Spécialité non spécifiée'}
                                      </Typography>
                                    </Box>
                                  </Box>
                                  <Divider sx={{ my: 2 }} />
                                  <Typography
                                    variant='body2'
                                    color={colors.textSecondary}
                                  >
                                    <strong>Email:</strong>{' '}
                                    {dossier.medecinEmail || 'Non spécifié'}
                                  </Typography>
                                  <Typography
                                    variant='body2'
                                    color={colors.textSecondary}
                                  >
                                    <strong>Téléphone:</strong>{' '}
                                    {dossier.medecinTelephone || 'Non spécifié'}
                                  </Typography>
                                </Paper>
                              </Box>
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
