// src/components/Patient/PatientPrendreRDV.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  Paper,
  CircularProgress,
  Avatar,
  Grid
} from '@mui/material';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import { getHopitaux, createRendezVous } from '../../services/api';

const PatientPrendreRDV = () => {
  const [hopitaux, setHopitaux] = useState([]);
  const [medecins, setMedecins] = useState([]);
  const [loadingMedecins, setLoadingMedecins] = useState(true);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [selectedMedecin, setSelectedMedecin] = useState('');
  const [date, setDate] = useState('');
  const [heure, setHeure] = useState('');
  const [motif, setMotif] = useState('');
  const [etape, setEtape] = useState(1);

  useEffect(() => {
    const fetchHopitauxEtMedecins = async () => {
      try {
        const response = await getHopitaux();
        console.log('Réponse de getHopitaux:', response.data);
        setHopitaux(response.data);

        // Extraire tous les médecins de tous les hôpitaux
        const allMedecins = response.data.flatMap(hopital =>
          (hopital.medecins || []).map(medecin => ({
            ...medecin,
            hopitalNom: hopital.nom,
            hopitalAdresse: hopital.adresse,
          }))
        );

        console.log('Médecins extraits:', allMedecins);
        setMedecins(allMedecins);
        setLoadingMedecins(false);
      } catch (error) {
        console.error('Erreur lors de la récupération des hôpitaux:', error);
        const errorMessage = error.response?.data?.message || 'Erreur lors du chargement des hôpitaux';
        toast.error(errorMessage);
        setLoadingMedecins(false);
      }
    };

    fetchHopitauxEtMedecins();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedMedecin || !date || !heure || !motif) {
      toast.warning('Veuillez remplir tous les champs');
      return;
    }

    // Combiner date et heure
    const dateTime = `${date}T${heure}:00`;

    try {
      setLoadingSubmit(true);
      await createRendezVous({
        idMedecin: selectedMedecin,
        dateRendezVous: dateTime,
        motif,
      });

      toast.success('Rendez-vous créé avec succès !');
      setSelectedMedecin('');
      setDate('');
      setHeure('');
      setMotif('');
      setEtape(1);
    } catch (error) {
      console.error('Erreur lors de la création du rendez-vous:', error);
      const errorMessage = error.response?.data?.message || 'Erreur lors de la création du rendez-vous';
      toast.error(errorMessage);
    } finally {
      setLoadingSubmit(false);
    }
  };

  const getMedecinById = (id) => {
    return medecins.find(medecin => medecin.id === id) || {};
  };

  return (
    <Box sx={{ p: 4 }}>
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        mb: 4,
        gap: 2
      }}>
        <Avatar sx={{
          bgcolor: 'primary.main',
          width: 56,
          height: 56
        }}>
          <EventAvailableIcon fontSize="large" />
        </Avatar>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
          Prendre un rendez-vous
        </Typography>
      </Box>

      <Paper
        elevation={3}
        sx={{
          p: 4,
          borderRadius: 3,
          maxWidth: 800,
          mx: 'auto'
        }}
        component={motion.div}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {etape === 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
              Sélectionnez un médecin
            </Typography>

            {loadingMedecins ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : medecins.length === 0 ? (
              <Typography color="text.secondary">
                Aucun médecin disponible pour le moment.
              </Typography>
            ) : (
              <Grid container spacing={3}>
                {medecins.map((medecin) => (
                  <Grid item xs={12} sm={6} key={medecin.id}>
                    <Paper
                      elevation={selectedMedecin === medecin.id ? 4 : 1}
                      onClick={() => setSelectedMedecin(medecin.id)}
                      sx={{
                        p: 3,
                        borderRadius: 2,
                        cursor: 'pointer',
                        border: selectedMedecin === medecin.id ? '2px solid primary.main' : '1px solid #e0e0e0',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: 3,
                        },
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar
                          sx={{ width: 56, height: 56, bgcolor: 'secondary.main' }}
                        >
                          {medecin.prenom?.charAt(0)}{medecin.nom?.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            Dr. {medecin.prenom} {medecin.nom}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {medecin.specialite || 'Non spécifié'}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {medecin.hopitalNom || 'Non spécifié'}
                          </Typography>
                        </Box>
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            )}

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
              <Button
                variant="contained"
                disabled={!selectedMedecin}
                onClick={() => setEtape(2)}
                sx={{ px: 4, py: 1.5 }}
              >
                Suivant
              </Button>
            </Box>
          </motion.div>
        )}

        {etape === 2 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Button
                onClick={() => setEtape(1)}
                sx={{ mr: 2 }}
              >
                Retour
              </Button>
              <Typography variant="h6">
                Choisissez la date et l'heure
              </Typography>
            </Box>

            <Box sx={{ mb: 4 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                Médecin sélectionné :
              </Typography>
              {selectedMedecin && (
                <Box sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  p: 2,
                  backgroundColor: '#f5f5f5',
                  borderRadius: 2
                }}>
                  <Avatar
                    sx={{ width: 48, height: 48, bgcolor: 'secondary.main' }}
                  >
                    {getMedecinById(selectedMedecin)?.prenom?.charAt(0)}{getMedecinById(selectedMedecin)?.nom?.charAt(0)}
                  </Avatar>
                  <Box>
                    <Typography>
                      Dr. {getMedecinById(selectedMedecin)?.prenom} {getMedecinById(selectedMedecin)?.nom}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {getMedecinById(selectedMedecin)?.specialite || 'Non spécifié'}
                    </Typography>
                  </Box>
                </Box>
              )}
            </Box>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Date du rendez-vous"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                  sx={{ mb: 2 }}
                  inputProps={{ min: new Date().toISOString().split('T')[0] }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Heure du rendez-vous"
                  type="time"
                  value={heure}
                  onChange={(e) => setHeure(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                  sx={{ mb: 2 }}
                  inputProps={{ step: 900 }} // 15 minutes
                />
              </Grid>
            </Grid>

            <TextField
              label="Motif de la consultation"
              value={motif}
              onChange={(e) => setMotif(e.target.value)}
              multiline
              rows={4}
              fullWidth
              sx={{ mt: 2 }}
            />

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
              <Button
                variant="contained"
                disabled={!date || !heure || !motif || loadingSubmit}
                onClick={handleSubmit}
                sx={{ px: 4, py: 1.5 }}
                startIcon={loadingSubmit ? <CircularProgress size={20} color="inherit" /> : null}
              >
                {loadingSubmit ? 'Envoi en cours...' : 'Confirmer le rendez-vous'}
              </Button>
            </Box>
          </motion.div>
        )}
      </Paper>
    </Box>
  );
};

export default PatientPrendreRDV;
