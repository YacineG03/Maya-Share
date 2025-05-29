import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Avatar,
  TextField,
  MenuItem,
  Chip,
  Button,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Select,
  useMediaQuery,
  useTheme,
  Card,
  CardContent,
  Badge,
  Skeleton,
  FormControl,
  InputLabel,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import ShareIcon from '@mui/icons-material/Share';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import FilterListIcon from '@mui/icons-material/FilterList';
import RefreshIcon from '@mui/icons-material/Refresh';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonIcon from '@mui/icons-material/Person';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import {
  getRendezVousByMedecin,
  acceptRendezVous,
  declineRendezVous,
  cancelRendezVous,
  assignRendezVousToInfirmier,
  getUsers,
} from '../../services/api';

// Palette de couleurs modernisée
const colors = {
  primary: '#0077B6',
  primaryLight: '#0096C7',
  secondary: '#00B4D8',
  secondaryLight: '#48CAE4',
  background: '#F8F9FA',
  cardBackground: 'white',
  text: '#1A202C',
  textSecondary: '#4A5568',
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',
  divider: 'rgba(0, 0, 0, 0.08)',
  shadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
  hover: 'rgba(0, 119, 182, 0.05)',
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
    transition: { duration: 0.2 },
  },
};

const buttonVariants = {
  hover: { scale: 1.05, transition: { duration: 0.2 } },
  tap: { scale: 0.95, transition: { duration: 0.1 } },
};

const MedecinGererRV = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));

  const [rendezVous, setRendezVous] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedRdv, setSelectedRdv] = useState(null);
  const [actionType, setActionType] = useState('');
  const [commentaire, setCommentaire] = useState('');
  const [filter, setFilter] = useState('tous');
  const [openAssignModal, setOpenAssignModal] = useState(false);
  const [infirmiers, setInfirmiers] = useState([]);
  const [selectedInfirmier, setSelectedInfirmier] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // "list" ou "agenda"
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setRefreshing(true);

      const response = await getRendezVousByMedecin();
      const data = Array.isArray(response.data)
        ? response.data
        : response.data.rendezVous || [];
      setRendezVous(data);
      setError(null);

      const usersResponse = await getUsers({ role: 'Infirmier' });
      setInfirmiers(usersResponse.data.users || []);
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || 'Erreur de chargement des rendez-vous';
      setError(errorMessage);
      toast.error(errorMessage);
      setRendezVous([]);
    } finally {
      setLoading(false);
      setTimeout(() => setRefreshing(false), 500);
    }
  };

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
            commentaire: 'Suppression demandée par le médecin',
          });
          toast.success('Rendez-vous annulé avec succès');
          break;
        case 'assign':
          if (!selectedInfirmier) {
            toast.error('Veuillez sélectionner un infirmier');
            return;
          }
          await assignRendezVousToInfirmier(selectedRdv.idRendezVous, {
            idInfirmier: selectedInfirmier,
          });
          toast.success('Rendez-vous assigné avec succès');
          break;
        default:
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
            label='En attente'
            color='warning'
            icon={<AccessTimeIcon />}
            sx={{
              fontWeight: 500,
              '& .MuiChip-icon': { fontSize: '1rem' },
            }}
          />
        );
      case 'accepté':
        return (
          <Chip
            label='Accepté'
            color='success'
            icon={<CheckCircleIcon />}
            sx={{
              fontWeight: 500,
              '& .MuiChip-icon': { fontSize: '1rem' },
            }}
          />
        );
      case 'décliné':
        return (
          <Chip
            label='Refusé'
            color='error'
            icon={<CancelIcon />}
            sx={{
              fontWeight: 500,
              '& .MuiChip-icon': { fontSize: '1rem' },
            }}
          />
        );
      case 'annulé':
        return <Chip label='Annulé' color='default' sx={{ fontWeight: 500 }} />;
      default:
        return (
          <Chip label='Inconnu' color='default' sx={{ fontWeight: 500 }} />
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

  const filteredRendezVous = rendezVous.filter(
    (rdv) => filter === 'tous' || rdv.etat === filter
  );

  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
  };

  const getMonthData = () => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const days = [];

    // Ajouter les jours vides avant le 1er du mois
    for (let i = 0; i < (firstDay === 0 ? 6 : firstDay - 1); i++) {
      days.push(null);
    }

    // Ajouter les jours du mois
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
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
          rdvDate.getFullYear() === selectedDate.getFullYear()
        );
      });
      setSelectedRdv({ day, events });
      setOpenDialog(true);
      setActionType('view');
    }
  };

  const renderMobileView = () => {
    if (loading && !refreshing) {
      return Array.from(new Array(3)).map((_, index) => (
        <Card
          key={index}
          sx={{
            mb: 2,
            borderRadius: 2,
            boxShadow: colors.shadow,
          }}
        >
          <CardContent sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Skeleton
                variant='circular'
                width={40}
                height={40}
                sx={{ mr: 2 }}
              />
              <Box sx={{ width: '100%' }}>
                <Skeleton variant='text' width='60%' height={24} />
                <Skeleton variant='text' width='40%' height={20} />
              </Box>
            </Box>
            <Skeleton
              variant='rectangular'
              width='100%'
              height={100}
              sx={{ borderRadius: 1 }}
            />
          </CardContent>
        </Card>
      ));
    }

    return filteredRendezVous.map((rdv, index) => (
      <motion.div
        key={rdv.idRendezVous}
        variants={itemVariants}
        initial='hidden'
        animate='visible'
        whileHover='hover'
        custom={index}
      >
        <Card
          sx={{
            mb: 2,
            borderRadius: 2,
            boxShadow: colors.shadow,
            overflow: 'visible',
            transition: 'all 0.3s ease',
            '&:hover': {
              boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
            },
          }}
        >
          <CardContent sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar
                sx={{
                  bgcolor: colors.primary,
                  color: 'white',
                  fontWeight: 'bold',
                  mr: 2,
                }}
              >
                {rdv.nomPatient ? rdv.nomPatient.charAt(0) : 'P'}
              </Avatar>
              <Box>
                <Typography
                  variant='subtitle1'
                  sx={{ fontWeight: 600, color: colors.text }}
                >
                  {rdv.nomPatient} {rdv.prenomPatient}
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  {formatDate(rdv.dateRendezVous)} à{' '}
                  {formatTime(rdv.dateRendezVous)}
                </Typography>
              </Box>
            </Box>

            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 2,
              }}
            >
              <Typography variant='body2' sx={{ color: colors.textSecondary }}>
                <strong>Motif:</strong> {rdv.motif || 'Non spécifié'}
              </Typography>
              {getStatusLabel(rdv.etat)}
            </Box>

            {rdv.nomInfirmier && (
              <Typography
                variant='body2'
                sx={{ mb: 2, color: colors.textSecondary }}
              >
                <strong>Infirmier assigné:</strong> {rdv.nomInfirmier}
              </Typography>
            )}

            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 1,
                justifyContent:
                  rdv.etat === 'en attente' ? 'space-between' : 'flex-end',
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
                        fontWeight: 500,
                        borderRadius: 2,
                        textTransform: 'none',
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
                  variant='outlined'
                  color='primary'
                  size='small'
                  startIcon={<ShareIcon />}
                  onClick={() => {
                    setSelectedRdv(rdv);
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
            </Box>
          </CardContent>
        </Card>
      </motion.div>
    ));
  };

  const renderDesktopView = () => {
    if (viewMode === 'agenda') {
      return (
        <Box sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography
              variant='h6'
              sx={{ fontWeight: 600, color: colors.text }}
            >
              Agenda -{' '}
              {selectedDate.toLocaleString('fr-FR', {
                month: 'long',
                year: 'numeric',
              })}
            </Typography>
            <Box>
              <Button
                variant='outlined'
                color='primary'
                onClick={() => setViewMode('list')}
                sx={{ mr: 1, textTransform: 'none', fontWeight: 500 }}
              >
                Retour à la liste
              </Button>
              <Button
                variant='outlined'
                color='primary'
                onClick={() =>
                  setSelectedDate(
                    new Date(
                      selectedDate.getFullYear(),
                      selectedDate.getMonth() - 1,
                      1
                    )
                  )
                }
                sx={{ mr: 1, textTransform: 'none', fontWeight: 500 }}
              >
                Mois précédent
              </Button>
              <Button
                variant='outlined'
                color='primary'
                onClick={() =>
                  setSelectedDate(
                    new Date(
                      selectedDate.getFullYear(),
                      selectedDate.getMonth() + 1,
                      1
                    )
                  )
                }
                sx={{ textTransform: 'none', fontWeight: 500 }}
              >
                Mois suivant
              </Button>
            </Box>
          </Box>
          <Paper sx={{ p: 2, borderRadius: 2, boxShadow: colors.shadow }}>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, 1fr)',
                gap: 1,
              }}
            >
              {['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'].map((day) => (
                <Typography
                  key={day}
                  sx={{
                    fontWeight: 600,
                    textAlign: 'center',
                    color: colors.textSecondary,
                  }}
                >
                  {day}
                </Typography>
              ))}
            </Box>
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
                    initial='hidden'
                    animate='visible'
                    whileHover='hover'
                    onClick={() => handleDayClick(day)}
                    sx={{
                      border: '1px solid #eee',
                      p: 1,
                      minHeight: 100,
                      backgroundColor: day ? 'white' : '#f5f5f5',
                      borderRadius: 4,
                      cursor: day ? 'pointer' : 'default',
                      position: 'relative',
                      '&:hover': {
                        backgroundColor: day ? colors.hover : '#f5f5f5',
                      },
                    }}
                  >
                    {day && (
                      <Typography
                        sx={{
                          fontWeight: 500,
                          color: colors.text,
                          mb: 1,
                        }}
                      >
                        {day.day}
                      </Typography>
                    )}
                    {day &&
                      day.events.map((event, eventIndex) => {
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
                              fontSize: '0.75rem',
                              '& .MuiChip-label': {
                                whiteSpace: 'normal',
                                lineHeight: 1.2,
                              },
                            }}
                          />
                        );
                      })}
                  </motion.div>
                ))
              )}
            </Box>
          </Paper>
        </Box>
      );
    }

    return (
      <TableContainer
        component={Paper}
        sx={{ boxShadow: colors.shadow, borderRadius: 2 }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: 'rgba(0, 119, 182, 0.05)' }}>
              <TableCell sx={{ fontWeight: 600, color: colors.text }}>
                Patient
              </TableCell>
              <TableCell sx={{ fontWeight: 600, color: colors.text }}>
                Date
              </TableCell>
              <TableCell sx={{ fontWeight: 600, color: colors.text }}>
                Heure
              </TableCell>
              <TableCell sx={{ fontWeight: 600, color: colors.text }}>
                Motif
              </TableCell>
              <TableCell sx={{ fontWeight: 600, color: colors.text }}>
                Statut
              </TableCell>
              <TableCell sx={{ fontWeight: 600, color: colors.text }}>
                Infirmier
              </TableCell>
              <TableCell sx={{ fontWeight: 600, color: colors.text }}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading && !refreshing ? (
              Array.from(new Array(5)).map((_, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Skeleton variant='text' width={150} />
                  </TableCell>
                  <TableCell>
                    <Skeleton variant='text' width={100} />
                  </TableCell>
                  <TableCell>
                    <Skeleton variant='text' width={80} />
                  </TableCell>
                  <TableCell>
                    <Skeleton variant='text' width={120} />
                  </TableCell>
                  <TableCell>
                    <Skeleton variant='rectangular' width={100} height={32} />
                  </TableCell>
                  <TableCell>
                    <Skeleton variant='text' width={120} />
                  </TableCell>
                  <TableCell>
                    <Skeleton variant='rectangular' width={200} height={40} />
                  </TableCell>
                </TableRow>
              ))
            ) : filteredRendezVous.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align='center' sx={{ py: 4 }}>
                  <Typography color='text.secondary'>
                    Aucun rendez-vous trouvé.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredRendezVous.map((rdv) => (
                <motion.tr
                  key={rdv.idRendezVous}
                  variants={itemVariants}
                  initial='hidden'
                  animate='visible'
                  whileHover='hover'
                  component={TableRow}
                  sx={{
                    '&:hover': {
                      backgroundColor: colors.hover,
                    },
                    transition: 'background-color 0.3s ease',
                  }}
                >
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar
                        sx={{
                          width: 32,
                          height: 32,
                          mr: 1,
                          bgcolor: colors.primary,
                          fontSize: '0.875rem',
                        }}
                      >
                        {rdv.nomPatient ? rdv.nomPatient.charAt(0) : 'P'}
                      </Avatar>
                      <Typography variant='body2' sx={{ fontWeight: 500 }}>
                        {rdv.nomPatient} {rdv.prenomPatient}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{formatDate(rdv.dateRendezVous)}</TableCell>
                  <TableCell>{formatTime(rdv.dateRendezVous)}</TableCell>
                  <TableCell>{rdv.motif || 'Non spécifié'}</TableCell>
                  <TableCell>{getStatusLabel(rdv.etat)}</TableCell>
                  <TableCell>{rdv.nomInfirmier || 'Non assigné'}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
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
                                fontWeight: 500,
                                borderRadius: 2,
                                textTransform: 'none',
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
                          variant='outlined'
                          color='primary'
                          size='small'
                          startIcon={<ShareIcon />}
                          onClick={() => {
                            setSelectedRdv(rdv);
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
                    </Box>
                  </TableCell>
                </motion.tr>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    );
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
              badgeContent={filteredRendezVous.length}
              color='primary'
              sx={{
                '& .MuiBadge-badge': {
                  fontWeight: 'bold',
                  fontSize: '0.8rem',
                },
              }}
            >
              <Avatar sx={{ bgcolor: colors.primary, width: 56, height: 56 }}>
                <EventAvailableIcon fontSize='large' />
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
              Gestion des rendez-vous
            </Typography>
            <Typography variant='body1' color='text.secondary' sx={{ mt: 0.5 }}>
              {filteredRendezVous.length} rendez-vous{' '}
              {filter !== 'tous' ? `(${filter})` : 'au total'}
            </Typography>
          </Box>
          <Box sx={{ ml: 'auto' }}>
            <motion.div
              variants={buttonVariants}
              whileHover='hover'
              whileTap='tap'
            >
              <Button
                variant={viewMode === 'agenda' ? 'contained' : 'outlined'}
                color='primary'
                startIcon={<CalendarTodayIcon />}
                onClick={() => setViewMode('agenda')}
                sx={{ mr: 1, textTransform: 'none', fontWeight: 500 }}
              >
                Voir mon agenda
              </Button>
            </motion.div>
            <motion.div
              variants={buttonVariants}
              whileHover='hover'
              whileTap='tap'
            >
              <Button
                variant={viewMode === 'list' ? 'contained' : 'outlined'}
                color='primary'
                startIcon={<EventAvailableIcon />}
                onClick={() => setViewMode('list')}
                sx={{ textTransform: 'none', fontWeight: 500 }}
              >
                Liste des rendez-vous
              </Button>
            </motion.div>
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
          <FormControl
            variant='outlined'
            size='small'
            sx={{
              minWidth: { xs: '100%', sm: 200 },
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              },
            }}
          >
            <InputLabel id='filter-label'>Filtrer par statut</InputLabel>
            <Select
              labelId='filter-label'
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              label='Filtrer par statut'
              startAdornment={
                <FilterListIcon sx={{ mr: 1, color: colors.textSecondary }} />
              }
            >
              <MenuItem value='tous'>Tous les rendez-vous</MenuItem>
              <MenuItem value='en attente'>En attente</MenuItem>
              <MenuItem value='accepté'>Acceptés</MenuItem>
              <MenuItem value='décliné'>Refusés</MenuItem>
              <MenuItem value='annulé'>Annulés</MenuItem>
            </Select>
          </FormControl>

          <motion.div
            variants={buttonVariants}
            whileHover='hover'
            whileTap='tap'
          >
            <Button
              variant='outlined'
              color='primary'
              startIcon={<RefreshIcon />}
              onClick={fetchData}
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

        <AnimatePresence>
          {isMobile ? renderMobileView() : renderDesktopView()}
        </AnimatePresence>
      </motion.div>

      {/* Dialogue de confirmation ou vue des détails */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: colors.shadow,
            maxWidth: 500,
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 600, pt: 3 }}>
          {actionType === 'view' &&
            `Détails des rendez-vous - ${selectedRdv?.day.day} ${selectedDate.toLocaleString('fr-FR', { month: 'long', year: 'numeric' })}`}
          {actionType === 'accept' && 'Accepter le rendez-vous'}
          {actionType === 'decline' && 'Refuser le rendez-vous'}
          {actionType === 'delete' && 'Annuler le rendez-vous'}
        </DialogTitle>
        <DialogContent>
          {actionType === 'view' && selectedRdv?.events.length > 0 ? (
            selectedRdv.events.map((event, index) => (
              <Box key={index} sx={{ mb: 2 }}>
                <Typography sx={{ color: colors.textSecondary }}>
                  <strong>Patient:</strong> {event.nomPatient}{' '}
                  {event.prenomPatient}
                </Typography>
                <Typography sx={{ color: colors.textSecondary }}>
                  <strong>Heure:</strong> {formatTime(event.dateRendezVous)}
                </Typography>
                <Typography sx={{ color: colors.textSecondary }}>
                  <strong>Motif:</strong> {event.motif || 'Non spécifié'}
                </Typography>
                <Typography sx={{ color: colors.textSecondary }}>
                  <strong>Statut:</strong> {getStatusLabel(event.etat)}
                </Typography>
                {event.nomInfirmier && (
                  <Typography sx={{ color: colors.textSecondary }}>
                    <strong>Infirmier:</strong> {event.nomInfirmier}
                  </Typography>
                )}
                {event.etat === 'en attente' && (
                  <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
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
                      whileHover='hover'
                      whileTap='tap'
                    >
                      <Button
                        variant='outlined'
                        color='error'
                        size='small'
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
                      whileHover='hover'
                      whileTap='tap'
                    >
                      <Button
                        variant='outlined'
                        color='error'
                        size='small'
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
                  </Box>
                )}
              </Box>
            ))
          ) : actionType === 'view' && selectedRdv?.events.length === 0 ? (
            <DialogContentText sx={{ color: colors.textSecondary }}>
              Aucun rendez-vous ce jour.
            </DialogContentText>
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
                  margin='dense'
                  label='Commentaire'
                  type='text'
                  fullWidth
                  variant='outlined'
                  value={commentaire}
                  onChange={(e) => setCommentaire(e.target.value)}
                  multiline
                  rows={3}
                  required={actionType === 'decline' || actionType === 'delete'}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                  }}
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
                sx={{
                  textTransform: 'none',
                  fontWeight: 500,
                  borderRadius: 2,
                }}
              >
                Annuler
              </Button>
              <motion.div
                variants={buttonVariants}
                whileHover='hover'
                whileTap='tap'
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
                  variant='contained'
                  autoFocus
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
              sx={{
                textTransform: 'none',
                fontWeight: 500,
                borderRadius: 2,
              }}
            >
              Fermer
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Dialogue d'assignation */}
      <Dialog
        open={openAssignModal}
        onClose={() => setOpenAssignModal(false)}
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: colors.shadow,
            maxWidth: 500,
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 600, pt: 3 }}>
          Assigner le rendez-vous à un infirmier
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2, color: colors.textSecondary }}>
            Sélectionnez un infirmier pour assigner le rendez-vous de{' '}
            {selectedRdv?.nomPatient} prévu le{' '}
            {formatDate(selectedRdv?.dateRendezVous)}.
          </DialogContentText>
          <FormControl fullWidth variant='outlined' sx={{ mt: 1 }}>
            <InputLabel id='infirmier-select-label'>
              Choisir un infirmier
            </InputLabel>
            <Select
              labelId='infirmier-select-label'
              value={selectedInfirmier}
              onChange={(e) => setSelectedInfirmier(e.target.value)}
              label='Choisir un infirmier'
              sx={{
                borderRadius: 2,
              }}
            >
              <MenuItem value='' disabled>
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
            sx={{
              textTransform: 'none',
              fontWeight: 500,
              borderRadius: 2,
            }}
          >
            Annuler
          </Button>
          <motion.div
            variants={buttonVariants}
            whileHover='hover'
            whileTap='tap'
          >
            <Button
              onClick={handleAction}
              color='primary'
              variant='contained'
              autoFocus
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

export default MedecinGererRV;
