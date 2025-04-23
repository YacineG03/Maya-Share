import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Avatar,
  Grid,
  Chip,
  Button,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import { getRendezVousByPatient, deleteRendezVous } from '../../services/api';

const PatientConsulterSuivi = () => {
  const [rendezVous, setRendezVous] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedRdvId, setSelectedRdvId] = useState(null);

  useEffect(() => {
    const fetchRendezVous = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getRendezVousByPatient();
        console.log('Réponse de getRendezVousByPatient:', response.data);
        setRendezVous(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error('Erreur lors de la récupération des rendez-vous:', error);
        const errorMessage = error.response?.data?.message || 'Erreur lors du chargement des rendez-vous';
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchRendezVous();
  }, []);

  const handleOpenDialog = (id) => {
    setSelectedRdvId(id);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedRdvId(null);
  };

  const handleCancelRendezVous = async () => {
    try {
      await deleteRendezVous(selectedRdvId);
      setRendezVous(rendezVous.filter((rdv) => rdv.idRendezVous !== selectedRdvId));
      toast.success('Rendez-vous annulé avec succès !');
      handleCloseDialog();
    } catch (error) {
      console.error('Erreur lors de l\'annulation du rendez-vous:', error);
      const errorMessage = error.response?.data?.message || 'Erreur lors de l\'annulation du rendez-vous';
      toast.error(errorMessage);
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'en attente':
        return <Chip label="En attente" color="warning" />;
      case 'accepté':
        return <Chip label="Accepté" color="success" />;
      case 'décliné':
        return <Chip label="Refusé" color="error" />;
      default:
        return <Chip label="Inconnu" color="default" />;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString || isNaN(new Date(dateString).getTime())) {
      return 'Date non spécifiée';
    }
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatTime = (dateString) => {
    if (!dateString || isNaN(new Date(dateString).getTime())) {
      return 'Heure non spécifiée';
    }
    return new Date(dateString).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Box sx={{ p: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, gap: 2 }}>
        <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
          <EventAvailableIcon fontSize="large" />
        </Avatar>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
          Consulter l'état de suivi
        </Typography>
      </Box>

      <Paper
        elevation={3}
        sx={{ p: 4, borderRadius: 3, maxWidth: 800, mx: 'auto' }}
        component={motion.div}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
          Vos rendez-vous
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : rendezVous.length === 0 ? (
          <Typography color="text.secondary">
            Aucun rendez-vous trouvé.
          </Typography>
        ) : (
          <Grid container spacing={3}>
            {rendezVous.map((rdv) => (
              <Grid item xs={12} key={rdv.idRendezVous}>
                <Paper
                  elevation={1}
                  sx={{
                    p: 3,
                    borderRadius: 2,
                    border: '1px solid #e0e0e0',
                    transition: 'all 0.3s ease',
                    '&:hover': { transform: 'translateY(-2px)', boxShadow: 3 },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Avatar sx={{ width: 56, height: 56, bgcolor: 'secondary.main' }}>
                      {rdv.nomMedecin && rdv.nomMedecin.charAt(0)}
                    </Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        Dr. {rdv.nomMedecin || 'Médecin non spécifié'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {rdv.nomHopital || 'Hôpital non spécifié'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {rdv.adresseHopital || 'Adresse non spécifiée'}
                      </Typography>
                    </Box>
                    {getStatusLabel(rdv.etat)}
                  </Box>
                  <Box>
                    <Typography variant="body2">
                      <strong>Date :</strong> {formatDate(rdv.dateRendezVous)}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Heure :</strong> {formatTime(rdv.dateRendezVous)}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Motif :</strong> {rdv.motif || 'Non spécifié'}
                    </Typography>
                    {rdv.etat === 'en attente' && (
                      <Button
                        variant="outlined"
                        color="error"
                        sx={{ mt: 2 }}
                        onClick={() => handleOpenDialog(rdv.idRendezVous)}
                      >
                        Annuler le rendez-vous
                      </Button>
                    )}
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        )}
      </Paper>

      {/* Dialog de confirmation pour l'annulation */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">Confirmer l'annulation</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Êtes-vous sûr de vouloir annuler ce rendez-vous ? Cette action est irréversible.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Annuler</Button>
          <Button onClick={handleCancelRendezVous} color="error" autoFocus>
            Confirmer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PatientConsulterSuivi;