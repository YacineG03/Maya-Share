"use client"

import { useState, useEffect } from "react"
import {
  Box,
  Typography,
  Paper,
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
  Card,
  CardContent,
  CardActions,
  Divider,
  Badge,
  useTheme,
  useMediaQuery,
  Tabs,
  Tab,
  Skeleton,
} from "@mui/material"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "react-toastify"
import EventAvailableIcon from "@mui/icons-material/EventAvailable"
import CancelIcon from "@mui/icons-material/Cancel"
import AccessTimeIcon from "@mui/icons-material/AccessTime"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import PersonIcon from "@mui/icons-material/Person"
import LocationOnIcon from "@mui/icons-material/LocationOn"
import NoteIcon from "@mui/icons-material/Note"
import RefreshIcon from "@mui/icons-material/Refresh"
import CalendarTodayIcon from "@mui/icons-material/CalendarToday"
import ScheduleIcon from "@mui/icons-material/Schedule"
import { getRendezVousByPatient, updateRendezVous } from "../../services/api"

// Palette de couleurs modernisée
const colors = {
  primary: "#0077B6",
  primaryLight: "#0096C7",
  secondary: "#00B4D8",
  secondaryLight: "#48CAE4",
  background: "#F8F9FA",
  cardBackground: "white",
  cardBackgroundHover: "#F9FAFB",
  text: "#1A202C",
  textSecondary: "#4A5568",
  success: "#10B981",
  error: "#EF4444",
  warning: "#F59E0B",
  info: "#3B82F6",
  divider: "rgba(0, 0, 0, 0.08)",
  shadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
  shadowHover: "0 8px 30px rgba(0, 0, 0, 0.12)",
  hover: "rgba(0, 119, 182, 0.05)",
}

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.5,
      when: "beforeChildren",
      staggerChildren: 0.1,
    },
  },
}

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
}

const buttonVariants = {
  hover: {
    scale: 1.05,
    transition: { duration: 0.2 },
  },
  tap: {
    scale: 0.98,
    transition: { duration: 0.1 },
  },
}

const PatientConsulterSuivi = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))
  const isSmall = useMediaQuery(theme.breakpoints.down("sm"))

  const [rendezVous, setRendezVous] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState(null)
  const [openDialog, setOpenDialog] = useState(false)
  const [selectedRdvId, setSelectedRdvId] = useState(null)
  const [activeTab, setActiveTab] = useState("tous")
  const [expandedRdv, setExpandedRdv] = useState(null)

  useEffect(() => {
    fetchRendezVous()
  }, [])

  const fetchRendezVous = async () => {
    try {
      setLoading(true)
      setRefreshing(true)
      setError(null)
      const response = await getRendezVousByPatient()
      console.log("Réponse de getRendezVousByPatient:", response.data)
      setRendezVous(Array.isArray(response.data) ? response.data : [])
    } catch (error) {
      console.error("Erreur lors de la récupération des rendez-vous:", error)
      const errorMessage = error.response?.data?.message || "Erreur lors du chargement des rendez-vous"
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
      setTimeout(() => setRefreshing(false), 500)
    }
  }

  const handleOpenDialog = (id) => {
    setSelectedRdvId(id)
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setSelectedRdvId(null)
  }

  const handleCancelRendezVous = async () => {
    try {
      await updateRendezVous(selectedRdvId, { etat: "annulé", commentaire: "Annulation demandée par le patient" })
      setRendezVous(rendezVous.map((rdv) => (rdv.idRendezVous === selectedRdvId ? { ...rdv, etat: "annulé" } : rdv)))
      toast.success("Rendez-vous annulé avec succès !")
      handleCloseDialog()
    } catch (error) {
      console.error("Erreur lors de l'annulation du rendez-vous:", error)
      const errorMessage =
        error.response?.data?.message ||
        "Une erreur est survenue lors de l'annulation. Veuillez réessayer ou contacter le support."
      setError(errorMessage)
      toast.error(errorMessage)
    }
  }

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue)
  }

  const handleToggleExpand = (rdvId) => {
    setExpandedRdv(expandedRdv === rdvId ? null : rdvId)
  }

  const getStatusLabel = (status) => {
    switch (status) {
      case "en attente":
        return (
          <Chip
            label="En attente"
            color="warning"
            icon={<AccessTimeIcon />}
            sx={{
              fontWeight: 500,
              "& .MuiChip-icon": { fontSize: "1rem" },
            }}
          />
        )
      case "accepté":
        return (
          <Chip
            label="Accepté"
            color="success"
            icon={<CheckCircleIcon />}
            sx={{
              fontWeight: 500,
              "& .MuiChip-icon": { fontSize: "1rem" },
            }}
          />
        )
      case "décliné":
        return (
          <Chip
            label="Refusé"
            color="error"
            icon={<CancelIcon />}
            sx={{
              fontWeight: 500,
              "& .MuiChip-icon": { fontSize: "1rem" },
            }}
          />
        )
      case "annulé":
        return <Chip label="Annulé" color="default" sx={{ fontWeight: 500 }} />
      default:
        return <Chip label="Inconnu" color="default" sx={{ fontWeight: 500 }} />
    }
  }

  const formatDate = (dateString) => {
    if (!dateString || isNaN(new Date(dateString).getTime())) {
      return "Date non spécifiée"
    }
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  const formatTime = (dateString) => {
    if (!dateString || isNaN(new Date(dateString).getTime())) {
      return "Heure non spécifiée"
    }
    return new Date(dateString).toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Filtrer les rendez-vous selon l'onglet actif
  const filteredRendezVous = rendezVous.filter((rdv) => {
    if (activeTab === "tous") return true
    return rdv.etat === activeTab
  })

  // Rendu des squelettes de chargement
  const renderSkeletons = () => {
    return Array.from(new Array(3)).map((_, index) => (
      <Card
        key={`skeleton-${index}`}
        sx={{
          mb: 3,
          borderRadius: 3,
          boxShadow: colors.shadow,
        }}
      >
        <CardContent>
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <Skeleton variant="circular" width={56} height={56} sx={{ mr: 2 }} />
            <Box sx={{ flex: 1 }}>
              <Skeleton variant="text" width="60%" height={28} />
              <Skeleton variant="text" width="40%" height={20} />
            </Box>
            <Skeleton variant="rectangular" width={100} height={32} sx={{ borderRadius: 1 }} />
          </Box>
          <Skeleton variant="rectangular" width="100%" height={100} sx={{ borderRadius: 2 }} />
        </CardContent>
      </Card>
    ))
  }

  if (loading && !refreshing) {
    return (
      <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: colors.background, height: "100%" }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 4, gap: 2 }}>
          <Skeleton variant="circular" width={56} height={56} />
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width="40%" height={40} />
            <Skeleton variant="text" width="20%" height={24} />
          </Box>
        </Box>

        <Skeleton variant="rectangular" width="100%" height={48} sx={{ borderRadius: 2, mb: 3 }} />
        {renderSkeletons()}
      </Box>
    )
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: colors.background, minHeight: "100vh" }}>
      <motion.div variants={containerVariants} initial="hidden" animate="visible">
        <Box sx={{ display: "flex", alignItems: "center", mb: 4, gap: 2 }}>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 20,
              duration: 0.5,
            }}
          >
            <Badge
              overlap="circular"
              badgeContent={rendezVous.length}
              color="primary"
              sx={{
                "& .MuiBadge-badge": {
                  fontWeight: "bold",
                  fontSize: "0.8rem",
                },
              }}
            >
              <Avatar sx={{ bgcolor: colors.primary, width: 56, height: 56 }}>
                <EventAvailableIcon fontSize="large" />
              </Avatar>
            </Badge>
          </motion.div>
          <Box>
            <Typography
              variant="h4"
              component="h1"
              sx={{
                fontWeight: 700,
                color: colors.text,
                fontSize: { xs: "1.5rem", sm: "2rem", md: "2.25rem" },
              }}
            >
              Suivi des rendez-vous
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
              {rendezVous.length} rendez-vous {activeTab !== "tous" ? `(${activeTab})` : "au total"}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ mb: 3, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant={isMobile ? "scrollable" : "standard"}
            scrollButtons={isMobile ? "auto" : false}
            sx={{
              "& .MuiTab-root": {
                textTransform: "none",
                fontWeight: 500,
                minWidth: "auto",
                px: { xs: 2, sm: 3 },
              },
              "& .Mui-selected": {
                color: `${colors.primary} !important`,
              },
              "& .MuiTabs-indicator": {
                backgroundColor: colors.primary,
                height: 3,
                borderRadius: "3px 3px 0 0",
              },
            }}
          >
            <Tab label="Tous" value="tous" />
            <Tab label="En attente" value="en attente" />
            <Tab label="Acceptés" value="accepté" />
            <Tab label="Refusés" value="décliné" />
            <Tab label="Annulés" value="annulé" />
          </Tabs>

          <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
            <Button
              variant="outlined"
              color="primary"
              startIcon={<RefreshIcon />}
              onClick={fetchRendezVous}
              disabled={refreshing}
              sx={{
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 500,
                display: { xs: "none", md: "flex" },
              }}
            >
              {refreshing ? "Actualisation..." : "Actualiser"}
            </Button>
          </motion.div>
        </Box>

        {error && (
          <Alert
            severity="error"
            sx={{
              mb: 3,
              borderRadius: 2,
              "& .MuiAlert-icon": {
                alignItems: "center",
              },
            }}
          >
            {error}
          </Alert>
        )}

        {filteredRendezVous.length === 0 ? (
          <Paper
            sx={{
              textAlign: "center",
              py: 6,
              px: 3,
              borderRadius: 3,
              boxShadow: colors.shadow,
              bgcolor: "white",
            }}
          >
            <EventAvailableIcon sx={{ fontSize: 60, color: colors.textSecondary, opacity: 0.5, mb: 2 }} />
            <Typography variant="h6" color={colors.textSecondary} sx={{ mb: 2 }}>
              Aucun rendez-vous {activeTab !== "tous" ? activeTab : ""} trouvé.
            </Typography>
            <motion.div whileHover="hover" whileTap="tap" variants={buttonVariants}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<RefreshIcon />}
                onClick={fetchRendezVous}
                sx={{
                  bgcolor: colors.primary,
                  "&:hover": { bgcolor: colors.primaryLight },
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: 500,
                  boxShadow: "none",
                }}
              >
                Rafraîchir
              </Button>
            </motion.div>
          </Paper>
        ) : (
          <AnimatePresence>
            <Grid container spacing={3}>
              {filteredRendezVous.map((rdv, index) => (
                <Grid item xs={12} md={6} lg={4} key={rdv.idRendezVous}>
                  <motion.div
                    custom={index}
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    whileHover="hover"
                  >
                    <Card
                      sx={{
                        borderRadius: 3,
                        boxShadow: colors.shadow,
                        overflow: "visible",
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        transition: "all 0.3s ease",
                        border: "1px solid",
                        borderColor: "transparent",
                        "&:hover": {
                          borderColor: "rgba(0, 119, 182, 0.1)",
                        },
                      }}
                    >
                      <CardContent sx={{ p: 3, flexGrow: 1 }}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                            <Avatar
                              sx={{
                                bgcolor: colors.primary,
                                width: 56,
                                height: 56,
                              }}
                            >
                              <PersonIcon fontSize="large" />
                            </Avatar>
                            <Box>
                              <Typography variant="h6" sx={{ fontWeight: 600, color: colors.text }}>
                                Dr. {rdv.nomMedecin || "Non spécifié"}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {rdv.specialiteMedecin || "Spécialité non spécifiée"}
                              </Typography>
                            </Box>
                          </Box>
                          {getStatusLabel(rdv.etat)}
                        </Box>

                        <Divider sx={{ my: 2 }} />

                        <Grid container spacing={2} sx={{ mb: 2 }}>
                          <Grid item xs={6}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                              <CalendarTodayIcon sx={{ color: colors.primary }} />
                              <Box>
                                <Typography variant="caption" color="text.secondary">
                                  Date
                                </Typography>
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                  {formatDate(rdv.dateRendezVous)}
                                </Typography>
                              </Box>
                            </Box>
                          </Grid>
                          <Grid item xs={6}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                              <ScheduleIcon sx={{ color: colors.primary }} />
                              <Box>
                                <Typography variant="caption" color="text.secondary">
                                  Heure
                                </Typography>
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                  {formatTime(rdv.dateRendezVous)}
                                </Typography>
                              </Box>
                            </Box>
                          </Grid>
                        </Grid>

                        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1, mb: 2 }}>
                          <LocationOnIcon sx={{ color: colors.primary, mt: 0.5 }} />
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              Lieu
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {rdv.nomHopital || "Hôpital non spécifié"}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {rdv.adresseHopital || "Adresse non spécifiée"}
                            </Typography>
                          </Box>
                        </Box>

                        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
                          <NoteIcon sx={{ color: colors.primary, mt: 0.5 }} />
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              Motif
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {rdv.motif || "Non spécifié"}
                            </Typography>
                          </Box>
                        </Box>
                      </CardContent>

                      {rdv.etat === "en attente" && (
                        <CardActions sx={{ p: 3, pt: 0 }}>
                          <motion.div
                            variants={buttonVariants}
                            whileHover="hover"
                            whileTap="tap"
                            style={{ width: "100%" }}
                          >
                            <Button
                              variant="outlined"
                              color="error"
                              fullWidth
                              onClick={() => handleOpenDialog(rdv.idRendezVous)}
                              sx={{
                                borderRadius: 2,
                                textTransform: "none",
                                fontWeight: 500,
                              }}
                            >
                              Annuler le rendez-vous
                            </Button>
                          </motion.div>
                        </CardActions>
                      )}
                    </Card>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </AnimatePresence>
        )}
      </motion.div>

      {/* Dialog de confirmation pour l'annulation */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: colors.shadowHover,
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 600, pt: 3 }}>Confirmer l'annulation</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Êtes-vous sûr de vouloir annuler ce rendez-vous ? Cette action est irréversible.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button
            onClick={handleCloseDialog}
            sx={{
              color: colors.text,
              textTransform: "none",
              fontWeight: 500,
            }}
          >
            Annuler
          </Button>
          <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
            <Button
              onClick={handleCancelRendezVous}
              color="error"
              variant="contained"
              sx={{
                bgcolor: colors.error,
                "&:hover": { bgcolor: "#FF5252" },
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 500,
                boxShadow: "none",
              }}
            >
              Confirmer l'annulation
            </Button>
          </motion.div>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default PatientConsulterSuivi
