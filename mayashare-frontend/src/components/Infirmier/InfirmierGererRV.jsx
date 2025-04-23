// src/components/Infirmier/InfirmierGererRV.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
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
} from '@mui/material';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import { getRendezVousForInfirmier, acceptRendezVous, declineRendezVous, deleteRendezVous } from '../../services/api';

const InfirmierGererRV = () => {
  const [rendezVous, setRendezVous] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedRdv, setSelectedRdv] = useState(null);
  const [actionType, setActionType] = useState('');
  const [commentaire, setCommentaire] = useState('');
  const [filter, setFilter] = useState('tous');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await getRendezVousForInfirmier();
        console.log('Réponse API complète:', response);
        // Gérer les deux cas : tableau direct ou objet avec rendezVous
        const data = Array.isArray(response) ? response : response.rendezVous || [];
        console.log('Rendez-vous extraits:', data);
        setRendezVous(data);
        setError(null);
      } catch (err) {
        console.error('Erreur lors de la récupération des rendez-vous:', err);
        const errorMessage = err.response?.data?.message || 'Erreur de chargement des rendez-vous';
        setError(errorMessage);
        toast.error(errorMessage);
        setRendezVous([]); // Assurer que rendezVous reste un tableau en cas d'erreur
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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
            toast.error('Un commentaire est requis pour refuser un rendez-vous');
            return;
          }
          await declineRendezVous(selectedRdv.idRendezVous, { commentaire });
          toast.success('Rendez-vous refusé avec succès');
          break;
        case 'delete':
          await deleteRendezVous(selectedRdv.idRendezVous);
          toast.success('Rendez-vous supprimé avec succès');
          break;
        default:
          break;
      }

      const response = await getRendezVousForInfirmier();
      const data = Array.isArray(response) ? response : response.rendezVous || [];
      setRendezVous(data);
      setOpenDialog(false);
      setSelectedRdv(null);
      setActionType('');
      setCommentaire('');
    } catch (err) {
      console.error('Erreur lors de l’action:', err);
      const errorMessage = err.response?.data?.message || 'Une erreur est survenue';
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
    if (!dateString) return 'Non spécifié';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
  };

  const formatTime = (dateString) => {
    if (!dateString) return 'Non spécifié';
    const date = new Date(dateString);
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  const filteredRendezVous = rendezVous.filter(rdv => 
    filter === 'tous' || rdv.etat === filter
  );

  return (
    <Box sx={{ p: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, gap: 2 }}>
        <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
          <EventAvailableIcon fontSize="large" />
        </Avatar>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
          Gestion des rendez-vous
        </Typography>
      </Box>

      <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Liste des rendez-vous
          </Typography>
          <TextField
            select
            label="Filtrer par statut"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            size="small"
            sx={{ minWidth: 150 }}
          >
            <MenuItem value="tous">Tous</MenuItem>
            <MenuItem value="en attente">En attente</MenuItem>
            <MenuItem value="accepté">Acceptés</MenuItem>
            <MenuItem value="refusé">Refusés</MenuItem>
          </TextField>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : filteredRendezVous.length === 0 ? (
          <Typography color="text.secondary">
            Aucun rendez-vous trouvé.
          </Typography>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Patient</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Heure</TableCell>
                  <TableCell>Motif</TableCell>
                  <TableCell>Statut</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredRendezVous.map((rdv) => (
                  <TableRow key={rdv.idRendezVous}>
                    <TableCell>{rdv.nomPatient} {rdv.prenomPatient}</TableCell>
                    <TableCell>{formatDate(rdv.dateRendezVous)}</TableCell>
                    <TableCell>{formatTime(rdv.dateRendezVous)}</TableCell>
                    <TableCell>{rdv.motif || 'Non spécifié'}</TableCell>
                    <TableCell>{getStatusLabel(rdv.etat)}</TableCell>
                    <TableCell>
                      {rdv.etat === 'en attente' && (
                        <>
                          <Button
                            variant="contained"
                            color="success"
                            size="small"
                            sx={{ mr: 1 }}
                            onClick={() => {
                              setSelectedRdv(rdv);
                              setActionType('accept');
                              setOpenDialog(true);
                            }}
                          >
                            Accepter
                          </Button>
                          <Button
                            variant="outlined"
                            color="error"
                            size="small"
                            sx={{ mr: 1 }}
                            onClick={() => {
                              setSelectedRdv(rdv);
                              setActionType('decline');
                              setOpenDialog(true);
                            }}
                          >
                            Refuser
                          </Button>
                        </>
                      )}
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        onClick={() => {
                          setSelectedRdv(rdv);
                          setActionType('delete');
                          setOpenDialog(true);
                        }}
                      >
                        Supprimer
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        aria-labelledby="alert-dialog-title"
      >
        <DialogTitle id="alert-dialog-title">
          {actionType === 'accept' && 'Accepter le rendez-vous'}
          {actionType === 'decline' && 'Refuser le rendez-vous'}
          {actionType === 'delete' && 'Supprimer le rendez-vous'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            {actionType === 'accept' && `Voulez-vous accepter le rendez-vous de ${selectedRdv?.nomPatient} prévu le ${formatDate(selectedRdv?.dateRendezVous)} ?`}
            {actionType === 'decline' && `Voulez-vous refuser le rendez-vous de ${selectedRdv?.nomPatient} prévu le ${formatDate(selectedRdv?.dateRendezVous)} ?`}
            {actionType === 'delete' && `Voulez-vous vraiment supprimer ce rendez-vous ? Cette action est irréversible.`}
          </DialogContentText>
          
          {(actionType === 'accept' || actionType === 'decline') && (
            <TextField
              autoFocus
              margin="dense"
              label="Commentaire"
              type="text"
              fullWidth
              variant="standard"
              value={commentaire}
              onChange={(e) => setCommentaire(e.target.value)}
              multiline
              rows={3}
              required={actionType === 'decline'}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Annuler</Button>
          <Button 
            onClick={handleAction} 
            color={actionType === 'delete' ? 'error' : 'primary'}
            autoFocus
          >
            Confirmer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default InfirmierGererRV;