import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  CircularProgress,
  Alert,
  Avatar,
  Chip,
  IconButton,
  Tooltip,
  Divider,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import ImageIcon from '@mui/icons-material/Image';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { motion, AnimatePresence } from 'framer-motion';
import { getDossiersByPatient, getImagesByDossier } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

// Palette de couleurs enrichie
const colors = {
  primary: '#0077B6',
  secondary: '#00B4D8',
  background: 'linear-gradient(135deg, #F8F9FA 0%, #E9ECEF 100%)',
  cardBackground: 'linear-gradient(145deg, #FFFFFF 0%, #F9FAFB 100%)',
  text: '#1A202C',
  textSecondary: '#4A5568',
  success: '#34C759',
  divider: 'rgba(0, 0, 0, 0.08)',
  shadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
};

// Animation variants
const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  }),
  hover: { scale: 1.03, boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)', transition: { duration: 0.3 } },
};

const expandVariants = {
  hidden: { height: 0, opacity: 0 },
  visible: { height: 'auto', opacity: 1, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
  exit: { height: 0, opacity: 0, transition: { duration: 0.3 } },
};

const buttonVariants = {
  hover: { scale: 1.05, backgroundColor: colors.secondary, transition: { duration: 0.2 } },
  tap: { scale: 0.98, transition: { duration: 0.1 } },
};

const PatientConsulterDossier = () => {
  const [dossiers, setDossiers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imagesMap, setImagesMap] = useState({});
  const [expandedDossier, setExpandedDossier] = useState(null);
  const navigate = useNavigate();

  const fetchDossiers = async () => {
    try {
      setLoading(true);
      const response = await getDossiersByPatient();
      const data = response.data.dossiers || [];
      console.log('Dossiers reçus:', data);
      setDossiers(data);

      const imagePromises = data.map((dossier) =>
        getImagesByDossier(dossier.idDossier).then((res) => {
          console.log(`Images pour dossier ${dossier.idDossier}:`, res.data.images);
          return { idDossier: dossier.idDossier, images: res.data.images || [] };
        })
      );
      const images = await Promise.all(imagePromises);
      const imagesMapping = images.reduce((acc, { idDossier, images }) => {
        acc[idDossier] = images;
        return acc;
      }, {});
      setImagesMap(imagesMapping);

      setError(null);
    } catch (err) {
      console.error('Erreur lors de fetchDossiers:', err);
      if (err.response?.status === 401) {
        toast.error('Session expirée. Veuillez vous reconnecter.');
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        setError('Erreur lors de la récupération des dossiers.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDossiers();
  }, [navigate]);

  const formatDate = (dateString) => {
    if (!dateString) return 'Non spécifié';
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const handleToggleExpand = (dossier) => {
    setExpandedDossier(expandedDossier?.idDossier === dossier.idDossier ? null : dossier);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', bgcolor: colors.background }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <CircularProgress size={60} sx={{ color: colors.primary }} thickness={5} />
          <Typography sx={{ mt: 2, color: colors.text, fontWeight: 500, letterSpacing: 0.5 }}>
            Chargement des dossiers...
          </Typography>
        </motion.div>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4, bgcolor: colors.background, minHeight: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: colors.text, letterSpacing: -0.5 }}>
          Consulter un dossier médical
        </Typography>
        <motion.div whileHover="hover" whileTap="tap" variants={buttonVariants}>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<RefreshIcon />}
            onClick={fetchDossiers}
            disabled={loading}
            sx={{
              borderColor: colors.primary,
              color: colors.primary,
              '&:hover': { borderColor: colors.secondary, color: colors.secondary },
              borderRadius: 3,
              textTransform: 'none',
              fontWeight: 500,
              py: 1.2,
              px: 3,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            }}
          >
            Rafraîchir
          </Button>
        </motion.div>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {dossiers.length === 0 ? (
        <Box sx={{ textAlign: 'center', mt: 6 }}>
          <Typography variant="h6" color={colors.textSecondary} sx={{ mb: 2 }}>
            Aucun dossier médical trouvé.
          </Typography>
          <motion.div whileHover="hover" whileTap="tap" variants={buttonVariants}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<RefreshIcon />}
              onClick={fetchDossiers}
              sx={{
                bgcolor: colors.primary,
                '&:hover': { bgcolor: colors.secondary },
                borderRadius: 3,
                textTransform: 'none',
                fontWeight: 500,
              }}
            >
              Rafraîchir les dossiers
            </Button>
          </motion.div>
        </Box>
      ) : (
        <Box sx={{ mt: 2 }}>
          {dossiers.map((dossier, index) => {
            const isExpanded = expandedDossier?.idDossier === dossier.idDossier;
            return (
              <motion.div
                key={dossier.idDossier}
                custom={index}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                whileHover="hover"
              >
                <Paper
                  sx={{
                    p: 3,
                    mb: 3,
                    borderRadius: 4,
                    boxShadow: '0 6px 24px rgba(0, 0, 0, 0.08)',
                    bgcolor: colors.cardBackground,
                    transition: 'all 0.3s ease',
                    border: '1px solid rgba(0, 0, 0, 0.05)',
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ bgcolor: colors.primary, width: 48, height: 48, fontSize: '1.2rem' }}>
                        {dossier.patientPrenom?.charAt(0) || 'P'}
                      </Avatar>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 600, color: colors.text }}>
                          {dossier.patientNom} {dossier.patientPrenom}
                        </Typography>
                        <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                          ID Patient: {dossier.idPatient}
                        </Typography>
                      </Box>
                      <Chip
                        label={dossier.etat}
                        size="small"
                        sx={{
                          bgcolor: dossier.etat === 'en cours' ? '#FF9500' : colors.success,
                          color: 'white',
                          fontWeight: 500,
                          borderRadius: 1,
                        }}
                      />
                    </Box>
                    <IconButton onClick={() => handleToggleExpand(dossier)}>
                      {isExpanded ? <ExpandLessIcon sx={{ color: colors.primary }} /> : <ExpandMoreIcon sx={{ color: colors.primary }} />}
                    </IconButton>
                  </Box>
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        variants={expandVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                      >
                        <Divider sx={{ my: 2, bgcolor: colors.divider }} />
                        <Box sx={{ mt: 2 }}>
                          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 0.5 }}>
                                <strong>Date :</strong> {formatDate(dossier.dateCreation)}
                              </Typography>
                              <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 0.5 }}>
                                <strong>Email :</strong> {dossier.email || 'N/A'}
                              </Typography>
                              <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 0.5 }}>
                                <strong>Téléphone :</strong> {dossier.telephone || 'N/A'}
                              </Typography>
                            </Box>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 0.5 }}>
                                <strong>Diagnostic :</strong> {dossier.diagnostic}
                              </Typography>
                              <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 0.5 }}>
                                <strong>Traitement :</strong> {dossier.traitement}
                              </Typography>
                              <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 0.5 }}>
                                <strong>Médecin :</strong> {dossier.medecinNom}
                              </Typography>
                            </Box>
                          </Box>
                          <Divider sx={{ my: 2, bgcolor: colors.divider }} />
                          <Typography variant="subtitle1" sx={{ color: colors.text, fontWeight: 600, mb: 1 }}>
                            Images associées
                          </Typography>
                          {imagesMap[dossier.idDossier]?.length > 0 ? (
                            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 2 }}>
                              {imagesMap[dossier.idDossier].map((image, index) => (
                                <Paper
                                  key={index}
                                  sx={{
                                    p: 2,
                                    borderRadius: 3,
                                    bgcolor: 'white',
                                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1,
                                  }}
                                >
                                  <ImageIcon sx={{ color: colors.primary }} />
                                  <Box sx={{ flex: 1, overflow: 'hidden' }}>
                                    <Typography variant="body2" sx={{ color: colors.text, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                      {image.nomFichier}
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                                      ID: {image.idImage}
                                    </Typography>
                                  </Box>
                                  <Tooltip title="Visualiser">
                                    <IconButton
                                      component="a"
                                      href={image.url}
                                      target="_blank"
                                      sx={{ color: colors.primary, '&:hover': { color: colors.secondary } }}
                                    >
                                      <ImageIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                </Paper>
                              ))}
                            </Box>
                          ) : (
                            <Typography variant="body2" color={colors.textSecondary} sx={{ ml: 1 }}>
                              Aucune image associée à ce dossier.
                            </Typography>
                          )}
                        </Box>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Paper>
              </motion.div>
            );
          })}
        </Box>
      )}
    </Box>
  );
};

export default PatientConsulterDossier; 