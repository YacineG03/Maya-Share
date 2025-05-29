'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Avatar,
  TextField,
  Chip,
  Button,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Card,
  CardContent,
  CardActions,
  Grid,
  Divider,
  Badge,
  InputAdornment,
  useTheme,
  useMediaQuery,
  Tabs,
  Tab,
  Collapse,
} from '@mui/material';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import CommentIcon from '@mui/icons-material/Comment';
import RefreshIcon from '@mui/icons-material/Refresh';
import {
  getRendezVousForInfirmier,
  acceptRendezVous,
  declineRendezVous,
  cancelRendezVous,
} from '../../services/api';

// Palette de couleurs
const colors = {
  primary: '#0077B6',
  primaryDark: '#005F8C',
  primaryLight: '#00B4D8',
  secondary: '#48CAE4',
  secondaryDark: '#0096C7',
  secondaryLight: '#90E0EF',
  background: '#F8F9FA',
  backgroundGradient: 'linear-gradient(135deg, #F8F9FA 0%, #E9ECEF 100%)',
  cardBackground: '#FFFFFF',
  cardBackgroundHover: 'linear-gradient(145deg, #FFFFFF 0%, #F9FAFB 100%)',
  modalBackground: 'rgba(255, 255, 255, 0.95)',
  text: '#1A202C',
  textSecondary: '#4A5568',
  accent: '#48CAE4',
  success: '#34C759',
  successLight: '#D1FAE5',
  error: '#FF3B30',
  errorLight: '#FEE2E2',
  warning: '#FF9500',
  warningLight: '#FEF3C7',
  info: '#0077B6',
  infoLight: '#DBEAFE',
  divider: 'rgba(0, 0, 0, 0.08)',
  shadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  shadowHover: '0 12px 40px rgba(0, 0, 0, 0.15)',
};

// Animation variants
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
  hover: {
    y: -5,
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.12)',
    transition: { duration: 0.2 },
  },
};

const buttonVariants = {
  hover: { scale: 1.05, transition: { duration: 0.2 } },
  tap: { scale: 0.95, transition: { duration: 0.1 } },
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

const InfirmierGererRV = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  const [rendezVous, setRendezVous] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedRdv, setSelectedRdv] = useState(null);
  const [actionType, setActionType] = useState('');
  const [commentaire, setCommentaire] = useState('');
  const [filter, setFilter] = useState('tous');
  const [searchTerm, setSearchTerm] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [expandedRdv, setExpandedRdv] = useState(null);

  const fetchRendezVous = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getRendezVousForInfirmier();
      const data = Array.isArray(response.data)
        ? response.data
        : response.data.rendezVous || [];
      setRendezVous(data);
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || 'Erreur de chargement des rendez-vous';
      setError(errorMessage);
      toast.error(errorMessage);
      setRendezVous([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRendezVous();
  }, []);

  const handleAction = async () => {
    try {
      if (!selectedRdv) return;

      switch (actionType) {
        case 'accept':
          await acceptRendezVous(selectedRdv.idRendezVous, { commentaire });
          toast.success('Rendez-vous accepté avec succès');
          break;
        case 'decline':
          if (!commentaire.trim()) {
            toast.error(
              'Un commentaire est requis pour refuser un rendez-vous'
            );
            return;
          }
          await declineRendezVous(selectedRdv.idRendezVous, { commentaire });
          toast.success('Rendez-vous refusé avec succès');
          break;
        case 'delete':
          await cancelRendezVous(selectedRdv.idRendezVous, {
            commentaire: "Suppression demandée par l'infirmier",
          });
          toast.success('Rendez-vous annulé avec succès');
          break;
        default:
          break;
      }

      fetchRendezVous();
      setOpenDialog(false);
      setSelectedRdv(null);
      setActionType('');
      setCommentaire('');
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || 'Une erreur est survenue';
      toast.error(errorMessage);
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'en attente':
        return (
          <Chip
            label='En attente'
            color='warning'
            size='small'
            sx={{
              bgcolor: colors.warningLight,
              color: colors.warning,
              fontWeight: 500,
              '& .MuiChip-label': { px: 1 },
            }}
          />
        );
      case 'accepté':
        return (
          <Chip
            label='Accepté'
            color='success'
            size='small'
            sx={{
              bgcolor: colors.successLight,
              color: colors.success,
              fontWeight: 500,
              '& .MuiChip-label': { px: 1 },
            }}
          />
        );
      case 'décliné':
        return (
          <Chip
            label='Refusé'
            color='error'
            size='small'
            sx={{
              bgcolor: colors.errorLight,
              color: colors.error,
              fontWeight: 500,
              '& .MuiChip-label': { px: 1 },
            }}
          />
        );
      case 'annulé':
        return (
          <Chip
            label='Annulé'
            color='default'
            size='small'
            sx={{
              bgcolor: '#f1f1f1',
              color: colors.textSecondary,
              fontWeight: 500,
              '& .MuiChip-label': { px: 1 },
            }}
          />
        );
      default:
        return (
          <Chip
            label='Inconnu'
            color='default'
            size='small'
            sx={{
              bgcolor: '#f1f1f1',
              color: colors.textSecondary,
              fontWeight: 500,
              '& .MuiChip-label': { px: 1 },
            }}
          />
        );
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Non spécifié';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return 'Non spécifié';
    const date = new Date(dateString);
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);

    switch (newValue) {
      case 0:
        setFilter('tous');
        break;
      case 1:
        setFilter('en attente');
        break;
      case 2:
        setFilter('accepté');
        break;
      case 3:
        setFilter('décliné');
        break;
      default:
        setFilter('tous');
    }
  };

  const toggleExpandRdv = (rdv) => {
    setExpandedRdv(expandedRdv?.idRendezVous === rdv.idRendezVous ? null : rdv);
  };

  // Filtrer les rendez-vous en fonction de la recherche et du statut
  const filteredRendezVous = rendezVous.filter((rdv) => {
    const matchesSearch =
      searchTerm === '' ||
      rdv.nomPatient?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rdv.prenomPatient?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rdv.nomMedecin?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rdv.motif?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filter === 'tous' || rdv.etat === filter;

    return matchesSearch && matchesStatus;
  });

  // Compter les rendez-vous par statut pour les badges
  const countByStatus = {
    'en attente': rendezVous.filter((rdv) => rdv.etat === 'en attente').length,
    accepté: rendezVous.filter((rdv) => rdv.etat === 'accepté').length,
    décliné: rendezVous.filter((rdv) => rdv.etat === 'décliné').length,
  };

  return (
    <Box
      sx={{
        p: { xs: 2, md: 4 },
        bgcolor: colors.background,
        minHeight: '100vh',
      }}
    >
      {/* En-tête avec titre et boutons d'action */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          mb: 4,
          gap: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar
            sx={{
              bgcolor: colors.primary,
              width: { xs: 40, md: 56 },
              height: { xs: 40, md: 56 },
              boxShadow: '0 4px 12px rgba(0, 119, 182, 0.2)',
            }}
          >
            <EventAvailableIcon sx={{ fontSize: { xs: 24, md: 32 } }} />
          </Avatar>
          <Box>
            <Typography
              variant={isMobile ? 'h5' : 'h4'}
              sx={{
                fontWeight: 700,
                color: colors.text,
                letterSpacing: -0.5,
                lineHeight: 1.2,
              }}
            >
              Gestion des rendez-vous
            </Typography>
            <Typography variant='body1' sx={{ color: colors.textSecondary }}>
              {filteredRendezVous.length} rendez-vous{' '}
              {filter !== 'tous' ? filter + 's' : ''}
            </Typography>
          </Box>
        </Box>

        <Box
          sx={{
            display: 'flex',
            gap: 1.5,
            flexWrap: 'wrap',
            justifyContent: { xs: 'flex-start', sm: 'flex-end' },
            width: { xs: '100%', sm: 'auto' },
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
              startIcon={<RefreshIcon />}
              onClick={fetchRendezVous}
              disabled={loading}
              sx={{
                borderColor: colors.primary,
                color: colors.primary,
                '&:hover': {
                  borderColor: colors.secondary,
                  color: colors.secondary,
                },
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 500,
                py: 1,
                px: { xs: 2, md: 3 },
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
              }}
            >
              Rafraîchir
            </Button>
          </motion.div>
        </Box>
      </Box>

      {/* Barre de recherche et filtres */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 3,
          borderRadius: 3,
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: 'center',
          gap: 2,
          bgcolor: 'white',
          border: `1px solid ${colors.divider}`,
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.03)',
        }}
      >
        <Box
          sx={{
            position: 'relative',
            flex: 1,
            width: { xs: '100%', md: 'auto' },
          }}
        >
          <TextField
            placeholder='Rechercher un patient, médecin ou motif...'
            variant='outlined'
            fullWidth
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position='start'>
                  <SearchIcon sx={{ color: colors.textSecondary }} />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                '&:hover fieldset': { borderColor: colors.secondary },
                '&.Mui-focused fieldset': { borderColor: colors.primary },
              },
            }}
          />
        </Box>
      </Paper>

      {/* Tabs de filtrage */}
      <Tabs
        value={tabValue}
        onChange={handleTabChange}
        variant={isMobile ? 'scrollable' : 'standard'}
        scrollButtons={isMobile ? 'auto' : false}
        sx={{
          mb: 3,
          bgcolor: 'white',
          borderRadius: 2,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
          '& .MuiTab-root': {
            textTransform: 'none',
            fontWeight: 500,
            minWidth: 100,
          },
          '& .Mui-selected': {
            color: colors.primary,
            fontWeight: 600,
          },
          '& .MuiTabs-indicator': {
            backgroundColor: colors.primary,
            height: 3,
            borderRadius: '3px 3px 0 0',
          },
        }}
      >
        <Tab
          label='Tous'
          icon={
            <Badge
              badgeContent={rendezVous.length}
              color='primary'
              sx={{
                '& .MuiBadge-badge': {
                  fontSize: '0.7rem',
                  height: 18,
                  minWidth: 18,
                },
              }}
            />
          }
          iconPosition='end'
        />
        <Tab
          label='En attente'
          icon={
            <Badge
              badgeContent={countByStatus['en attente']}
              color='warning'
              sx={{
                '& .MuiBadge-badge': {
                  fontSize: '0.7rem',
                  height: 18,
                  minWidth: 18,
                  bgcolor: colors.warning,
                },
              }}
            />
          }
          iconPosition='end'
        />
        <Tab
          label='Acceptés'
          icon={
            <Badge
              badgeContent={countByStatus['accepté']}
              color='success'
              sx={{
                '& .MuiBadge-badge': {
                  fontSize: '0.7rem',
                  height: 18,
                  minWidth: 18,
                  bgcolor: colors.success,
                },
              }}
            />
          }
          iconPosition='end'
        />
        <Tab
          label='Refusés'
          icon={
            <Badge
              badgeContent={countByStatus['décliné']}
              color='error'
              sx={{
                '& .MuiBadge-badge': {
                  fontSize: '0.7rem',
                  height: 18,
                  minWidth: 18,
                  bgcolor: colors.error,
                },
              }}
            />
          }
          iconPosition='end'
        />
      </Tabs>

      {error && (
        <Alert severity='error' sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress sx={{ color: colors.primary }} />
        </Box>
      ) : filteredRendezVous.length === 0 ? (
        <Box
          sx={{
            textAlign: 'center',
            mt: 8,
            p: 4,
            bgcolor: 'white',
            borderRadius: 4,
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <EventAvailableIcon
              sx={{
                fontSize: 80,
                color: colors.textSecondary,
                opacity: 0.3,
                mb: 2,
              }}
            />
            <Typography
              variant='h6'
              color={colors.textSecondary}
              sx={{ mb: 2 }}
            >
              {searchTerm || filter !== 'tous'
                ? 'Aucun rendez-vous ne correspond à votre recherche'
                : 'Aucun rendez-vous trouvé'}
            </Typography>
            <motion.div
              whileHover='hover'
              whileTap='tap'
              variants={buttonVariants}
            >
              <Button
                variant='contained'
                color='primary'
                startIcon={<RefreshIcon />}
                onClick={fetchRendezVous}
                sx={{
                  bgcolor: colors.primary,
                  '&:hover': { bgcolor: colors.secondary },
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 500,
                  py: 1.2,
                  px: 3,
                }}
              >
                Rafraîchir
              </Button>
            </motion.div>
          </motion.div>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filteredRendezVous.map((rdv, index) => (
            <Grid item xs={12} md={6} lg={4} key={rdv.idRendezVous}>
              <motion.div
                custom={index}
                variants={cardVariants}
                initial='hidden'
                animate='visible'
                whileHover='hover'
              >
                <Card
                  elevation={
                    expandedRdv?.idRendezVous === rdv.idRendezVous ? 3 : 1
                  }
                  sx={{
                    borderRadius: 3,
                    overflow: 'hidden',
                    transition: 'all 0.3s ease',
                    border: `1px solid ${expandedRdv?.idRendezVous === rdv.idRendezVous ? 'transparent' : colors.divider}`,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <Box
                    sx={{
                      p: 2,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      cursor: 'pointer',
                      bgcolor:
                        expandedRdv?.idRendezVous === rdv.idRendezVous
                          ? colors.infoLight
                          : 'white',
                    }}
                    onClick={() => toggleExpandRdv(rdv)}
                  >
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Avatar
                        sx={{
                          bgcolor:
                            rdv.etat === 'en attente'
                              ? colors.warningLight
                              : rdv.etat === 'accepté'
                                ? colors.successLight
                                : colors.errorLight,
                          color:
                            rdv.etat === 'en attente'
                              ? colors.warning
                              : rdv.etat === 'accepté'
                                ? colors.success
                                : colors.error,
                        }}
                      >
                        {rdv.prenomPatient?.charAt(0) || 'P'}
                      </Avatar>
                      <Box>
                        <Typography
                          variant='subtitle1'
                          sx={{ fontWeight: 600 }}
                        >
                          {rdv.prenomPatient} {rdv.nomPatient}
                        </Typography>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            flexWrap: 'wrap',
                          }}
                        >
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 0.5,
                            }}
                          >
                            <CalendarMonthIcon
                              sx={{ fontSize: 16, color: colors.textSecondary }}
                            />
                            <Typography variant='body2' color='text.secondary'>
                              {formatDate(rdv.dateRendezVous)}
                            </Typography>
                          </Box>
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 0.5,
                            }}
                          >
                            <AccessTimeIcon
                              sx={{ fontSize: 16, color: colors.textSecondary }}
                            />
                            <Typography variant='body2' color='text.secondary'>
                              {formatTime(rdv.dateRendezVous)}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    </Box>
                    {getStatusLabel(rdv.etat)}
                  </Box>

                  <Collapse in={expandedRdv?.idRendezVous === rdv.idRendezVous}>
                    <CardContent sx={{ pt: 0 }}>
                      <Divider sx={{ mb: 2 }} />

                      <Box
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 1.5,
                        }}
                      >
                        <Box>
                          <Typography
                            variant='body2'
                            color='text.secondary'
                            gutterBottom
                          >
                            Médecin
                          </Typography>
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1,
                            }}
                          >
                            <Avatar
                              sx={{
                                width: 28,
                                height: 28,
                                bgcolor: colors.infoLight,
                                color: colors.info,
                                fontSize: '0.8rem',
                              }}
                            >
                              <LocalHospitalIcon sx={{ fontSize: 16 }} />
                            </Avatar>
                            <Typography
                              variant='body2'
                              sx={{ fontWeight: 500 }}
                            >
                              Dr. {rdv.nomMedecin || 'Non spécifié'}
                            </Typography>
                          </Box>
                        </Box>

                        <Box>
                          <Typography
                            variant='body2'
                            color='text.secondary'
                            gutterBottom
                          >
                            Motif
                          </Typography>
                          <Typography
                            variant='body2'
                            sx={{
                              fontWeight: 500,
                              bgcolor: colors.background,
                              p: 1.5,
                              borderRadius: 2,
                            }}
                          >
                            {rdv.motif || 'Aucun motif spécifié'}
                          </Typography>
                        </Box>

                        {rdv.commentaire && (
                          <Box>
                            <Typography
                              variant='body2'
                              color='text.secondary'
                              gutterBottom
                            >
                              Commentaire
                            </Typography>
                            <Box
                              sx={{
                                display: 'flex',
                                gap: 1,
                                bgcolor: colors.background,
                                p: 1.5,
                                borderRadius: 2,
                              }}
                            >
                              <CommentIcon
                                sx={{
                                  color: colors.textSecondary,
                                  fontSize: 18,
                                  mt: 0.3,
                                }}
                              />
                              <Typography variant='body2'>
                                {rdv.commentaire}
                              </Typography>
                            </Box>
                          </Box>
                        )}
                      </Box>
                    </CardContent>

                    <CardActions
                      sx={{
                        p: 2,
                        pt: 0,
                        justifyContent: 'flex-end',
                        mt: 'auto',
                      }}
                    >
                      {rdv.etat === 'en attente' && (
                        <>
                          <motion.div
                            variants={buttonVariants}
                            whileHover='hover'
                            whileTap='tap'
                          >
                            <Button
                              variant='contained'
                              color='success'
                              size='small'
                              startIcon={<CheckCircleIcon />}
                              onClick={() => {
                                setSelectedRdv(rdv);
                                setActionType('accept');
                                setOpenDialog(true);
                              }}
                              sx={{
                                bgcolor: colors.success,
                                '&:hover': {
                                  bgcolor: colors.success,
                                  filter: 'brightness(0.9)',
                                },
                                borderRadius: 2,
                                textTransform: 'none',
                                fontWeight: 500,
                              }}
                            >
                              Accepter
                            </Button>
                          </motion.div>
                          <motion.div
                            variants={buttonVariants}
                            whileHover='hover'
                            whileTap='tap'
                          >
                            <Button
                              variant='outlined'
                              color='error'
                              size='small'
                              startIcon={<CancelIcon />}
                              onClick={() => {
                                setSelectedRdv(rdv);
                                setActionType('decline');
                                setOpenDialog(true);
                              }}
                              sx={{
                                borderColor: colors.error,
                                color: colors.error,
                                '&:hover': {
                                  borderColor: colors.error,
                                  bgcolor: colors.errorLight,
                                },
                                borderRadius: 2,
                                textTransform: 'none',
                                fontWeight: 500,
                                ml: 1,
                              }}
                            >
                              Refuser
                            </Button>
                          </motion.div>
                        </>
                      )}
                      <motion.div
                        variants={buttonVariants}
                        whileHover='hover'
                        whileTap='tap'
                      >
                        <Button
                          variant='text'
                          color='error'
                          size='small'
                          startIcon={<DeleteIcon />}
                          onClick={() => {
                            setSelectedRdv(rdv);
                            setActionType('delete');
                            setOpenDialog(true);
                          }}
                          sx={{
                            color: colors.error,
                            '&:hover': { bgcolor: colors.errorLight },
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 500,
                            ml: rdv.etat === 'en attente' ? 1 : 0,
                          }}
                        >
                          Supprimer
                        </Button>
                      </motion.div>
                    </CardActions>
                  </Collapse>

                  {expandedRdv?.idRendezVous !== rdv.idRendezVous && (
                    <CardActions
                      sx={{
                        p: 2,
                        pt: 0,
                        justifyContent: 'flex-end',
                        mt: 'auto',
                      }}
                    >
                      {rdv.etat === 'en attente' && (
                        <>
                          <motion.div
                            variants={buttonVariants}
                            whileHover='hover'
                            whileTap='tap'
                          >
                            <Button
                              variant='contained'
                              color='success'
                              size='small'
                              onClick={() => {
                                setSelectedRdv(rdv);
                                setActionType('accept');
                                setOpenDialog(true);
                              }}
                              sx={{
                                bgcolor: colors.success,
                                '&:hover': {
                                  bgcolor: colors.success,
                                  filter: 'brightness(0.9)',
                                },
                                borderRadius: 2,
                                textTransform: 'none',
                                fontWeight: 500,
                                minWidth: 0,
                                p: 1,
                              }}
                            >
                              <CheckCircleIcon fontSize='small' />
                            </Button>
                          </motion.div>
                          <motion.div
                            variants={buttonVariants}
                            whileHover='hover'
                            whileTap='tap'
                          >
                            <Button
                              variant='outlined'
                              color='error'
                              size='small'
                              onClick={() => {
                                setSelectedRdv(rdv);
                                setActionType('decline');
                                setOpenDialog(true);
                              }}
                              sx={{
                                borderColor: colors.error,
                                color: colors.error,
                                '&:hover': {
                                  borderColor: colors.error,
                                  bgcolor: colors.errorLight,
                                },
                                borderRadius: 2,
                                textTransform: 'none',
                                fontWeight: 500,
                                ml: 1,
                                minWidth: 0,
                                p: 1,
                              }}
                            >
                              <CancelIcon fontSize='small' />
                            </Button>
                          </motion.div>
                        </>
                      )}
                      <motion.div
                        variants={buttonVariants}
                        whileHover='hover'
                        whileTap='tap'
                      >
                        <Button
                          variant='text'
                          color='error'
                          size='small'
                          onClick={() => {
                            setSelectedRdv(rdv);
                            setActionType('delete');
                            setOpenDialog(true);
                          }}
                          sx={{
                            color: colors.error,
                            '&:hover': { bgcolor: colors.errorLight },
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 500,
                            ml: rdv.etat === 'en attente' ? 1 : 0,
                            minWidth: 0,
                            p: 1,
                          }}
                        >
                          <DeleteIcon fontSize='small' />
                        </Button>
                      </motion.div>
                    </CardActions>
                  )}
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        aria-labelledby='alert-dialog-title'
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
            maxWidth: 500,
          },
        }}
      >
        <DialogTitle id='alert-dialog-title' sx={{ pb: 1 }}>
          {actionType === 'accept' && 'Accepter le rendez-vous'}
          {actionType === 'decline' && 'Refuser le rendez-vous'}
          {actionType === 'delete' && 'Supprimer le rendez-vous'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            {actionType === 'accept' &&
              `Voulez-vous accepter le rendez-vous de ${selectedRdv?.prenomPatient} ${selectedRdv?.nomPatient} prévu le ${formatDate(selectedRdv?.dateRendezVous)} à ${formatTime(selectedRdv?.dateRendezVous)} ?`}
            {actionType === 'decline' &&
              `Voulez-vous refuser le rendez-vous de ${selectedRdv?.prenomPatient} ${selectedRdv?.nomPatient} prévu le ${formatDate(selectedRdv?.dateRendezVous)} à ${formatTime(selectedRdv?.dateRendezVous)} ?`}
            {actionType === 'delete' &&
              `Voulez-vous supprimer ce rendez-vous ? Cette action est irréversible.`}
          </DialogContentText>

          {(actionType === 'accept' ||
            actionType === 'decline' ||
            actionType === 'delete') && (
            <TextField
              autoFocus
              margin='dense'
              label='Commentaire'
              type='text'
              fullWidth
              variant='outlined'
              value={commentaire}
              onChange={(e) => setCommentaire(e.target.value)}
              multiline
              rows={3}
              required={actionType === 'decline'}
              error={actionType === 'decline' && !commentaire.trim()}
              helperText={
                actionType === 'decline' && !commentaire.trim()
                  ? 'Un commentaire est requis pour refuser un rendez-vous'
                  : ''
              }
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '&:hover fieldset': { borderColor: colors.secondary },
                  '&.Mui-focused fieldset': { borderColor: colors.primary },
                },
              }}
            />
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            onClick={() => setOpenDialog(false)}
            variant='outlined'
            sx={{
              borderColor: colors.primary,
              color: colors.primary,
              '&:hover': {
                borderColor: colors.secondary,
                color: colors.secondary,
              },
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 500,
            }}
          >
            Annuler
          </Button>
          <Button
            onClick={handleAction}
            variant='contained'
            color={actionType === 'delete' ? 'error' : 'primary'}
            disabled={actionType === 'decline' && !commentaire.trim()}
            sx={{
              bgcolor: actionType === 'delete' ? colors.error : colors.primary,
              '&:hover': {
                bgcolor:
                  actionType === 'delete' ? colors.error : colors.secondary,
                filter: 'brightness(0.9)',
              },
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 500,
            }}
          >
            Confirmer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default InfirmierGererRV;
