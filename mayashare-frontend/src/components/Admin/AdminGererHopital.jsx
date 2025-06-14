/* eslint-disable prettier/prettier */
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Card,
  CardContent,
  Skeleton,
  Avatar,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import {
  getHopitaux,
  createHopital,
  updateHopital,
  deleteHopital,
} from '../../services/api';

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

// Animation variants (identique à MedecinGererRV)
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

const dialogVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.1, 0.25, 1.0],
    },
  },
};

const AdminGererHopital = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [hopitaux, setHopitaux] = useState([]);
  const [filteredHopitaux, setFilteredHopitaux] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [formData, setFormData] = useState({
    nom: '',
    adresse: '',
    ville: '',
  });
  const [editId, setEditId] = useState(null);
  const [errors, setErrors] = useState({});
  const [refreshing, setRefreshing] = useState(false);

  // Charger les hôpitaux
  useEffect(() => {
    if (search) {
      const lowerCaseSearch = search.toLowerCase();
      const filtered = hopitaux.filter(
        (hopital) =>
          hopital.nom.toLowerCase().includes(lowerCaseSearch) ||
          hopital.adresse.toLowerCase().includes(lowerCaseSearch) ||
          hopital.ville.toLowerCase().includes(lowerCaseSearch)
      );
      setFilteredHopitaux(filtered);
    } else {
      setFilteredHopitaux(hopitaux);
    }
  }, [search, hopitaux]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setRefreshing(true);
      const response = await getHopitaux();
      const data = Array.isArray(response.data)
        ? response.data
        : response.data.hopitaux || [];
      setHopitaux(data);
      setFilteredHopitaux(data);
      setError(null);
      toast.success('Liste des hôpitaux chargée avec succès.');
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || 'Erreur de chargement des hôpitaux';
      setError(errorMessage);
      toast.error(errorMessage);
      setHopitaux([]);
      setFilteredHopitaux([]);
    } finally {
      setLoading(false);
      setTimeout(() => setRefreshing(false), 500);
    }
  };

  // Validation du formulaire
  const validateForm = () => {
    const newErrors = {};
    if (!formData.nom || formData.nom.trim() === '') {
      newErrors.nom = 'Le nom de l’hôpital est requis.';
    }
    if (!formData.adresse || formData.adresse.trim() === '') {
      newErrors.adresse = 'L’adresse est requise.';
    }
    if (!formData.ville || formData.ville.trim() === '') {
      newErrors.ville = 'La ville est requise.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Gestion des changements dans le formulaire
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  // Gestion de la recherche
  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  // Ajouter un hôpital
  const handleAddHopital = async () => {
    if (!validateForm()) return;

    try {
      const response = await createHopital(formData);
      const newHopital = { idHopital: response.data.id, ...formData };
      setHopitaux((prev) => [...prev, newHopital]);
      setFilteredHopitaux((prev) => [...prev, newHopital]);
      setOpenAddDialog(false);
      setFormData({ nom: '', adresse: '', ville: '' });
      toast.success('Hôpital ajouté avec succès.');
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || 'Erreur lors de l’ajout de l’hôpital.';
      toast.error(errorMessage);
    }
  };

  // Ouvrir le formulaire d'ajout
  const handleOpenAddDialog = () => {
    setFormData({ nom: '', adresse: '', ville: '' });
    setErrors({});
    setOpenAddDialog(true);
  };

  // Ouvrir le formulaire de modification
  const handleEditHopital = (hopital) => {
    setEditId(hopital.idHopital);
    setFormData({
      nom: hopital.nom,
      adresse: hopital.adresse,
      ville: hopital.ville,
    });
    setOpenEditDialog(true);
  };

  // Mettre à jour un hôpital
  const handleUpdateHopital = async () => {
    if (!validateForm()) return;

    try {
      await updateHopital(editId, formData);
      const updatedHopital = { idHopital: editId, ...formData };
      setHopitaux((prev) =>
        prev.map((hopital) =>
          hopital.idHopital === editId ? updatedHopital : hopital
        )
      );
      setFilteredHopitaux((prev) =>
        prev.map((hopital) =>
          hopital.idHopital === editId ? updatedHopital : hopital
        )
      );
      setOpenEditDialog(false);
      setFormData({ nom: '', adresse: '', ville: '' });
      setEditId(null);
      toast.success('Hôpital mis à jour avec succès.');
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        'Erreur lors de la mise à jour de l’hôpital.';
      toast.error(errorMessage);
    }
  };

  // Supprimer un hôpital
  const handleDeleteHopital = async (id) => {
    try {
      await deleteHopital(id);
      setHopitaux((prev) => prev.filter((hopital) => hopital.idHopital !== id));
      setFilteredHopitaux((prev) =>
        prev.filter((hopital) => hopital.idHopital !== id)
      );
      toast.success('Hôpital supprimé avec succès.');
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        'Erreur lors de la suppression de l’hôpital.';
      toast.error(errorMessage);
    }
  };

  // Vue mobile avec cartes
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

    return filteredHopitaux.map((hopital, index) => (
      <motion.div
        key={hopital.idHopital}
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
                {hopital.nom ? hopital.nom.charAt(0) : 'H'}
              </Avatar>
              <Box>
                <Typography
                  variant='subtitle1'
                  sx={{ fontWeight: 600, color: colors.text }}
                >
                  {hopital.nom}
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  {hopital.ville}
                </Typography>
              </Box>
            </Box>

            <Typography
              variant='body2'
              sx={{ mb: 2, color: colors.textSecondary }}
            >
              <strong>Adresse:</strong> {hopital.adresse}
            </Typography>

            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
              <motion.div
                variants={buttonVariants}
                whileHover='hover'
                whileTap='tap'
              >
                <Button
                  variant='outlined'
                  color='primary'
                  size='small'
                  startIcon={<EditIcon />}
                  onClick={() => handleEditHopital(hopital)}
                  sx={{
                    fontWeight: 500,
                    borderRadius: 2,
                    textTransform: 'none',
                  }}
                >
                  Modifier
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
                  startIcon={<DeleteIcon />}
                  onClick={() => handleDeleteHopital(hopital.idHopital)}
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

  // Vue desktop avec tableau
  const renderDesktopView = () => {
    return (
      <TableContainer
        component={Paper}
        sx={{ boxShadow: colors.shadow, borderRadius: 2 }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: 'rgba(0, 119, 182, 0.05)' }}>
              <TableCell sx={{ fontWeight: 600, color: colors.text }}>
                Nom
              </TableCell>
              <TableCell sx={{ fontWeight: 600, color: colors.text }}>
                Adresse
              </TableCell>
              <TableCell sx={{ fontWeight: 600, color: colors.text }}>
                Ville
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
                    <Skeleton variant='text' width={200} />
                  </TableCell>
                  <TableCell>
                    <Skeleton variant='text' width={100} />
                  </TableCell>
                  <TableCell>
                    <Skeleton variant='rectangular' width={200} height={40} />
                  </TableCell>
                </TableRow>
              ))
            ) : filteredHopitaux.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align='center' sx={{ py: 4 }}>
                  <Typography color='text.secondary'>
                    Aucun hôpital trouvé.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredHopitaux.map((hopital) => (
                <TableRow
                  key={hopital.idHopital}
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
                        {hopital.nom ? hopital.nom.charAt(0) : 'H'}
                      </Avatar>
                      <Typography variant='body2' sx={{ fontWeight: 500 }}>
                        {hopital.nom}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{hopital.adresse}</TableCell>
                  <TableCell>{hopital.ville}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <motion.div
                        variants={buttonVariants}
                        whileHover='hover'
                        whileTap='tap'
                      >
                        <Button
                          variant='outlined'
                          color='primary'
                          size='small'
                          startIcon={<EditIcon />}
                          onClick={() => handleEditHopital(hopital)}
                          sx={{
                            fontWeight: 500,
                            borderRadius: 2,
                            textTransform: 'none',
                          }}
                        >
                          Modifier
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
                          startIcon={<DeleteIcon />}
                          onClick={() => handleDeleteHopital(hopital.idHopital)}
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
                </TableRow>
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
            }}
          >
            <Avatar sx={{ bgcolor: colors.primary, width: 56, height: 56 }}>
              <LocalHospitalIcon fontSize='large' />
            </Avatar>
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
              Gestion des hôpitaux
            </Typography>
            <Typography variant='body1' color='text.secondary' sx={{ mt: 0.5 }}>
              {filteredHopitaux.length} hôpital
              {filteredHopitaux.length !== 1 ? 'aux' : ''} au total
            </Typography>
          </Box>
          <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
            <motion.div
              variants={buttonVariants}
              whileHover='hover'
              whileTap='tap'
            >
              <Button
                variant='contained'
                color='primary'
                startIcon={<LocalHospitalIcon />}
                onClick={handleOpenAddDialog}
                sx={{ textTransform: 'none', fontWeight: 500 }}
              >
                Ajouter un hôpital
              </Button>
            </motion.div>
            <motion.div
              variants={buttonVariants}
              whileHover='hover'
              whileTap='tap'
            >
              <Button
                variant='contained'
                color='primary'
                startIcon={<RefreshIcon />}
                onClick={fetchData}
                disabled={refreshing}
                sx={{ textTransform: 'none', fontWeight: 500 }}
              >
                {refreshing ? 'Actualisation...' : 'Actualiser'}
              </Button>
            </motion.div>
          </Box>
        </Box>

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            mb: 3,
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 2,
          }}
        >
          <TextField
            label='Rechercher un hôpital'
            value={search}
            onChange={handleSearchChange}
            fullWidth
            sx={{
              maxWidth: { xs: '100%', sm: 300 },
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              },
            }}
          />
        </Box>

        {error && (
          <Box
            sx={{
              mb: 3,
              p: 2,
              bgcolor: colors.error,
              color: 'white',
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Typography>{error}</Typography>
          </Box>
        )}

        <AnimatePresence>
          {isMobile ? renderMobileView() : renderDesktopView()}
        </AnimatePresence>
      </motion.div>

      {/* Dialogue pour ajouter un hôpital */}
      <Dialog
        open={openAddDialog}
        onClose={() => {
          setOpenAddDialog(false);
          setFormData({ nom: '', adresse: '', ville: '' });
          setErrors({});
        }}
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: colors.shadow,
            maxWidth: 400,
          },
        }}
      >
        <motion.div
          variants={dialogVariants}
          initial='hidden'
          animate='visible'
        >
          <DialogTitle sx={{ fontWeight: 600, color: colors.text }}>
            Ajouter un hôpital
          </DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ mb: 2, color: colors.textSecondary }}>
              Remplissez les informations pour ajouter un nouvel hôpital.
            </DialogContentText>
            <TextField
              label='Nom'
              name='nom'
              value={formData.nom}
              onChange={handleChange}
              fullWidth
              margin='normal'
              error={!!errors.nom}
              helperText={errors.nom}
              sx={{ '& .MuiInputBase-root': { borderRadius: 2 } }}
            />
            <TextField
              label='Adresse'
              name='adresse'
              value={formData.adresse}
              onChange={handleChange}
              fullWidth
              margin='normal'
              error={!!errors.adresse}
              helperText={errors.adresse}
              sx={{ '& .MuiInputBase-root': { borderRadius: 2 } }}
            />
            <TextField
              label='Ville'
              name='ville'
              value={formData.ville}
              onChange={handleChange}
              fullWidth
              margin='normal'
              error={!!errors.ville}
              helperText={errors.ville}
              sx={{ '& .MuiInputBase-root': { borderRadius: 2 } }}
            />
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button
              onClick={() => {
                setOpenAddDialog(false);
                setFormData({ nom: '', adresse: '', ville: '' });
                setErrors({});
              }}
              sx={{
                textTransform: 'none',
                fontWeight: 500,
                color: colors.textSecondary,
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
                onClick={handleAddHopital}
                color='primary'
                variant='contained'
                sx={{
                  textTransform: 'none',
                  fontWeight: 500,
                  borderRadius: 2,
                  boxShadow: 'none',
                }}
              >
                Ajouter
              </Button>
            </motion.div>
          </DialogActions>
        </motion.div>
      </Dialog>

      {/* Dialogue pour modifier un hôpital */}
      <Dialog
        open={openEditDialog}
        onClose={() => {
          setOpenEditDialog(false);
          setFormData({ nom: '', adresse: '', ville: '' });
          setEditId(null);
          setErrors({});
        }}
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: colors.shadow,
            maxWidth: 400,
          },
        }}
      >
        <motion.div
          variants={dialogVariants}
          initial='hidden'
          animate='visible'
        >
          <DialogTitle sx={{ fontWeight: 600, color: colors.text }}>
            Modifier un hôpital
          </DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ mb: 2, color: colors.textSecondary }}>
              Modifiez les informations de l’hôpital.
            </DialogContentText>
            <TextField
              label='Nom'
              name='nom'
              value={formData.nom}
              onChange={handleChange}
              fullWidth
              margin='normal'
              error={!!errors.nom}
              helperText={errors.nom}
              sx={{ '& .MuiInputBase-root': { borderRadius: 2 } }}
            />
            <TextField
              label='Adresse'
              name='adresse'
              value={formData.adresse}
              onChange={handleChange}
              fullWidth
              margin='normal'
              error={!!errors.adresse}
              helperText={errors.adresse}
              sx={{ '& .MuiInputBase-root': { borderRadius: 2 } }}
            />
            <TextField
              label='Ville'
              name='ville'
              value={formData.ville}
              onChange={handleChange}
              fullWidth
              margin='normal'
              error={!!errors.ville}
              helperText={errors.ville}
              sx={{ '& .MuiInputBase-root': { borderRadius: 2 } }}
            />
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button
              onClick={() => {
                setOpenEditDialog(false);
                setFormData({ nom: '', adresse: '', ville: '' });
                setEditId(null);
                setErrors({});
              }}
              sx={{
                textTransform: 'none',
                fontWeight: 500,
                color: colors.textSecondary,
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
                onClick={handleUpdateHopital}
                color='primary'
                variant='contained'
                sx={{
                  textTransform: 'none',
                  fontWeight: 500,
                  borderRadius: 2,
                  boxShadow: 'none',
                }}
              >
                Mettre à jour
              </Button>
            </motion.div>
          </DialogActions>
        </motion.div>
      </Dialog>
    </Box>
  );
};

export default AdminGererHopital;