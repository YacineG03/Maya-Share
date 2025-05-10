"use client"

import { useState, useEffect, useRef } from "react"
import {
  Box,
  Typography,
  Button,
  Modal,
  TextField,
  Select,
  MenuItem,
  CircularProgress,
  IconButton,
  Chip,
  Paper,
  Divider,
  Avatar,
  Tooltip,
  Grid,
  Card,
  CardContent,
  CardHeader,
  CardActions,
  Collapse,
  Badge,
  Tabs,
  Tab,
  useTheme,
  useMediaQuery,
} from "@mui/material"
import EditIcon from "@mui/icons-material/Edit"
import ImageIcon from "@mui/icons-material/Image"
import RefreshIcon from "@mui/icons-material/Refresh"
import VisibilityIcon from "@mui/icons-material/Visibility"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import DescriptionIcon from "@mui/icons-material/Description"
import PhotoIcon from "@mui/icons-material/Photo"
import MedicalServicesIcon from "@mui/icons-material/MedicalServices"
import NoteIcon from "@mui/icons-material/Note"
import FolderIcon from "@mui/icons-material/Folder"
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth"
import LocalHospitalIcon from "@mui/icons-material/LocalHospital"
import DownloadIcon from "@mui/icons-material/Download"
import SearchIcon from "@mui/icons-material/Search"
import FilterListIcon from "@mui/icons-material/FilterList"
import { toast } from "react-toastify"
import { motion } from "framer-motion"
import {
  getDossiersForInfirmier,
  updateDossier,
  uploadImage,
  deleteImage,
  getImagesByDossier,
  getConsultationsByDossier,
} from "../../services/api"
import DicomViewer from "../Medecin/DicomViewer"

// Constantes
const API_URL = "http://localhost:5000"
const ORTHANC_URL = "http://localhost:8042"

// Palette de couleurs enrichie
const colors = {
  primary: "#0077B6",
  primaryDark: "#005F8C",
  primaryLight: "#00B4D8",
  secondary: "#48CAE4",
  secondaryDark: "#0096C7",
  secondaryLight: "#90E0EF",
  background: "#F8F9FA",
  backgroundGradient: "linear-gradient(135deg, #F8F9FA 0%, #E9ECEF 100%)",
  cardBackground: "#FFFFFF",
  cardBackgroundHover: "linear-gradient(145deg, #FFFFFF 0%, #F9FAFB 100%)",
  modalBackground: "rgba(255, 255, 255, 0.95)",
  text: "#1A202C",
  textSecondary: "#4A5568",
  accent: "#48CAE4",
  success: "#34C759",
  successLight: "#D1FAE5",
  error: "#FF3B30",
  errorLight: "#FEE2E2",
  warning: "#FF9500",
  warningLight: "#FEF3C7",
  info: "#0077B6",
  infoLight: "#DBEAFE",
  divider: "rgba(0, 0, 0, 0.08)",
  shadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
  shadowHover: "0 12px 40px rgba(0, 0, 0, 0.15)",
}

// Styles des modales avec effet de verre dépoli
const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 480,
  bgcolor: colors.modalBackground,
  backdropFilter: "blur(10px)",
  boxShadow: colors.shadow,
  p: 4,
  borderRadius: 4,
  outline: "none",
  border: "1px solid rgba(255, 255, 255, 0.2)",
}

const fileModalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "80%",
  maxWidth: 960,
  maxHeight: "85%",
  bgcolor: colors.modalBackground,
  backdropFilter: "blur(10px)",
  boxShadow: colors.shadow,
  p: 4,
  borderRadius: 4,
  overflow: "auto",
  outline: "none",
  border: "1px solid rgba(255, 255, 255, 0.2)",
}

// Animation variants pour framer-motion
const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
  hover: {
    scale: 1.02,
    boxShadow: colors.shadowHover,
    transition: { duration: 0.3 },
  },
}

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
}

const expandVariants = {
  hidden: { height: 0, opacity: 0 },
  visible: {
    height: "auto",
    opacity: 1,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  },
  exit: {
    height: 0,
    opacity: 0,
    transition: { duration: 0.3 },
  },
}

const buttonVariants = {
  hover: {
    scale: 1.05,
    backgroundColor: colors.secondary,
    transition: { duration: 0.2 },
  },
  tap: {
    scale: 0.98,
    transition: { duration: 0.1 },
  },
}

const listItemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: (i) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: i * 0.05,
      duration: 0.3,
    },
  }),
  hover: {
    backgroundColor: colors.infoLight,
    transition: { duration: 0.2 },
  },
}

// Composant FileViewerModal
const FileViewerModal = ({ open, onClose, selectedFile }) => {
  const [imageError, setImageError] = useState(false)

  useEffect(() => {
    if (open && selectedFile) {
      console.log("Selected File:", selectedFile)
      setImageError(false)
    }
  }, [open, selectedFile])

  if (!selectedFile) {
    return null
  }

  const isDicom =
    selectedFile.format?.toLowerCase().includes("dicom") || selectedFile.nomFichier?.toLowerCase().endsWith(".dcm")

  let dicomWebUrl = null
  if (isDicom) {
    let metadonnees
    try {
      metadonnees = JSON.parse(selectedFile.metadonnees || "{}")
    } catch (e) {
      console.error("Erreur parsing métadonnées:", e)
      toast.error("Métadonnées invalides.")
      setImageError(true)
      return null
    }

    if (!metadonnees.orthancId) {
      toast.error("ID Orthanc manquant.")
      setImageError(true)
      return null
    }

    dicomWebUrl = selectedFile.dicomWebUrl
      ? selectedFile.dicomWebUrl.replace("wadouri:http://localhost:8042/wado", "wadouri:http://localhost:5000/wado")
      : `wadouri:http://localhost:5000/wado?requestType=WADO&instanceID=${metadonnees.orthancId}`
    console.log("URL DICOM générée:", dicomWebUrl)
  }

  return (
    <Modal open={open} onClose={onClose} sx={{ backdropFilter: "blur(5px)" }}>
      <motion.div variants={modalVariants} initial="hidden" animate="visible" exit="exit">
        <Box sx={fileModalStyle}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: colors.text }}>
              Visualisation du fichier
            </Typography>
            <Chip
              label={selectedFile.nomFichier}
              color="primary"
              variant="outlined"
              icon={isDicom ? <MedicalServicesIcon /> : <DescriptionIcon />}
            />
          </Box>
          <Divider sx={{ my: 2, bgcolor: colors.divider }} />
          {isDicom ? (
            imageError ? (
              <Typography variant="body2" color={colors.error}>
                Impossible de charger l'image DICOM.
              </Typography>
            ) : (
              <Box sx={{ height: "500px", width: "100%", borderRadius: 2, overflow: "hidden" }}>
                <DicomViewer dicomWebUrl={dicomWebUrl} />
              </Box>
            )
          ) : selectedFile.format?.toLowerCase().includes("image") ? (
            imageError ? (
              <Typography variant="body2" color={colors.error}>
                Impossible de charger l'image.
              </Typography>
            ) : (
              <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
                <img
                  src={`${API_URL}${selectedFile.url}`}
                  alt={selectedFile.nomFichier}
                  style={{ maxWidth: "100%", maxHeight: "500px", borderRadius: 12, boxShadow: colors.shadow }}
                  onError={() => setImageError(true)}
                />
              </Box>
            )
          ) : selectedFile.nomFichier?.toLowerCase().endsWith(".pdf") ? (
            <iframe
              src={`${API_URL}${selectedFile.url}`}
              title={selectedFile.nomFichier}
              style={{ width: "100%", height: "500px", border: "none", borderRadius: 12, boxShadow: colors.shadow }}
            />
          ) : (
            <Box
              sx={{ display: "flex", alignItems: "center", gap: 1, p: 3, bgcolor: colors.infoLight, borderRadius: 2 }}
            >
              <DescriptionIcon sx={{ color: colors.primary, fontSize: 40 }} />
              <Box>
                <Typography variant="body1" sx={{ fontWeight: 500, color: colors.text }}>
                  {selectedFile.nomFichier}
                </Typography>
                <Typography variant="body2" color={colors.textSecondary}>
                  Téléchargez le fichier pour le visualiser
                </Typography>
              </Box>
              <Button
                variant="contained"
                startIcon={<DownloadIcon />}
                href={`${API_URL}${selectedFile.url}`}
                download
                sx={{
                  ml: "auto",
                  bgcolor: colors.primary,
                  "&:hover": { bgcolor: colors.secondary },
                  borderRadius: 2,
                  textTransform: "none",
                  py: 1,
                  px: 2,
                  fontWeight: 500,
                }}
              >
                Télécharger
              </Button>
            </Box>
          )}
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 3 }}>
            <motion.div whileHover="hover" whileTap="tap" variants={buttonVariants}>
              <Button
                variant="outlined"
                onClick={onClose}
                sx={{
                  borderColor: colors.primary,
                  color: colors.primary,
                  "&:hover": { borderColor: colors.secondary, color: colors.secondary },
                  borderRadius: 2,
                  textTransform: "none",
                  py: 1,
                  px: 3,
                  fontWeight: 500,
                }}
              >
                Fermer
              </Button>
            </motion.div>
            {selectedFile.url && (
              <motion.div whileHover="hover" whileTap="tap" variants={buttonVariants}>
                <Button
                  variant="contained"
                  startIcon={<DownloadIcon />}
                  href={`${API_URL}${selectedFile.url}`}
                  download
                  sx={{
                    bgcolor: colors.primary,
                    "&:hover": { bgcolor: colors.secondary },
                    borderRadius: 2,
                    textTransform: "none",
                    py: 1,
                    px: 3,
                    fontWeight: 500,
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                  }}
                >
                  Télécharger
                </Button>
              </motion.div>
            )}
          </Box>
        </Box>
      </motion.div>
    </Modal>
  )
}

// Sous-modale pour les détails de la consultation
const ConsultationDetailsModal = ({ open, onClose, consultation, dossier }) => {
  const [activeTab, setActiveTab] = useState(0)
  const [selectedFile, setSelectedFile] = useState(null)
  const [openFileModal, setOpenFileModal] = useState(false)

  const handleOpenFileModal = (fichier) => {
    setSelectedFile(fichier)
    setOpenFileModal(true)
  }

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue)
  }

  const formatDate = (dateString) => {
    if (!dateString) return "Non spécifié"
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (!consultation) return null

  return (
    <>
      <Modal open={open} onClose={onClose} sx={{ backdropFilter: "blur(5px)" }}>
        <motion.div variants={modalVariants} initial="hidden" animate="visible" exit="exit">
          <Box sx={modalStyle}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: colors.text }}>
                Détails de la consultation
              </Typography>
              <Chip
                label={formatDate(consultation.dateConsultation)}
                color="primary"
                size="small"
                icon={<CalendarMonthIcon />}
              />
            </Box>
            <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 2 }}>
              ID: {consultation.idConsultation} | Patient: {dossier?.nom} {dossier?.prenom}
            </Typography>

            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              sx={{
                mb: 3,
                "& .MuiTab-root": {
                  textTransform: "none",
                  fontWeight: 500,
                  minWidth: 100,
                },
                "& .Mui-selected": {
                  color: colors.primary,
                  fontWeight: 600,
                },
                "& .MuiTabs-indicator": {
                  backgroundColor: colors.primary,
                  height: 3,
                  borderRadius: "3px 3px 0 0",
                },
              }}
            >
              <Tab label="Notes" />
              <Tab
                label={
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    Fichiers
                    <Badge badgeContent={consultation.images?.length || 0} color="primary" sx={{ ml: 1 }} />
                  </Box>
                }
              />
            </Tabs>

            {activeTab === 0 && (
              <Box sx={{ mb: 3 }}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    bgcolor: colors.infoLight,
                    borderRadius: 2,
                    border: `1px solid ${colors.divider}`,
                    minHeight: 120,
                  }}
                >
                  <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
                    {consultation.notes || "Aucune note pour cette consultation."}
                  </Typography>
                </Paper>
              </Box>
            )}

            {activeTab === 1 && (
              <Box sx={{ mb: 3 }}>
                {consultation.images && consultation.images.length > 0 ? (
                  <Grid container spacing={2}>
                    {consultation.images.map((fichier, index) => {
                      const isDicom =
                        fichier.format?.toLowerCase().includes("dicom") ||
                        fichier.nomFichier?.toLowerCase().endsWith(".dcm")
                      const isImage =
                        fichier.format?.toLowerCase().includes("image") ||
                        fichier.nomFichier?.toLowerCase().match(/\.(jpg|jpeg|png|gif)$/i)
                      const isPdf = fichier.nomFichier?.toLowerCase().endsWith(".pdf")

                      let Icon = DescriptionIcon
                      if (isDicom) Icon = MedicalServicesIcon
                      else if (isImage) Icon = PhotoIcon
                      else if (isPdf) Icon = DescriptionIcon

                      return (
                        <Grid item xs={12} sm={6} key={fichier.idImage}>
                          <motion.div
                            variants={listItemVariants}
                            initial="hidden"
                            animate="visible"
                            custom={index}
                            whileHover="hover"
                          >
                            <Paper
                              sx={{
                                p: 1.5,
                                borderRadius: 2,
                                display: "flex",
                                alignItems: "center",
                                gap: 1.5,
                                cursor: "pointer",
                                transition: "all 0.2s",
                                "&:hover": {
                                  bgcolor: colors.infoLight,
                                  transform: "translateY(-2px)",
                                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
                                },
                              }}
                              onClick={() => handleOpenFileModal(fichier)}
                            >
                              <Avatar
                                sx={{
                                  bgcolor: isDicom
                                    ? colors.infoLight
                                    : isImage
                                      ? colors.successLight
                                      : colors.warningLight,
                                  color: isDicom ? colors.info : isImage ? colors.success : colors.warning,
                                  width: 40,
                                  height: 40,
                                }}
                              >
                                <Icon />
                              </Avatar>
                              <Box sx={{ flex: 1, overflow: "hidden" }}>
                                <Typography
                                  variant="body2"
                                  sx={{
                                    fontWeight: 500,
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                  }}
                                >
                                  {fichier.nomFichier}
                                </Typography>
                                <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                                  {new Date(fichier.dateUpload).toLocaleDateString()}
                                </Typography>
                              </Box>
                              <Tooltip title="Visualiser">
                                <IconButton size="small" sx={{ color: colors.primary }}>
                                  <VisibilityIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Paper>
                          </motion.div>
                        </Grid>
                      )
                    })}
                  </Grid>
                ) : (
                  <Box sx={{ textAlign: "center", py: 4, bgcolor: colors.background, borderRadius: 2 }}>
                    <DescriptionIcon sx={{ fontSize: 40, color: colors.textSecondary, opacity: 0.5, mb: 1 }} />
                    <Typography variant="body1" color={colors.textSecondary}>
                      Aucun fichier associé à cette consultation
                    </Typography>
                  </Box>
                )}
              </Box>
            )}

            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
              <motion.div whileHover="hover" whileTap="tap" variants={buttonVariants}>
                <Button
                  variant="contained"
                  onClick={onClose}
                  sx={{
                    bgcolor: colors.primary,
                    "&:hover": { bgcolor: colors.secondary },
                    borderRadius: 2,
                    textTransform: "none",
                    py: 1,
                    px: 3,
                    fontWeight: 500,
                  }}
                >
                  Fermer
                </Button>
              </motion.div>
            </Box>
          </Box>
        </motion.div>
      </Modal>

      <FileViewerModal open={openFileModal} onClose={() => setOpenFileModal(false)} selectedFile={selectedFile} />
    </>
  )
}

// Composant principal
const InfirmierGererDossier = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))
  const isTablet = useMediaQuery(theme.breakpoints.down("md"))

  const [dossiers, setDossiers] = useState([])
  const [loading, setLoading] = useState(false)
  const [openEditModal, setOpenEditModal] = useState(false)
  const [openImageModal, setOpenImageModal] = useState(false)
  const [openFileModal, setOpenFileModal] = useState(false)
  const [openConsultationDetailsModal, setOpenConsultationDetailsModal] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [selectedDossier, setSelectedDossier] = useState(null)
  const [selectedConsultation, setSelectedConsultation] = useState(null)
  const [expandedDossier, setExpandedDossier] = useState(null)
  const [editDossier, setEditDossier] = useState({ diagnostic: "", traitement: "", etat: "" })
  const [imageFile, setImageFile] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("tous")
  const [loadingConsultations, setLoadingConsultations] = useState({})

  const dossiersContainerRef = useRef(null)

  const fetchDossiers = async () => {
    setLoading(true)
    try {
      const response = await getDossiersForInfirmier()
      // Initialiser les dossiers sans les consultations pour un chargement plus rapide
      const dossiersInitiaux = response.data.dossiers.map((dossier) => ({
        ...dossier,
        consultations: [],
        consultationsLoaded: false,
        fichiers: [],
      }))
      setDossiers(dossiersInitiaux)
    } catch (error) {
      toast.error("Erreur récupération dossiers : " + (error.response?.data?.message || "Erreur inconnue"))
    } finally {
      setLoading(false)
    }
  }

  const fetchConsultationsForDossier = async (dossier) => {
    if (dossier.consultationsLoaded) return

    setLoadingConsultations((prev) => ({ ...prev, [dossier.idDossier]: true }))
    try {
      const imagesResponse = await getImagesByDossier(dossier.idDossier)
      const consultationsResponse = await getConsultationsByDossier(dossier.idDossier)
      const images = imagesResponse.data.images || []
      const consultations = consultationsResponse.data.consultations || []

      const consultationsWithImages = consultations.map((consultation) => {
        const consultationImages = images.filter((image) => image.idConsultation === consultation.idConsultation)
        return {
          ...consultation,
          images: consultationImages,
        }
      })

      setDossiers((prevDossiers) =>
        prevDossiers.map((d) =>
          d.idDossier === dossier.idDossier
            ? {
                ...d,
                consultations: consultationsWithImages,
                consultationsLoaded: true,
                fichiers: images,
              }
            : d,
        ),
      )

      toast.success(`Consultations chargées pour ${dossier.nom} ${dossier.prenom}`)
    } catch (error) {
      toast.error(`Erreur lors du chargement des consultations : ${error.response?.data?.message || "Erreur inconnue"}`)
    } finally {
      setLoadingConsultations((prev) => ({ ...prev, [dossier.idDossier]: false }))
    }
  }

  useEffect(() => {
    fetchDossiers()
  }, [])

  const handleRefresh = () => {
    fetchDossiers()
  }

  const handleOpenEditModal = (dossier) => {
    setSelectedDossier(dossier)
    setEditDossier({
      diagnostic: dossier.diagnostic,
      traitement: dossier.traitement,
      etat: dossier.etat,
    })
    setOpenEditModal(true)
  }

  const handleOpenImageModal = (dossier) => {
    setSelectedDossier(dossier)
    setImageFile(null)
    setOpenImageModal(true)
  }

  const handleOpenFileModal = (fichier) => {
    setSelectedFile(fichier)
    setOpenFileModal(true)
  }

  const handleOpenConsultationDetailsModal = (consultation, dossier) => {
    setSelectedConsultation(consultation)
    setSelectedDossier(dossier)
    setOpenConsultationDetailsModal(true)
  }

  const handleToggleExpand = (dossier) => {
    setExpandedDossier(expandedDossier?.idDossier === dossier.idDossier ? null : dossier)
  }

  const handleUpdateDossier = async (e) => {
    e.preventDefault()
    try {
      await updateDossier(selectedDossier.idDossier, editDossier)
      toast.success("Dossier mis à jour avec succès.")
      setOpenEditModal(false)
      fetchDossiers()
    } catch (error) {
      toast.error("Erreur mise à jour dossier : " + (error.response?.data?.message || "Erreur inconnue"))
    }
  }

  const handleUploadImage = async (e) => {
    e.preventDefault()
    if (!imageFile) {
      toast.error("Veuillez sélectionner une image.")
      return
    }
    const formData = new FormData()
    formData.append("file", imageFile)
    formData.append("idDossier", selectedDossier.idDossier)
    try {
      await uploadImage(formData)
      toast.success("Fichier ajouté avec succès.")
      setOpenImageModal(false)

      // Recharger les consultations pour ce dossier
      const dossier = dossiers.find((d) => d.idDossier === selectedDossier.idDossier)
      if (dossier) {
        fetchConsultationsForDossier(dossier)
      }
    } catch (error) {
      toast.error("Erreur ajout fichier : " + (error.response?.data?.message || "Erreur inconnue"))
    }
  }

  const handleDeleteImage = async (imageId) => {
    try {
      await deleteImage(imageId)
      toast.success("Fichier supprimé avec succès.")

      // Mettre à jour l'état local pour refléter la suppression
      setDossiers((prevDossiers) =>
        prevDossiers.map((dossier) => ({
          ...dossier,
          consultations: dossier.consultations.map((consultation) => ({
            ...consultation,
            images: consultation.images.filter((img) => img.idImage !== imageId),
          })),
          fichiers: dossier.fichiers.filter((img) => img.idImage !== imageId),
        })),
      )
    } catch (error) {
      toast.error("Erreur suppression fichier : " + (error.response?.data?.message || "Erreur inconnue"))
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return "Non spécifié"
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  // Filtrer les dossiers en fonction de la recherche et du statut
  const filteredDossiers = dossiers.filter((dossier) => {
    const matchesSearch =
      searchTerm === "" ||
      dossier.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dossier.prenom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dossier.idDossier?.toString().includes(searchTerm)

    const matchesStatus = filterStatus === "tous" || dossier.etat === filterStatus

    return matchesSearch && matchesStatus
  })

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          bgcolor: colors.background,
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <CircularProgress size={60} sx={{ color: colors.primary }} thickness={5} />
          <Typography sx={{ mt: 2, color: colors.text, fontWeight: 500, letterSpacing: 0.5, textAlign: "center" }}>
            Chargement des dossiers...
          </Typography>
        </motion.div>
      </Box>
    )
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: colors.background, minHeight: "100vh" }}>
      {/* En-tête avec titre et boutons d'action */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", sm: "center" },
          mb: 4,
          gap: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Avatar
            sx={{
              bgcolor: colors.primary,
              width: { xs: 40, md: 56 },
              height: { xs: 40, md: 56 },
              boxShadow: "0 4px 12px rgba(0, 119, 182, 0.2)",
            }}
          >
            <FolderIcon sx={{ fontSize: { xs: 24, md: 32 } }} />
          </Avatar>
          <Box>
            <Typography
              variant={isMobile ? "h5" : "h4"}
              sx={{
                fontWeight: 700,
                color: colors.text,
                letterSpacing: -0.5,
                lineHeight: 1.2,
              }}
            >
              Gestion des dossiers
            </Typography>
            <Typography variant="body1" sx={{ color: colors.textSecondary }}>
              {filteredDossiers.length} dossier{filteredDossiers.length !== 1 ? "s" : ""} patient
              {filteredDossiers.length !== 1 ? "s" : ""}
            </Typography>
          </Box>
        </Box>

        <Box
          sx={{
            display: "flex",
            gap: 1.5,
            flexWrap: "wrap",
            justifyContent: { xs: "flex-start", sm: "flex-end" },
            width: { xs: "100%", sm: "auto" },
          }}
        >
          <motion.div whileHover="hover" whileTap="tap" variants={buttonVariants}>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<RefreshIcon />}
              onClick={handleRefresh}
              sx={{
                borderColor: colors.primary,
                color: colors.primary,
                "&:hover": { borderColor: colors.secondary, color: colors.secondary },
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 500,
                py: 1,
                px: { xs: 2, md: 3 },
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
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
          mb: 4,
          borderRadius: 3,
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          alignItems: "center",
          gap: 2,
          bgcolor: "white",
          border: `1px solid ${colors.divider}`,
          boxShadow: "0 2px 12px rgba(0, 0, 0, 0.03)",
        }}
      >
        <Box sx={{ position: "relative", flex: 1, width: { xs: "100%", md: "auto" } }}>
          <SearchIcon
            sx={{
              position: "absolute",
              left: 2,
              top: "50%",
              transform: "translateY(-50%)",
              color: colors.textSecondary,
            }}
          />
          <TextField
            placeholder="Rechercher un patient..."
            variant="outlined"
            fullWidth
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{
              "& .MuiOutlinedInput-root": {
                pl: 5,
                borderRadius: 2,
                "&:hover fieldset": { borderColor: colors.secondary },
                "&.Mui-focused fieldset": { borderColor: colors.primary },
              },
            }}
          />
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1, width: { xs: "100%", md: "auto" } }}>
          <FilterListIcon sx={{ color: colors.textSecondary }} />
          <Select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            displayEmpty
            size="small"
            sx={{
              minWidth: 150,
              borderRadius: 2,
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: colors.divider,
              },
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: colors.secondary,
              },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: colors.primary,
              },
            }}
          >
            <MenuItem value="tous">Tous les statuts</MenuItem>
            <MenuItem value="en cours">En cours</MenuItem>
            <MenuItem value="traité">Traité</MenuItem>
          </Select>
        </Box>
      </Paper>

      {filteredDossiers.length === 0 ? (
        <Box
          sx={{
            textAlign: "center",
            mt: 8,
            p: 4,
            bgcolor: "white",
            borderRadius: 4,
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
          }}
        >
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <FolderIcon sx={{ fontSize: 80, color: colors.textSecondary, opacity: 0.3, mb: 2 }} />
            <Typography variant="h6" color={colors.textSecondary} sx={{ mb: 2 }}>
              {searchTerm || filterStatus !== "tous"
                ? "Aucun dossier ne correspond à votre recherche"
                : "Aucun dossier assigné"}
            </Typography>
            <motion.div whileHover="hover" whileTap="tap" variants={buttonVariants}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<RefreshIcon />}
                onClick={handleRefresh}
                sx={{
                  bgcolor: colors.primary,
                  "&:hover": { bgcolor: colors.secondary },
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: 500,
                  py: 1.2,
                  px: 3,
                }}
              >
                Rafraîchir les dossiers
              </Button>
            </motion.div>
          </motion.div>
        </Box>
      ) : (
        <Box
          sx={{
            mt: 2,
            maxHeight: "70vh",
            overflowY: "auto",
            scrollBehavior: "smooth",
            paddingRight: "8px",
            scrollbarWidth: "thin",
            scrollbarColor: `${colors.primary} #f1f1f1`,
            "&::-webkit-scrollbar": {
              width: "8px",
            },
            "&::-webkit-scrollbar-track": {
              background: "#f1f1f1",
              borderRadius: "5px",
            },
            "&::-webkit-scrollbar-thumb": {
              background: colors.primary,
              borderRadius: "5px",
              border: "2px solid #f1f1f1",
            },
            "&::-webkit-scrollbar-thumb:hover": {
              background: colors.secondary,
            },
          }}
          ref={dossiersContainerRef}
        >
          <Grid container spacing={3}>
            {filteredDossiers.map((dossier, index) => {
              const isExpanded = expandedDossier?.idDossier === dossier.idDossier
              return (
                <Grid item xs={12} key={dossier.idDossier}>
                  <motion.div
                    custom={index}
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    whileHover={isExpanded ? {} : "hover"}
                  >
                    <Card
                      elevation={isExpanded ? 3 : 1}
                      sx={{
                        borderRadius: 3,
                        overflow: "hidden",
                        transition: "all 0.3s ease",
                        border: `1px solid ${isExpanded ? "transparent" : colors.divider}`,
                        bgcolor: isExpanded ? colors.cardBackground : "white",
                      }}
                    >
                      <CardHeader
                        avatar={
                          <Avatar sx={{ bgcolor: colors.primary, width: 48, height: 48 }}>
                            {dossier.nom?.charAt(0) || "P"}
                          </Avatar>
                        }
                        title={
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                            <Typography variant="h6" sx={{ fontWeight: 600, color: colors.text }}>
                              {dossier.nom} {dossier.prenom}
                            </Typography>
                            <Chip
                              label={dossier.etat}
                              size="small"
                              sx={{
                                bgcolor: dossier.etat === "en cours" ? colors.warningLight : colors.successLight,
                                color: dossier.etat === "en cours" ? colors.warning : colors.success,
                                fontWeight: 500,
                                borderRadius: 1,
                              }}
                            />
                          </Box>
                        }
                        subheader={
                          <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                            ID Patient: {dossier.idPatient} | Dossier: {dossier.idDossier}
                          </Typography>
                        }
                        action={
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            {isExpanded && (
                              <>
                                <Tooltip title="Modifier le dossier">
                                  <IconButton
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleOpenEditModal(dossier)
                                    }}
                                    sx={{ color: colors.primary, "&:hover": { color: colors.secondary } }}
                                  >
                                    <EditIcon />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Ajouter un fichier">
                                  <IconButton
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleOpenImageModal(dossier)
                                    }}
                                    sx={{ color: colors.primary, "&:hover": { color: colors.secondary } }}
                                  >
                                    <ImageIcon />
                                  </IconButton>
                                </Tooltip>
                              </>
                            )}
                            <IconButton
                              onClick={() => handleToggleExpand(dossier)}
                              sx={{
                                transition: "transform 0.3s",
                                transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                              }}
                            >
                              <ExpandMoreIcon sx={{ color: colors.primary }} />
                            </IconButton>
                          </Box>
                        }
                        sx={{
                          cursor: "pointer",
                          "&:hover": { bgcolor: isExpanded ? "transparent" : colors.background },
                        }}
                        onClick={() => handleToggleExpand(dossier)}
                      />

                      <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                        <CardContent>
                          <Divider sx={{ mb: 2, bgcolor: colors.divider }} />

                          <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                              <Paper elevation={0} sx={{ p: 2, bgcolor: colors.infoLight, borderRadius: 2 }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1, color: colors.text }}>
                                  Informations du patient
                                </Typography>
                                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                                    <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                                      Email:
                                    </Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                      {dossier.email || "Non spécifié"}
                                    </Typography>
                                  </Box>
                                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                                    <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                                      Téléphone:
                                    </Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                      {dossier.telephone || "Non spécifié"}
                                    </Typography>
                                  </Box>
                                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                                    <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                                      Date de création:
                                    </Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                      {formatDate(dossier.dateCreation)}
                                    </Typography>
                                  </Box>
                                </Box>
                              </Paper>
                            </Grid>

                            <Grid item xs={12} md={6}>
                              <Paper elevation={0} sx={{ p: 2, bgcolor: colors.successLight, borderRadius: 2 }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1, color: colors.text }}>
                                  Diagnostic et traitement
                                </Typography>
                                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                                  <Box>
                                    <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                                      Diagnostic:
                                    </Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                      {dossier.diagnostic || "Non spécifié"}
                                    </Typography>
                                  </Box>
                                  <Box>
                                    <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                                      Traitement:
                                    </Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                      {dossier.traitement || "Non spécifié"}
                                    </Typography>
                                  </Box>
                                </Box>
                              </Paper>
                            </Grid>
                          </Grid>

                          <Box sx={{ mt: 3 }}>
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                              <Typography variant="subtitle1" sx={{ fontWeight: 600, color: colors.text }}>
                                Consultations
                              </Typography>
                              <motion.div whileHover="hover" whileTap="tap" variants={buttonVariants}>
                                <Button
                                  variant="outlined"
                                  color="primary"
                                  startIcon={
                                    loadingConsultations[dossier.idDossier] ? (
                                      <CircularProgress size={20} color="inherit" />
                                    ) : (
                                      <NoteIcon />
                                    )
                                  }
                                  onClick={() => fetchConsultationsForDossier(dossier)}
                                  disabled={loadingConsultations[dossier.idDossier] || dossier.consultationsLoaded}
                                  sx={{
                                    borderColor: colors.primary,
                                    color: colors.primary,
                                    "&:hover": { borderColor: colors.secondary, color: colors.secondary },
                                    borderRadius: 2,
                                    textTransform: "none",
                                    fontWeight: 500,
                                    py: 0.8,
                                    px: 2,
                                  }}
                                >
                                  {loadingConsultations[dossier.idDossier]
                                    ? "Chargement..."
                                    : dossier.consultationsLoaded
                                      ? "Consultations chargées"
                                      : "Charger les consultations"}
                                </Button>
                              </motion.div>
                            </Box>

                            {loadingConsultations[dossier.idDossier] ? (
                              <Box sx={{ p: 3, textAlign: "center" }}>
                                <CircularProgress size={30} sx={{ color: colors.primary, mb: 2 }} />
                                <Typography variant="body2" color={colors.textSecondary}>
                                  Chargement des consultations...
                                </Typography>
                              </Box>
                            ) : dossier.consultationsLoaded && dossier.consultations.length > 0 ? (
                              <Grid container spacing={2}>
                                {dossier.consultations.map((consultation, index) => (
                                  <Grid item xs={12} md={6} lg={4} key={consultation.idConsultation}>
                                    <motion.div
                                      variants={listItemVariants}
                                      initial="hidden"
                                      animate="visible"
                                      custom={index}
                                      whileHover="hover"
                                    >
                                      <Card
                                        elevation={0}
                                        sx={{
                                          borderRadius: 2,
                                          border: `1px solid ${colors.divider}`,
                                          overflow: "hidden",
                                          transition: "all 0.2s",
                                          "&:hover": {
                                            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
                                          },
                                        }}
                                      >
                                        <CardHeader
                                          avatar={
                                            <Avatar sx={{ bgcolor: colors.infoLight, color: colors.info }}>
                                              <LocalHospitalIcon />
                                            </Avatar>
                                          }
                                          title={`Consultation du ${formatDate(consultation.dateConsultation)}`}
                                          subheader={`ID: ${consultation.idConsultation}`}
                                          sx={{ pb: 1 }}
                                        />
                                        <CardContent sx={{ pt: 0 }}>
                                          <Typography variant="body2" color={colors.textSecondary} noWrap>
                                            {consultation.notes
                                              ? consultation.notes.length > 60
                                                ? `${consultation.notes.substring(0, 60)}...`
                                                : consultation.notes
                                              : "Aucune note"}
                                          </Typography>

                                          {consultation.images && consultation.images.length > 0 && (
                                            <Box sx={{ mt: 1, display: "flex", gap: 1 }}>
                                              <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                                                Fichiers:
                                              </Typography>
                                              <Box sx={{ display: "flex", gap: 0.5 }}>
                                                {consultation.images.slice(0, 3).map((fichier) => {
                                                  const isDicom =
                                                    fichier.format?.toLowerCase().includes("dicom") ||
                                                    fichier.nomFichier?.toLowerCase().endsWith(".dcm")
                                                  const isImage = fichier.format?.toLowerCase().includes("image")
                                                  const isPdf = fichier.nomFichier?.toLowerCase().endsWith(".pdf")

                                                  let Icon = DescriptionIcon
                                                  if (isDicom) Icon = MedicalServicesIcon
                                                  else if (isImage) Icon = PhotoIcon

                                                  return (
                                                    <Tooltip key={fichier.idImage} title={fichier.nomFichier}>
                                                      <Avatar
                                                        sx={{
                                                          width: 24,
                                                          height: 24,
                                                          fontSize: "0.8rem",
                                                          bgcolor: isDicom
                                                            ? colors.infoLight
                                                            : isImage
                                                              ? colors.successLight
                                                              : colors.warningLight,
                                                          color: isDicom
                                                            ? colors.info
                                                            : isImage
                                                              ? colors.success
                                                              : colors.warning,
                                                        }}
                                                      >
                                                        <Icon sx={{ fontSize: 14 }} />
                                                      </Avatar>
                                                    </Tooltip>
                                                  )
                                                })}
                                                {consultation.images.length > 3 && (
                                                  <Tooltip
                                                    title={`${consultation.images.length - 3} fichier(s) supplémentaire(s)`}
                                                  >
                                                    <Avatar
                                                      sx={{
                                                        width: 24,
                                                        height: 24,
                                                        fontSize: "0.7rem",
                                                        bgcolor: colors.background,
                                                        color: colors.textSecondary,
                                                      }}
                                                    >
                                                      +{consultation.images.length - 3}
                                                    </Avatar>
                                                  </Tooltip>
                                                )}
                                              </Box>
                                            </Box>
                                          )}
                                        </CardContent>
                                        <CardActions sx={{ justifyContent: "flex-end", pt: 0 }}>
                                          <Button
                                            size="small"
                                            startIcon={<VisibilityIcon />}
                                            onClick={() => handleOpenConsultationDetailsModal(consultation, dossier)}
                                            sx={{
                                              color: colors.primary,
                                              "&:hover": { bgcolor: colors.infoLight },
                                              textTransform: "none",
                                              fontWeight: 500,
                                            }}
                                          >
                                            Détails
                                          </Button>
                                        </CardActions>
                                      </Card>
                                    </motion.div>
                                  </Grid>
                                ))}
                              </Grid>
                            ) : dossier.consultationsLoaded ? (
                              <Box sx={{ textAlign: "center", py: 4, bgcolor: colors.background, borderRadius: 2 }}>
                                <NoteIcon sx={{ fontSize: 40, color: colors.textSecondary, opacity: 0.5, mb: 1 }} />
                                <Typography variant="body1" color={colors.textSecondary}>
                                  Aucune consultation enregistrée
                                </Typography>
                              </Box>
                            ) : (
                              <Box sx={{ textAlign: "center", py: 4, bgcolor: colors.background, borderRadius: 2 }}>
                                <Typography variant="body1" color={colors.textSecondary}>
                                  Cliquez sur "Charger les consultations" pour afficher l'historique
                                </Typography>
                              </Box>
                            )}
                          </Box>
                        </CardContent>
                      </Collapse>
                    </Card>
                  </motion.div>
                </Grid>
              )
            })}
          </Grid>
        </Box>
      )}

      {/* Modale pour modifier un dossier */}
      <Modal open={openEditModal} onClose={() => setOpenEditModal(false)} sx={{ backdropFilter: "blur(5px)" }}>
        <motion.div variants={modalVariants} initial="hidden" animate="visible" exit="exit">
          <Box sx={modalStyle}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: colors.text }}>
              Modifier le dossier
            </Typography>
            <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 3 }}>
              Patient: {selectedDossier?.nom} {selectedDossier?.prenom} | ID: {selectedDossier?.idDossier}
            </Typography>
            <Divider sx={{ my: 2, bgcolor: colors.divider }} />
            <form onSubmit={handleUpdateDossier}>
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" gutterBottom sx={{ fontWeight: 500, color: colors.textSecondary }}>
                  Diagnostic
                </Typography>
                <TextField
                  value={editDossier.diagnostic}
                  onChange={(e) => setEditDossier({ ...editDossier, diagnostic: e.target.value })}
                  fullWidth
                  required
                  multiline
                  rows={2}
                  variant="outlined"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      "&:hover fieldset": { borderColor: colors.secondary },
                      "&.Mui-focused fieldset": { borderColor: colors.primary },
                    },
                  }}
                />
              </Box>
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" gutterBottom sx={{ fontWeight: 500, color: colors.textSecondary }}>
                  Traitement
                </Typography>
                <TextField
                  value={editDossier.traitement}
                  onChange={(e) => setEditDossier({ ...editDossier, traitement: e.target.value })}
                  fullWidth
                  required
                  multiline
                  rows={2}
                  variant="outlined"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      "&:hover fieldset": { borderColor: colors.secondary },
                      "&.Mui-focused fieldset": { borderColor: colors.primary },
                    },
                  }}
                />
              </Box>
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" gutterBottom sx={{ fontWeight: 500, color: colors.textSecondary }}>
                  État
                </Typography>
                <Select
                  value={editDossier.etat}
                  onChange={(e) => setEditDossier({ ...editDossier, etat: e.target.value })}
                  fullWidth
                  sx={{
                    borderRadius: 2,
                    "& .MuiOutlinedInput-root": {
                      "&:hover fieldset": { borderColor: colors.secondary },
                      "&.Mui-focused fieldset": { borderColor: colors.primary },
                    },
                  }}
                >
                  <MenuItem value="en cours">En cours</MenuItem>
                  <MenuItem value="traité">Traité</MenuItem>
                </Select>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 3 }}>
                <motion.div whileHover="hover" whileTap="tap" variants={buttonVariants}>
                  <Button
                    variant="outlined"
                    onClick={() => setOpenEditModal(false)}
                    sx={{
                      borderColor: colors.primary,
                      color: colors.primary,
                      "&:hover": { borderColor: colors.secondary, color: colors.secondary },
                      borderRadius: 2,
                      textTransform: "none",
                      py: 1,
                      px: 3,
                      fontWeight: 500,
                    }}
                  >
                    Annuler
                  </Button>
                </motion.div>
                <motion.div whileHover="hover" whileTap="tap" variants={buttonVariants}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    sx={{
                      bgcolor: colors.primary,
                      "&:hover": { bgcolor: colors.secondary },
                      borderRadius: 2,
                      textTransform: "none",
                      py: 1,
                      px: 3,
                      fontWeight: 500,
                      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                    }}
                  >
                    Mettre à jour
                  </Button>
                </motion.div>
              </Box>
            </form>
          </Box>
        </motion.div>
      </Modal>

      {/* Modale pour ajouter une image */}
      <Modal open={openImageModal} onClose={() => setOpenImageModal(false)} sx={{ backdropFilter: "blur(5px)" }}>
        <motion.div variants={modalVariants} initial="hidden" animate="visible" exit="exit">
          <Box sx={modalStyle}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: colors.text }}>
              Ajouter un fichier au dossier
            </Typography>
            <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 3 }}>
              Patient: {selectedDossier?.nom} {selectedDossier?.prenom} | ID: {selectedDossier?.idDossier}
            </Typography>
            <Divider sx={{ my: 2, bgcolor: colors.divider }} />
            <form onSubmit={handleUploadImage}>
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" gutterBottom sx={{ fontWeight: 500, color: colors.textSecondary }}>
                  Sélectionner un fichier
                </Typography>
                <Box
                  sx={{
                    border: `2px dashed ${colors.divider}`,
                    borderRadius: 2,
                    p: 3,
                    textAlign: "center",
                    bgcolor: colors.background,
                    transition: "all 0.2s",
                    "&:hover": {
                      borderColor: colors.primary,
                      bgcolor: colors.infoLight,
                    },
                  }}
                >
                  <input
                    type="file"
                    id="file-upload"
                    onChange={(e) => setImageFile(e.target.files[0])}
                    style={{ display: "none" }}
                    accept=".dcm,.pdf,.jpg,.jpeg,.png,.docx,.txt"
                  />
                  <label htmlFor="file-upload" style={{ cursor: "pointer", display: "block" }}>
                    {imageFile ? (
                      <Box>
                        <Chip
                          icon={<DescriptionIcon />}
                          label={imageFile.name}
                          onDelete={() => setImageFile(null)}
                          color="primary"
                          sx={{ mb: 1 }}
                        />
                        <Typography variant="caption" display="block" color={colors.textSecondary}>
                          {(imageFile.size / 1024).toFixed(2)} KB
                        </Typography>
                      </Box>
                    ) : (
                      <Box>
                        <ImageIcon sx={{ fontSize: 40, color: colors.textSecondary, mb: 1 }} />
                        <Typography variant="body1" sx={{ fontWeight: 500, mb: 1 }}>
                          Cliquez pour sélectionner un fichier
                        </Typography>
                        <Typography variant="caption" color={colors.textSecondary}>
                          Formats supportés: DICOM, PDF, JPG, PNG, DOCX, TXT
                        </Typography>
                      </Box>
                    )}
                  </label>
                </Box>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 3 }}>
                <motion.div whileHover="hover" whileTap="tap" variants={buttonVariants}>
                  <Button
                    variant="outlined"
                    onClick={() => setOpenImageModal(false)}
                    sx={{
                      borderColor: colors.primary,
                      color: colors.primary,
                      "&:hover": { borderColor: colors.secondary, color: colors.secondary },
                      borderRadius: 2,
                      textTransform: "none",
                      py: 1,
                      px: 3,
                      fontWeight: 500,
                    }}
                  >
                    Annuler
                  </Button>
                </motion.div>
                <motion.div whileHover="hover" whileTap="tap" variants={buttonVariants}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={!imageFile}
                    sx={{
                      bgcolor: colors.primary,
                      "&:hover": { bgcolor: colors.secondary },
                      borderRadius: 2,
                      textTransform: "none",
                      py: 1,
                      px: 3,
                      fontWeight: 500,
                      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                    }}
                  >
                    Ajouter
                  </Button>
                </motion.div>
              </Box>
            </form>
          </Box>
        </motion.div>
      </Modal>

      <FileViewerModal open={openFileModal} onClose={() => setOpenFileModal(false)} selectedFile={selectedFile} />
      <ConsultationDetailsModal
        open={openConsultationDetailsModal}
        onClose={() => setOpenConsultationDetailsModal(false)}
        consultation={selectedConsultation}
        dossier={selectedDossier}
      />
    </Box>
  )
}

export default InfirmierGererDossier
