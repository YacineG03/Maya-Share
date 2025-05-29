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
  DialogActions,
  IconButton,
  CircularProgress,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';
import {
  getHopitaux,
  createHopital,
  updateHopital,
  deleteHopital,
} from '../../services/api';

// Animation variants
const containerVariants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

const rowVariants = {
  initial: { opacity: 0, y: 10 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: [0.16, 1, 0.3, 1],
    },
  },
  hover: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    transition: { duration: 0.2 },
  },
};

const buttonVariants = {
  hover: {
    scale: 1.05,
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    transition: { duration: 0.2 },
  },
};

const dialogVariants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.16, 1, 0.3, 1],
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: 0.3 },
  },
};

function AdminGererHopital() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [hopitaux, setHopitaux] = useState([]);
  const [filteredHopitaux, setFilteredHopitaux] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false); // Chargement déclenché par le bouton
  const [isDataLoaded, setIsDataLoaded] = useState(false); // Indique si les données ont été chargées
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [formData, setFormData] = useState({
    nom: '',
    adresse: '',
    ville: '',
  });
  const [editId, setEditId] = useState(null);
  const [errors, setErrors] = useState({});

  // Filtrer les hôpitaux en fonction de la recherche
  useEffect(() => {
    if (isDataLoaded) {
      const lowerCaseSearch = search.toLowerCase();
      const filtered = hopitaux.filter(
        (hopital) =>
          hopital.nom.toLowerCase().includes(lowerCaseSearch) ||
          hopital.adresse.toLowerCase().includes(lowerCaseSearch) ||
          hopital.ville.toLowerCase().includes(lowerCaseSearch)
      );
      setFilteredHopitaux(filtered);
    }
  }, [search, hopitaux, isDataLoaded]);

  // Charger les hôpitaux après clic sur "Rafraîchir"
  const handleRefresh = async () => {
    setLoading(true);
    try {
      const response = await getHopitaux();
      setHopitaux(response.data);
      setFilteredHopitaux(response.data);
      setIsDataLoaded(true);
      toast.success('Liste des hôpitaux chargée avec succès.');
    } catch (err) {
      console.error('Erreur lors de la récupération des hôpitaux :', err);
      toast.error('Erreur lors de la récupération des hôpitaux.');
    } finally {
      setLoading(false);
    }
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

  // Ajouter un hôpital
  const handleAddHopital = async () => {
    if (!validateForm()) return;

    try {
      const response = await createHopital(formData);
      const newHopital = { id: response.data.id, ...formData };
      setHopitaux((prev) => [...prev, newHopital]);
      setFilteredHopitaux((prev) => [...prev, newHopital]);
      setOpenAddDialog(false);
      setFormData({ nom: '', adresse: '', ville: '' });
      toast.success('Hôpital ajouté avec succès.');
    } catch (err) {
      console.error('Erreur lors de l’ajout de l’hôpital :', err);
      toast.error(
        err.response?.data?.message || 'Erreur lors de l’ajout de l’hôpital.'
      );
    }
  };

  // Ouvrir le formulaire de modification
  const handleEditHopital = (hopital) => {
    setEditId(hopital.id);
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
      const updatedHopital = { id: editId, ...formData };
      setHopitaux((prev) =>
        prev.map((hopital) =>
          hopital.id === editId ? updatedHopital : hopital
        )
      );
      setFilteredHopitaux((prev) =>
        prev.map((hopital) =>
          hopital.id === editId ? updatedHopital : hopital
        )
      );
      setOpenEditDialog(false);
      setFormData({ nom: '', adresse: '', ville: '' });
      setEditId(null);
      toast.success('Hôpital mis à jour avec succès.');
    } catch (err) {
      console.error('Erreur lors de la mise à jour de l’hôpital :', err);
      toast.error(
        err.response?.data?.message ||
          'Erreur lors de la mise à jour de l’hôpital.'
      );
    }
  };

  // Supprimer un hôpital
  const handleDeleteHopital = async (id) => {
    if (!window.confirm('Voulez-vous vraiment supprimer cet hôpital ?')) return;

    try {
      await deleteHopital(id);
      setHopitaux((prev) => prev.filter((hopital) => hopital.id !== id));
      setFilteredHopitaux((prev) =>
        prev.filter((hopital) => hopital.id !== id)
      );
      toast.success('Hôpital supprimé avec succès.');
    } catch (err) {
      console.error('Erreur lors de la suppression de l’hôpital :', err);
      toast.error(
        err.response?.data?.message ||
          'Erreur lors de la suppression de l’hôpital.'
      );
    }
  };

  // Gestion de l'ouverture/fermeture des dialogues
  const handleOpenAddDialog = () => {
    setFormData({ nom: '', adresse: '', ville: '' });
    setErrors({});
    setOpenAddDialog(true);
  };

  const handleCloseAddDialog = () => {
    setOpenAddDialog(false);
    setErrors({});
  };

  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
    setFormData({ nom: '', adresse: '', ville: '' });
    setEditId(null);
    setErrors({});
  };

  return (
    <Box
      sx={{
        p: isMobile ? 2 : 3,
        background: '#FFFFFF',
        borderRadius: 3,
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
        minHeight: '100%',
      }}
    >
      <motion.div
        variants={containerVariants}
        initial='initial'
        animate='animate'
      >
        {/* Titre et description */}
        <Typography
          variant='h4'
          gutterBottom
          sx={{
            fontWeight: 600,
            color: '#1E3A8A',
            fontFamily: 'Inter, Roboto, sans-serif',
            fontSize: isMobile ? '1.5rem' : '2rem',
          }}
        >
          Gérer les hôpitaux
        </Typography>
        <Typography
          variant='body1'
          gutterBottom
          sx={{
            color: 'textSecondary',
            fontFamily: 'Inter, Roboto, sans-serif',
            mb: 3,
          }}
        >
          Ici, vous pouvez ajouter, modifier ou supprimer des hôpitaux. Cliquez
          sur "Rafraîchir" pour charger la liste.
        </Typography>

        {/* Boutons et barre de recherche */}
        <Box
          sx={{
            display: 'flex',
            gap: 2,
            mb: 3,
            flexWrap: isMobile ? 'wrap' : 'nowrap',
          }}
        >
          <motion.div variants={buttonVariants} whileHover='hover'>
            <Button
              variant='contained'
              sx={{
                background: 'linear-gradient(195deg, #1E3A8A, #3B82F6)',
                color: '#FFFFFF',
                fontFamily: 'Inter, Roboto, sans-serif',
                px: isMobile ? 2 : 3,
                py: 1.2,
                borderRadius: 2,
                '&:hover': {
                  background: 'linear-gradient(195deg, #2563EB, #60A5FA)',
                },
              }}
              onClick={handleOpenAddDialog}
            >
              Ajouter un hôpital
            </Button>
          </motion.div>
          <motion.div variants={buttonVariants} whileHover='hover'>
            <Button
              variant='contained'
              sx={{
                background: 'linear-gradient(195deg, #10B981, #34D399)',
                color: '#FFFFFF',
                fontFamily: 'Inter, Roboto, sans-serif',
                px: isMobile ? 2 : 3,
                py: 1.2,
                borderRadius: 2,
                '&:hover': {
                  background: 'linear-gradient(195deg, #059669, #10B981)',
                },
              }}
              onClick={handleRefresh}
              startIcon={<RefreshIcon />}
              aria-label='Rafraîchir la liste des hôpitaux'
            >
              Rafraîchir
            </Button>
          </motion.div>
          <TextField
            label='Rechercher un hôpital'
            value={search}
            onChange={handleSearchChange}
            fullWidth
            disabled={!isDataLoaded} // Désactiver la recherche si les données ne sont pas chargées
            sx={{
              maxWidth: isMobile ? '100%' : 400,
              fontFamily: 'Inter, Roboto, sans-serif',
              '& .MuiInputBase-root': {
                borderRadius: 2,
              },
            }}
          />
        </Box>

        {/* Contenu principal */}
        {loading ? (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              py: 4,
            }}
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1], opacity: [0.8, 1, 0.8] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <CircularProgress sx={{ color: '#2563EB' }} />
            </motion.div>
          </Box>
        ) : !isDataLoaded ? (
          <Box
            sx={{
              textAlign: 'center',
              py: 4,
              fontFamily: 'Inter, Roboto, sans-serif',
            }}
            aria-live='polite'
          >
            <Typography
              variant='body1'
              sx={{
                color: 'textSecondary',
                fontSize: isMobile ? '0.9rem' : '1rem',
              }}
            >
              Cliquez sur "Rafraîchir" pour charger la liste des hôpitaux.
            </Typography>
          </Box>
        ) : (
          <TableContainer
            component={Paper}
            sx={{
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(8px)',
              borderRadius: 3,
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
              overflowX: 'auto',
            }}
          >
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell
                    sx={{
                      fontWeight: 600,
                      color: '#1E3A8A',
                      fontFamily: 'Inter, Roboto, sans-serif',
                      fontSize: isMobile ? '0.85rem' : '0.9rem',
                    }}
                  >
                    Nom
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 600,
                      color: '#1E3A8A',
                      fontFamily: 'Inter, Roboto, sans-serif',
                      fontSize: isMobile ? '0.85rem' : '0.9rem',
                    }}
                  >
                    Adresse
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 600,
                      color: '#1E3A8A',
                      fontFamily: 'Inter, Roboto, sans-serif',
                      fontSize: isMobile ? '0.85rem' : '0.9rem',
                    }}
                  >
                    Ville
                  </TableCell>
                  <TableCell
                    align='right'
                    sx={{
                      fontWeight: 600,
                      color: '#1E3A8A',
                      fontFamily: 'Inter, Roboto, sans-serif',
                      fontSize: isMobile ? '0.85rem' : '0.9rem',
                    }}
                  >
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredHopitaux.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      align='center'
                      sx={{ fontFamily: 'Inter, Roboto, sans-serif', py: 4 }}
                      aria-live='polite'
                    >
                      Aucun hôpital trouvé.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredHopitaux.map((hopital) => (
                    <motion.tr
                      key={hopital.id}
                      variants={rowVariants}
                      initial='initial'
                      animate='animate'
                      whileHover='hover'
                      style={{ cursor: 'pointer' }}
                    >
                      <TableCell
                        sx={{
                          fontFamily: 'Inter, Roboto, sans-serif',
                          fontSize: isMobile ? '0.8rem' : '0.9rem',
                        }}
                      >
                        {hopital.nom}
                      </TableCell>
                      <TableCell
                        sx={{
                          fontFamily: 'Inter, Roboto, sans-serif',
                          fontSize: isMobile ? '0.8rem' : '0.9rem',
                        }}
                      >
                        {hopital.adresse}
                      </TableCell>
                      <TableCell
                        sx={{
                          fontFamily: 'Inter, Roboto, sans-serif',
                          fontSize: isMobile ? '0.8rem' : '0.9rem',
                        }}
                      >
                        {hopital.ville}
                      </TableCell>
                      <TableCell align='right'>
                        <motion.div
                          whileHover={{ scale: 1.2, rotate: 10 }}
                          transition={{ duration: 0.2 }}
                        >
                          <IconButton
                            color='primary'
                            onClick={() => handleEditHopital(hopital)}
                            aria-label={`Modifier l'hôpital ${hopital.nom}`}
                          >
                            <EditIcon />
                          </IconButton>
                        </motion.div>
                        <motion.div
                          whileHover={{ scale: 1.2, rotate: -10 }}
                          transition={{ duration: 0.2 }}
                        >
                          <IconButton
                            color='error'
                            onClick={() => handleDeleteHopital(hopital.id)}
                            aria-label={`Supprimer l'hôpital ${hopital.nom}`}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </motion.div>
                      </TableCell>
                    </motion.tr>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </motion.div>

      {/* Dialogue pour ajouter un hôpital */}
      <Dialog open={openAddDialog} onClose={handleCloseAddDialog}>
        <motion.div
          variants={dialogVariants}
          initial='initial'
          animate='animate'
          exit='exit'
        >
          <DialogTitle
            sx={{
              fontWeight: 600,
              color: '#1E3A8A',
              fontFamily: 'Inter, Roboto, sans-serif',
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(8px)',
            }}
          >
            Ajouter un hôpital
          </DialogTitle>
          <DialogContent
            sx={{
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(8px)',
              fontFamily: 'Inter, Roboto, sans-serif',
            }}
          >
            <TextField
              label='Nom'
              name='nom'
              value={formData.nom}
              onChange={handleChange}
              fullWidth
              margin='normal'
              error={!!errors.nom}
              helperText={errors.nom}
              aria-required='true'
              aria-describedby={errors.nom ? 'nom-error' : undefined}
              sx={{ fontFamily: 'Inter, Roboto, sans-serif' }}
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
              aria-required='true'
              aria-describedby={errors.adresse ? 'adresse-error' : undefined}
              sx={{ fontFamily: 'Inter, Roboto, sans-serif' }}
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
              aria-required='true'
              aria-describedby={errors.ville ? 'ville-error' : undefined}
              sx={{ fontFamily: 'Inter, Roboto, sans-serif' }}
            />
          </DialogContent>
          <DialogActions
            sx={{
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(8px)',
              p: 2,
            }}
          >
            <motion.div variants={buttonVariants} whileHover='hover'>
              <Button
                onClick={handleCloseAddDialog}
                sx={{
                  fontFamily: 'Inter, Roboto, sans-serif',
                  color: '#1E3A8A',
                }}
              >
                Annuler
              </Button>
            </motion.div>
            <motion.div variants={buttonVariants} whileHover='hover'>
              <Button
                onClick={handleAddHopital}
                variant='contained'
                sx={{
                  background: 'linear-gradient(195deg, #1E3A8A, #3B82F6)',
                  color: '#FFFFFF',
                  fontFamily: 'Inter, Roboto, sans-serif',
                  '&:hover': {
                    background: 'linear-gradient(195deg, #2563EB, #60A5FA)',
                  },
                }}
              >
                Ajouter
              </Button>
            </motion.div>
          </DialogActions>
        </motion.div>
      </Dialog>

      {/* Dialogue pour modifier un hôpital */}
      <Dialog open={openEditDialog} onClose={handleCloseEditDialog}>
        <motion.div
          variants={dialogVariants}
          initial='initial'
          animate='animate'
          exit='exit'
        >
          <DialogTitle
            sx={{
              fontWeight: 600,
              color: '#1E3A8A',
              fontFamily: 'Inter, Roboto, sans-serif',
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(8px)',
            }}
          >
            Modifier un hôpital
          </DialogTitle>
          <DialogContent
            sx={{
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(8px)',
              fontFamily: 'Inter, Roboto, sans-serif',
            }}
          >
            <TextField
              label='Nom'
              name='nom'
              value={formData.nom}
              onChange={handleChange}
              fullWidth
              margin='normal'
              error={!!errors.nom}
              helperText={errors.nom}
              aria-required='true'
              aria-describedby={errors.nom ? 'nom-error' : undefined}
              sx={{ fontFamily: 'Inter, Roboto, sans-serif' }}
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
              aria-required='true'
              aria-describedby={errors.adresse ? 'adresse-error' : undefined}
              sx={{ fontFamily: 'Inter, Roboto, sans-serif' }}
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
              aria-required='true'
              aria-describedby={errors.ville ? 'ville-error' : undefined}
              sx={{ fontFamily: 'Inter, Roboto, sans-serif' }}
            />
          </DialogContent>
          <DialogActions
            sx={{
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(8px)',
              p: 2,
            }}
          >
            <motion.div variants={buttonVariants} whileHover='hover'>
              <Button
                onClick={handleCloseEditDialog}
                sx={{
                  fontFamily: 'Inter, Roboto, sans-serif',
                  color: '#1E3A8A',
                }}
              >
                Annuler
              </Button>
            </motion.div>
            <motion.div variants={buttonVariants} whileHover='hover'>
              <Button
                onClick={handleUpdateHopital}
                variant='contained'
                sx={{
                  background: 'linear-gradient(195deg, #1E3A8A, #3B82F6)',
                  color: '#FFFFFF',
                  fontFamily: 'Inter, Roboto, sans-serif',
                  '&:hover': {
                    background: 'linear-gradient(195deg, #2563EB, #60A5FA)',
                  },
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
}

export default AdminGererHopital;
