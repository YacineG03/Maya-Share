/* eslint-disable */
'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  Chip,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
  Badge,
  Divider,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import PersonIcon from '@mui/icons-material/Person';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import FilterListIcon from '@mui/icons-material/FilterList';
import TodayIcon from '@mui/icons-material/Today';
import {
  getRendezVousByMedecin,
  acceptRendezVous,
  declineRendezVous,
  cancelRendezVous,
  assignRendezVousToInfirmier,
  getUsers,
} from '../../services/api';

// Palette de couleurs améliorée
const colors = {
  primary: '#0077B6',
  primaryLight: '#0096C7',
  primaryDark: '#005b8a',
  secondary: '#00B4D8',
  secondaryLight: '#48CAE4',
  background: '#F8F9FA',
  cardBackground: 'white',
  text: '#1A202C',
  textSecondary: '#4A5568',
  success: '#10B981',
  successLight: '#D1FAE5',
  error: '#EF4444',
  errorLight: '#FEE2E2',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  info: '#3B82F6',
  infoLight: '#DBEAFE',
  divider: 'rgba(0, 0, 0, 0.08)',
  shadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
  hover: 'rgba(0, 119, 182, 0.05)',
  today: '#EFF6FF',
};

// Animations améliorées
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.1, 0.25, 1.0],
    },
  },
  hover: {
    backgroundColor: colors.hover,
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
    transition: { duration: 0.2 },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.3,
    },
  },
};

const buttonVariants = {
  hover: { scale: 1.05, transition: { duration: 0.2 } },
  tap: { scale: 0.95, transition: { duration: 0.1 } },
};

const MedecinAgenda = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [rendezVous, setRendezVous] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedRdv, setSelectedRdv] = useState(null);
  const [actionType, setActionType] = useState('');
  const [commentaire, setCommentaire] = useState('');
  const [openAssignModal, setOpenAssignModal] = useState(false);
  const [infirmiers, setInfirmiers] = useState([]);
  const [selectedInfirmier, setSelectedInfirmier] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isLoading, setIsLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('tous');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchData();
  }, [selectedDate, selectedYear, statusFilter]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const response = await getRendezVousByMedecin();
      const data = Array.isArray(response.data)
        ? response.data
        : response.data.rendezVous || [];
      setRendezVous(data);
      const usersResponse = await getUsers({ role: 'Infirmier' });
      setInfirmiers(usersResponse.data.users || []);
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || 'Erreur de chargement des rendez-vous';
      toast.error(errorMessage);
      setRendezVous([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = async () => {
    try {
      if (!selectedRdv) return;

      // Afficher un toast de chargement
      const loadingToastId = toast.loading('Traitement en cours...');

      switch (actionType) {
        case 'accept':
          await acceptRendezVous(selectedRdv.idRendezVous, { commentaire });
          toast.update(loadingToastId, {
            render: 'Rendez-vous accepté avec succès',
            type: 'success',
            isLoading: false,
            autoClose: 3000,
          });
          break;
        case 'decline':
          if (!commentaire.trim()) {
            toast.error(
              'Un commentaire est requis pour refuser un rendez-vous'
            );
            toast.dismiss(loadingToastId);
            return;
          }
          await declineRendezVous(selectedRdv.idRendezVous, { commentaire });
          toast.update(loadingToastId, {
            render: 'Rendez-vous refusé avec succès',
            type: 'success',
            isLoading: false,
            autoClose: 3000,
          });
          break;
        case 'delete':
          await cancelRendezVous(selectedRdv.idRendezVous, {
            commentaire: commentaire || 'Suppression demandée par le médecin',
          });
          toast.update(loadingToastId, {
            render: 'Rendez-vous annulé avec succès',
            type: 'success',
            isLoading: false,
            autoClose: 3000,
          });
          break;
        case 'assign':
          if (!selectedInfirmier) {
            toast.error('Veuillez sélectionner un infirmier');
            toast.dismiss(loadingToastId);
            return;
          }
          await assignRendezVousToInfirmier(selectedRdv.idRendezVous, {
            idInfirmier: selectedInfirmier,
          });
          toast.update(loadingToastId, {
            render: 'Rendez-vous assigné avec succès',
            type: 'success',
            isLoading: false,
            autoClose: 3000,
          });
          break;
        default:
          toast.dismiss(loadingToastId);
          break;
      }
      await fetchData();
      setOpenDialog(false);
      setOpenAssignModal(false);
      setSelectedRdv(null);
      setActionType('');
      setCommentaire('');
      setSelectedInfirmier('');
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
            label={'En attente'}
            color={'warning'}
            icon={<AccessTimeIcon />}
            sx={{
              fontWeight: 500,
              '& .MuiChip-icon': { fontSize: '1rem' },
              backgroundColor: colors.warningLight,
              color: colors.warning,
              borderColor: colors.warning,
            }}
            variant='outlined'
          />
        );
      case 'accepté':
        return (
          <Chip
            label={'Accepté'}
            color={'success'}
            icon={<CheckCircleIcon />}
            sx={{
              fontWeight: 500,
              '& .MuiChip-icon': { fontSize: '1rem' },
              backgroundColor: colors.successLight,
              color: colors.success,
              borderColor: colors.success,
            }}
            variant='outlined'
          />
        );
      case 'décliné':
        return (
          <Chip
            label={'Refusé'}
            color={'error'}
            icon={<CancelIcon />}
            sx={{
              fontWeight: 500,
              '& .MuiChip-icon': { fontSize: '1rem' },
              backgroundColor: colors.errorLight,
              color: colors.error,
              borderColor: colors.error,
            }}
            variant='outlined'
          />
        );
      case 'annulé':
        return (
          <Chip
            label={'Annulé'}
            color={'default'}
            sx={{
              fontWeight: 500,
              backgroundColor: '#F3F4F6',
              color: '#6B7280',
              borderColor: '#D1D5DB',
            }}
            variant='outlined'
          />
        );
      default:
        return (
          <Chip
            label={'Inconnu'}
            color={'default'}
            sx={{ fontWeight: 500 }}
            variant='outlined'
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

  // Filtrer les rendez-vous selon le statut sélectionné
  const filteredRendezVous = useMemo(() => {
    if (statusFilter === 'tous') return rendezVous;
    return rendezVous.filter((rdv) => rdv.etat === statusFilter);
  }, [rendezVous, statusFilter]);

  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
  };

  const getMonthData = () => {
    const year = selectedYear;
    const month = selectedDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const days = [];

    // Ajuster pour commencer par lundi (1) au lieu de dimanche (0)
    for (let i = 0; i < (firstDay === 0 ? 6 : firstDay - 1); i++) {
      days.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const events = filteredRendezVous.filter((rdv) => {
        const rdvDate = new Date(rdv.dateRendezVous);
        return (
          rdvDate.getDate() === day &&
          rdvDate.getMonth() === month &&
          rdvDate.getFullYear() === year
        );
      });
      days.push({ day, events });
    }

    return days;
  };

  const monthData = getMonthData();
  const weeks = [];
  for (let i = 0; i < monthData.length; i += 7) {
    weeks.push(monthData.slice(i, i + 7));
  }

  const handleDayClick = (day) => {
    if (day) {
      const events = filteredRendezVous.filter((rdv) => {
        const rdvDate = new Date(rdv.dateRendezVous);
        return (
          rdvDate.getDate() === day.day &&
          rdvDate.getMonth() === selectedDate.getMonth() &&
          rdvDate.getFullYear() === selectedYear
        );
      });
      setSelectedRdv({ day, events });
      setOpenDialog(true);
      setActionType('view');
    }
  };

  // Vérifier si un jour est aujourd'hui
  const isToday = (day) => {
    const today = new Date();
    return (
      day &&
      day.day === today.getDate() &&
      selectedDate.getMonth() === today.getMonth() &&
      selectedYear === today.getFullYear()
    );
  };

  // Aller au mois actuel
  const goToCurrentMonth = () => {
    const today = new Date();
    setSelectedDate(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedYear(today.getFullYear());
  };

  // Compter les rendez-vous par statut
  const countAppointmentsByStatus = (status) => {
    return rendezVous.filter((rdv) => rdv.etat === status).length;
  };

  return (
    <Box
      sx={{
        p: { xs: 2, md: 4 },
        bgcolor: colors.background,
        height: '100%',
        overflow: 'auto',
      }}
    >
      {/* En-tête avec titre et statistiques */}
      <Box sx={{ mb: 4 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2,
          }}
        >
          <Typography
            variant={'h5'}
            sx={{ fontWeight: 700, color: colors.text }}
          >
            <CalendarTodayIcon
              sx={{ mr: 1, verticalAlign: 'middle', color: colors.primary }}
            />
            Agenda
          </Typography>
          <Tooltip title="Aujourd'hui">
            <IconButton
              onClick={goToCurrentMonth}
              sx={{
                color: colors.primary,
                '&:hover': { backgroundColor: colors.hover },
              }}
            >
              <TodayIcon />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Statistiques des rendez-vous */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              flex: '1 1 auto',
              minWidth: { xs: '100%', sm: '150px' },
              borderRadius: 2,
              border: `1px solid ${colors.divider}`,
              backgroundColor: colors.warningLight,
            }}
          >
            <Typography
              variant='subtitle2'
              sx={{ color: colors.textSecondary, mb: 1 }}
            >
              En attente
            </Typography>
            <Typography
              variant='h6'
              sx={{ fontWeight: 600, color: colors.warning }}
            >
              {countAppointmentsByStatus('en attente')}
            </Typography>
          </Paper>

          <Paper
            elevation={0}
            sx={{
              p: 2,
              flex: '1 1 auto',
              minWidth: { xs: '100%', sm: '150px' },
              borderRadius: 2,
              border: `1px solid ${colors.divider}`,
              backgroundColor: colors.successLight,
            }}
          >
            <Typography
              variant='subtitle2'
              sx={{ color: colors.textSecondary, mb: 1 }}
            >
              Acceptés
            </Typography>
            <Typography
              variant='h6'
              sx={{ fontWeight: 600, color: colors.success }}
            >
              {countAppointmentsByStatus('accepté')}
            </Typography>
          </Paper>

          <Paper
            elevation={0}
            sx={{
              p: 2,
              flex: '1 1 auto',
              minWidth: { xs: '100%', sm: '150px' },
              borderRadius: 2,
              border: `1px solid ${colors.divider}`,
              backgroundColor: colors.errorLight,
            }}
          >
            <Typography
              variant='subtitle2'
              sx={{ color: colors.textSecondary, mb: 1 }}
            >
              Refusés/Annulés
            </Typography>
            <Typography
              variant='h6'
              sx={{ fontWeight: 600, color: colors.error }}
            >
              {countAppointmentsByStatus('décliné') +
                countAppointmentsByStatus('annulé')}
            </Typography>
          </Paper>
        </Box>
      </Box>

      {/* Contrôles du calendrier */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Typography variant={'h6'} sx={{ fontWeight: 600, color: colors.text }}>
          {selectedDate
            .toLocaleString('fr-FR', {
              month: 'long',
              year: 'numeric',
            })
            .charAt(0)
            .toUpperCase() +
            selectedDate
              .toLocaleString('fr-FR', {
                month: 'long',
                year: 'numeric',
              })
              .slice(1)}
        </Typography>

        <Box
          sx={{
            display: 'flex',
            gap: 1,
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          {/* Filtres */}
          <Box>
            <Button
              variant='outlined'
              startIcon={<FilterListIcon />}
              onClick={() => setShowFilters(!showFilters)}
              sx={{
                mr: 1,
                textTransform: 'none',
                fontWeight: 500,
                borderColor: showFilters ? colors.primary : colors.divider,
                color: showFilters ? colors.primary : colors.textSecondary,
              }}
            >
              Filtres
            </Button>

            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Paper
                    elevation={2}
                    sx={{
                      p: 2,
                      mt: 1,
                      borderRadius: 2,
                      position: 'absolute',
                      zIndex: 10,
                      minWidth: 200,
                    }}
                  >
                    <Typography
                      variant='subtitle2'
                      sx={{ mb: 1, fontWeight: 600 }}
                    >
                      Statut
                    </Typography>
                    <FormControl fullWidth size='small'>
                      <Select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        sx={{ borderRadius: 2 }}
                      >
                        <MenuItem value='tous'>Tous</MenuItem>
                        <MenuItem value='en attente'>En attente</MenuItem>
                        <MenuItem value='accepté'>Acceptés</MenuItem>
                        <MenuItem value='décliné'>Refusés</MenuItem>
                        <MenuItem value='annulé'>Annulés</MenuItem>
                      </Select>
                    </FormControl>
                  </Paper>
                </motion.div>
              )}
            </AnimatePresence>
          </Box>

          {/* Navigation du calendrier */}
          <IconButton
            onClick={() =>
              setSelectedDate(
                new Date(selectedYear, selectedDate.getMonth() - 1, 1)
              )
            }
            sx={{ color: colors.primary }}
          >
            <ArrowBackIosNewIcon fontSize='small' />
          </IconButton>

          <Button
            variant={'outlined'}
            color={'primary'}
            onClick={() =>
              setSelectedDate(
                new Date(selectedYear, selectedDate.getMonth() - 1, 1)
              )
            }
            sx={{
              mr: 1,
              textTransform: 'none',
              fontWeight: 500,
              display: { xs: 'none', sm: 'inline-flex' },
            }}
          >
            Mois précédent
          </Button>

          <Button
            variant={'outlined'}
            color={'primary'}
            onClick={() =>
              setSelectedDate(
                new Date(selectedYear, selectedDate.getMonth() + 1, 1)
              )
            }
            sx={{
              textTransform: 'none',
              fontWeight: 500,
              display: { xs: 'none', sm: 'inline-flex' },
            }}
          >
            Mois suivant
          </Button>

          <IconButton
            onClick={() =>
              setSelectedDate(
                new Date(selectedYear, selectedDate.getMonth() + 1, 1)
              )
            }
            sx={{ color: colors.primary }}
          >
            <ArrowForwardIosIcon fontSize='small' />
          </IconButton>

          <Select
            value={selectedYear}
            onChange={(e) => {
              setSelectedYear(e.target.value);
              setSelectedDate(
                new Date(e.target.value, selectedDate.getMonth(), 1)
              );
            }}
            sx={{
              ml: { xs: 0, sm: 2 },
              minWidth: 100,
              height: 40,
              '.MuiOutlinedInput-notchedOutline': {
                borderColor: colors.divider,
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: colors.primary,
              },
            }}
            variant={'outlined'}
            size='small'
          >
            {Array.from({ length: 2030 - 2020 + 1 }, (_, i) => 2020 + i).map(
              (year) => (
                <MenuItem key={year} value={year}>
                  {year}
                </MenuItem>
              )
            )}
          </Select>
        </Box>
      </Box>

      {/* Calendrier */}
      <Paper
        sx={{
          p: { xs: 1, sm: 2 },
          borderRadius: 2,
          boxShadow: colors.shadow,
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: 1,
          }}
        >
          {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day) => (
            <Typography
              key={day}
              sx={{
                fontWeight: 600,
                textAlign: 'center',
                color: colors.textSecondary,
                py: 1,
              }}
            >
              {day}
            </Typography>
          ))}
        </Box>

        <Divider sx={{ mb: 1 }} />

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: 1,
            mt: 1,
          }}
        >
          {weeks.map((week, weekIndex) =>
            week.map((day, dayIndex) => (
              <motion.div
                key={weekIndex * 7 + dayIndex}
                variants={itemVariants}
                initial={'hidden'}
                animate={'visible'}
                whileHover={day ? 'hover' : undefined}
                onClick={() => handleDayClick(day)}
                sx={{
                  border: '1px solid',
                  borderColor: isToday(day) ? colors.primary : colors.divider,
                  p: { xs: 0.5, sm: 1 },
                  minHeight: { xs: 80, sm: 100, md: 120 },
                  backgroundColor: isToday(day)
                    ? colors.today
                    : day
                      ? 'white'
                      : '#f5f5f5',
                  borderRadius: 2,
                  cursor: day ? 'pointer' : 'default',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    borderColor: day ? colors.primary : colors.divider,
                    backgroundColor: day ? colors.hover : '#f5f5f5',
                  },
                }}
              >
                {day && (
                  <>
                    <Typography
                      sx={{
                        fontWeight: isToday(day) ? 700 : 500,
                        color: isToday(day) ? colors.primary : colors.text,
                        mb: 1,
                        fontSize: { xs: '0.875rem', sm: '1rem' },
                      }}
                    >
                      {day.day}
                    </Typography>

                    {day.events.length > 0 && (
                      <Badge
                        badgeContent={day.events.length}
                        color='primary'
                        sx={{
                          position: 'absolute',
                          top: 2,
                          right: 2,
                          display: { xs: 'flex', sm: 'none' },
                        }}
                      />
                    )}

                    <Box
                      sx={{
                        display: { xs: 'none', sm: 'block' },
                        maxHeight: { sm: 60, md: 80 },
                        overflow: 'hidden',
                      }}
                    >
                      {day.events.map((event, eventIndex) => {
                        if (eventIndex > 2 && isMobile) return null;

                        const eventDate = new Date(event.dateRendezVous);
                        const startTime = eventDate.toLocaleTimeString(
                          'fr-FR',
                          {
                            hour: '2-digit',
                            minute: '2-digit',
                          }
                        );
                        let color = colors.warning;
                        if (event.etat === 'accepté') color = colors.success;
                        if (event.etat === 'décliné' || event.etat === 'annulé')
                          color = colors.error;
                        return (
                          <Chip
                            key={eventIndex}
                            label={`${startTime} - ${event.motif || 'Non spécifié'}`}
                            sx={{
                              mt: 0.5,
                              backgroundColor: color,
                              color: 'white',
                              fontSize: '0.7rem',
                              height: 'auto',
                              py: 0.5,
                              '& .MuiChip-label': {
                                whiteSpace: 'normal',
                                lineHeight: 1.2,
                                px: 1,
                                py: 0.25,
                              },
                              width: '100%',
                              maxWidth: '100%',
                              textOverflow: 'ellipsis',
                            }}
                          />
                        );
                      })}
                      {day.events.length > 3 && (
                        <Typography
                          variant='caption'
                          sx={{
                            display: 'block',
                            textAlign: 'center',
                            mt: 0.5,
                            color: colors.primary,
                            fontWeight: 500,
                          }}
                        >
                          +{day.events.length - 3} autres
                        </Typography>
                      )}
                    </Box>
                  </>
                )}
              </motion.div>
            ))
          )}
        </Box>
      </Paper>

      {/* Dialogue de détails des rendez-vous */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: colors.shadow,
            maxWidth: 500,
            maxHeight: '90vh',
          },
        }}
        fullScreen={isMobile}
      >
        <DialogTitle
          sx={{
            fontWeight: 600,
            pt: 3,
            backgroundColor:
              actionType === 'view' ? colors.background : 'white',
            borderBottom:
              actionType === 'view' ? `1px solid ${colors.divider}` : 'none',
          }}
        >
          {actionType === 'view' &&
            `Détails des rendez-vous - ${selectedRdv?.day.day} ${selectedDate.toLocaleString('fr-FR', { month: 'long', year: 'numeric' })}`}
          {actionType === 'accept' && 'Accepter le rendez-vous'}
          {actionType === 'decline' && 'Refuser le rendez-vous'}
          {actionType === 'delete' && 'Annuler le rendez-vous'}
        </DialogTitle>
        <DialogContent
          sx={{
            p: actionType === 'view' ? 0 : 3,
            '&:first-of-type': {
              pt: actionType === 'view' ? 0 : 3,
            },
          }}
        >
          {actionType === 'view' && selectedRdv?.events.length > 0 ? (
            <Box sx={{ maxHeight: '60vh', overflow: 'auto' }}>
              {selectedRdv.events.map((event, index) => (
                <Box
                  key={index}
                  sx={{
                    p: 3,
                    borderBottom:
                      index < selectedRdv.events.length - 1
                        ? `1px solid ${colors.divider}`
                        : 'none',
                    '&:hover': {
                      backgroundColor: colors.hover,
                    },
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      mb: 2,
                    }}
                  >
                    <Typography
                      variant='h6'
                      sx={{ fontWeight: 600, color: colors.text }}
                    >
                      {event.nomPatient}
                    </Typography>
                    {getStatusLabel(event.etat)}
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <AccessTimeIcon
                      sx={{ fontSize: 18, color: colors.textSecondary, mr: 1 }}
                    />
                    <Typography sx={{ color: colors.textSecondary }}>
                      {formatTime(event.dateRendezVous)}
                    </Typography>
                  </Box>

                  <Typography sx={{ color: colors.textSecondary, mb: 1 }}>
                    <strong>Motif:</strong> {event.motif || 'Non spécifié'}
                  </Typography>

                  {event.nomInfirmier && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <PersonIcon
                        sx={{
                          fontSize: 18,
                          color: colors.textSecondary,
                          mr: 1,
                        }}
                      />
                      <Typography sx={{ color: colors.textSecondary }}>
                        <strong>Infirmier:</strong> {event.nomInfirmier}
                      </Typography>
                    </Box>
                  )}

                  {event.etat === 'en attente' && (
                    <Box
                      sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}
                    >
                      <motion.div
                        variants={buttonVariants}
                        whileHover={'hover'}
                        whileTap={'tap'}
                      >
                        <Button
                          variant={'contained'}
                          color={'success'}
                          size={'small'}
                          startIcon={<CheckCircleIcon />}
                          onClick={() => {
                            setSelectedRdv(event);
                            setActionType('accept');
                            setOpenDialog(true);
                          }}
                          sx={{
                            fontWeight: 500,
                            borderRadius: 2,
                            textTransform: 'none',
                            boxShadow: 'none',
                          }}
                        >
                          Accepter
                        </Button>
                      </motion.div>
                      <motion.div
                        variants={buttonVariants}
                        whileHover={'hover'}
                        whileTap={'tap'}
                      >
                        <Button
                          variant={'outlined'}
                          color={'error'}
                          size={'small'}
                          startIcon={<CancelIcon />}
                          onClick={() => {
                            setSelectedRdv(event);
                            setActionType('decline');
                            setOpenDialog(true);
                          }}
                          sx={{
                            fontWeight: 500,
                            borderRadius: 2,
                            textTransform: 'none',
                          }}
                        >
                          Refuser
                        </Button>
                      </motion.div>
                      <motion.div
                        variants={buttonVariants}
                        whileHover={'hover'}
                        whileTap={'tap'}
                      >
                        <Button
                          variant={'outlined'}
                          color={'error'}
                          size={'small'}
                          onClick={() => {
                            setSelectedRdv(event);
                            setActionType('delete');
                            setOpenDialog(true);
                          }}
                          sx={{
                            fontWeight: 500,
                            borderRadius: 2,
                            textTransform: 'none',
                          }}
                        >
                          Supprimer
                        </Button>
                      </motion.div>
                      <motion.div
                        variants={buttonVariants}
                        whileHover={'hover'}
                        whileTap={'tap'}
                      >
                        <Button
                          variant={'outlined'}
                          color={'primary'}
                          size={'small'}
                          startIcon={<AssignmentIndIcon />}
                          onClick={() => {
                            setSelectedRdv(event);
                            setActionType('assign');
                            setOpenAssignModal(true);
                          }}
                          sx={{
                            fontWeight: 500,
                            borderRadius: 2,
                            textTransform: 'none',
                          }}
                        >
                          Assigner
                        </Button>
                      </motion.div>
                    </Box>
                  )}
                </Box>
              ))}
            </Box>
          ) : actionType === 'view' && selectedRdv?.events.length === 0 ? (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                p: 4,
              }}
            >
              <CalendarTodayIcon
                sx={{
                  fontSize: 48,
                  color: colors.textSecondary,
                  mb: 2,
                  opacity: 0.5,
                }}
              />
              <DialogContentText
                sx={{ color: colors.textSecondary, textAlign: 'center' }}
              >
                Aucun rendez-vous ce jour.
              </DialogContentText>
            </Box>
          ) : (
            <>
              <DialogContentText sx={{ mb: 2, color: colors.textSecondary }}>
                {actionType === 'accept' &&
                  `Voulez-vous accepter le rendez-vous de ${selectedRdv?.nomPatient} prévu le ${formatDate(selectedRdv?.dateRendezVous)} ?`}
                {actionType === 'decline' &&
                  `Voulez-vous refuser le rendez-vous de ${selectedRdv?.nomPatient} prévu le ${formatDate(selectedRdv?.dateRendezVous)} ?`}
                {actionType === 'delete' &&
                  `Voulez-vous annuler ce rendez-vous ? Cette action mettra le rendez-vous à l'état "annulé".`}
              </DialogContentText>
              {(actionType === 'accept' ||
                actionType === 'decline' ||
                actionType === 'delete') && (
                <TextField
                  autoFocus
                  margin={'dense'}
                  label={'Commentaire'}
                  type={'text'}
                  fullWidth
                  variant={'outlined'}
                  value={commentaire}
                  onChange={(e) => setCommentaire(e.target.value)}
                  multiline
                  rows={3}
                  required={actionType === 'decline' || actionType === 'delete'}
                  sx={{
                    '& .MuiOutlinedInput-root': { borderRadius: 2 },
                    '& .MuiFormHelperText-root': { mt: 1 },
                  }}
                  helperText={
                    (actionType === 'decline' || actionType === 'delete') &&
                    'Un commentaire est requis pour cette action'
                  }
                  error={
                    (actionType === 'decline' || actionType === 'delete') &&
                    commentaire.trim() === ''
                  }
                />
              )}
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          {(actionType === 'accept' ||
            actionType === 'decline' ||
            actionType === 'delete') && (
            <>
              <Button
                onClick={() => setOpenDialog(false)}
                sx={{ textTransform: 'none', fontWeight: 500, borderRadius: 2 }}
              >
                Annuler
              </Button>
              <motion.div
                variants={buttonVariants}
                whileHover={'hover'}
                whileTap={'tap'}
              >
                <Button
                  onClick={handleAction}
                  color={
                    actionType === 'delete'
                      ? 'error'
                      : actionType === 'accept'
                        ? 'success'
                        : 'primary'
                  }
                  variant={'contained'}
                  autoFocus
                  disabled={
                    (actionType === 'decline' || actionType === 'delete') &&
                    commentaire.trim() === ''
                  }
                  sx={{
                    textTransform: 'none',
                    fontWeight: 500,
                    borderRadius: 2,
                    boxShadow: 'none',
                  }}
                >
                  Confirmer
                </Button>
              </motion.div>
            </>
          )}
          {actionType === 'view' && (
            <Button
              onClick={() => setOpenDialog(false)}
              sx={{ textTransform: 'none', fontWeight: 500, borderRadius: 2 }}
            >
              Fermer
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Dialogue d'assignation à un infirmier */}
      <Dialog
        open={openAssignModal}
        onClose={() => setOpenAssignModal(false)}
        PaperProps={{
          sx: { borderRadius: 3, boxShadow: colors.shadow, maxWidth: 500 },
        }}
      >
        <DialogTitle sx={{ fontWeight: 600, pt: 3 }}>
          Assigner le rendez-vous à un infirmier
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2, color: colors.textSecondary }}>
            Sélectionnez un infirmier pour assigner le rendez-vous de{' '}
            {selectedRdv?.nomPatient}
            prévu le {formatDate(selectedRdv?.dateRendezVous)}.
          </DialogContentText>
          <FormControl fullWidth variant={'outlined'} sx={{ mt: 1 }}>
            <InputLabel id={'infirmier-select-label'}>
              Choisir un infirmier
            </InputLabel>
            <Select
              labelId={'infirmier-select-label'}
              value={selectedInfirmier}
              onChange={(e) => setSelectedInfirmier(e.target.value)}
              label={'Choisir un infirmier'}
              sx={{ borderRadius: 2 }}
            >
              <MenuItem value={''} disabled>
                Choisir un infirmier
              </MenuItem>
              {infirmiers.map((infirmier) => (
                <MenuItem
                  key={infirmier.idUtilisateur}
                  value={infirmier.idUtilisateur}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <PersonIcon
                      sx={{ mr: 1, color: colors.primary, fontSize: 20 }}
                    />
                    {infirmier.nom} {infirmier.prenom}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            onClick={() => setOpenAssignModal(false)}
            sx={{ textTransform: 'none', fontWeight: 500, borderRadius: 2 }}
          >
            Annuler
          </Button>
          <motion.div
            variants={buttonVariants}
            whileHover={'hover'}
            whileTap={'tap'}
          >
            <Button
              onClick={handleAction}
              color={'primary'}
              variant={'contained'}
              autoFocus
              disabled={!selectedInfirmier}
              sx={{
                textTransform: 'none',
                fontWeight: 500,
                borderRadius: 2,
                boxShadow: 'none',
              }}
            >
              Assigner
            </Button>
          </motion.div>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MedecinAgenda;
