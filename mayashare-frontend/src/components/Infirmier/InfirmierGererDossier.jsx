/* eslint-disable prettier/prettier */
"use client"

import { useState, useEffect } from "react"
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
  Avatar,
  Tooltip,
  Grid,
  Card,
  CardContent,
  CardHeader,
  CardActions,
  Badge,
  Tabs,
  Tab,
  useTheme,
  useMediaQuery,
  FormControl,
  FormHelperText,
  InputAdornment,
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
import PersonIcon from "@mui/icons-material/Person"
import EmailIcon from "@mui/icons-material/Email"
import PhoneIcon from "@mui/icons-material/Phone"
import BloodtypeIcon from "@mui/icons-material/Bloodtype"
import WarningIcon from "@mui/icons-material/Warning"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import AccessTimeIcon from "@mui/icons-material/AccessTime"
import ClearIcon from "@mui/icons-material/Clear"
import { toast } from "react-toastify"
import { motion, AnimatePresence } from "framer-motion"
import {
  getDossiersForInfirmier,
  updateDossier,
  uploadImage,
  getImagesByDossier,
  getConsultationsByDossier,
} from "../../services/api"
import DicomViewer from "../Medecin/DicomViewer"
import "./InfirmierGererDossier.css"

// Constantes
const API_URL = "http://localhost:3000"
const ORTHANC_URL = "http://localhost:8042"

// Palette de couleurs
const colors = {
  primary: "#2E5BBA",
  primaryLight: "#0077B6",
  secondary: "#FF9800",
  success: "#4CAF50",
  error: "#F44336",
  warning: "#FF9800",
  info: "#2196F3",
  background: "#FAFAFA",
  surface: "#FFFFFF",
  text: "#212121",
  textSecondary: "#757575",
  border: "#E0E0E0",
  buttonOutline: "#E3F2FD",
  gradient: "linear-gradient(45deg, #2E5BBA, #0077B6)",
}

// Composant FileViewerModal
const FileViewerModal = ({ open, onClose, selectedFile }) => {
  const [imageError, setImageError] = useState(false)

  useEffect(() => {
    if (open && selectedFile) {
      setImageError(false)
    }
  }, [open, selectedFile])

  if (!selectedFile) return null

  const isDicom =
    selectedFile.format?.toLowerCase().includes("dicom") || selectedFile.nomFichier?.toLowerCase().endsWith(".dcm")

  let dicomWebUrl = null
  if (isDicom) {
    let metadonnees
    try {
      metadonnees = JSON.parse(selectedFile.metadonnees || "{}")
    } catch (e) {
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
      ? selectedFile.dicomWebUrl.replace("wadouri:http://localhost:8042/wado", "wadouri:http://localhost:3000/wado")
      : `wadouri:http://localhost:3000/wado?requestType=WADO&instanceID=${metadonnees.orthancId}`
  }

  return (
    <Modal open={open} onClose={onClose}>
      <motion.div className="modal-content">
        <Box className="file-viewer-modal">
          <Box className="modal-header">
            <Box className="header-content">
              <Avatar className="header-avatar">
                <VisibilityIcon />
              </Avatar>
              <Box>
                <Typography variant="h6" className="modal-title">
                  Visualisation du fichier
                </Typography>
                <Chip
                  label={selectedFile.nomFichier}
                  variant="outlined"
                  icon={isDicom ? <MedicalServicesIcon /> : <DescriptionIcon />}
                  className="file-chip"
                />
              </Box>
            </Box>
          </Box>

          {isDicom ? (
            imageError ? (
              <Box className="error-container">
                <WarningIcon className="error-icon" />
                <Typography variant="h6" className="error-text">
                  Impossible de charger l'image DICOM
                </Typography>
              </Box>
            ) : (
              <Box className="dicom-viewer">
                <DicomViewer dicomWebUrl={dicomWebUrl} />
              </Box>
            )
          ) : selectedFile.format?.toLowerCase().includes("image") ? (
            imageError ? (
              <Box className="error-container">
                <WarningIcon className="error-icon" />
                <Typography variant="h6" className="error-text">
                  Impossible de charger l'image
                </Typography>
              </Box>
            ) : (
              <Box className="image-container">
                <img
                  src={`${API_URL}${selectedFile.url}`}
                  alt={selectedFile.nomFichier}
                  className="image-preview"
                  onError={() => setImageError(true)}
                />
              </Box>
            )
          ) : selectedFile.nomFichier?.toLowerCase().endsWith(".pdf") ? (
            <Box className="pdf-container">
              <iframe
                src={`${API_URL}${selectedFile.url}`}
                title={selectedFile.nomFichier}
                className="pdf-iframe"
              />
            </Box>
          ) : (
            <Box className="file-download-container">
              <Avatar className="file-icon">
                <DescriptionIcon />
              </Avatar>
              <Box className="file-info">
                <Typography variant="h6" className="file-name">
                  {selectedFile.nomFichier}
                </Typography>
                <Typography variant="body2" className="file-hint">
                  Téléchargez le fichier pour le visualiser
                </Typography>
              </Box>
              <Button
                variant="contained"
                startIcon={<DownloadIcon />}
                href={`${API_URL}${selectedFile.url}`}
                download
                className="download-button"
              >
                Télécharger
              </Button>
            </Box>
          )}

          <Box className="modal-footer">
            <Button
              variant="outlined"
              onClick={onClose}
              className="cancel-button"
            >
              Fermer
            </Button>
            {selectedFile.url && (
              <Button
                variant="contained"
                startIcon={<DownloadIcon />}
                href={`${API_URL}${selectedFile.url}`}
                download
                className="download-button"
              >
                Télécharger
              </Button>
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
      <Modal open={open} onClose={onClose}>
        <motion.div className="modal-content">
          <Box className="consultation-modal">
            <Box className="modal-header">
              <Box className="header-content">
                <Avatar className="header-avatar">
                  <LocalHospitalIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" className="modal-title">
                    Détails de la consultation
                  </Typography>
                  <Chip
                    label={formatDate(consultation.dateConsultation)}
                    size="small"
                    icon={<CalendarMonthIcon />}
                    className="date-chip"
                  />
                </Box>
              </Box>
            </Box>

            <Typography className="consultation-info">
              <strong>ID:</strong> {consultation.idConsultation} | <strong>Patient:</strong> {dossier?.nom}{" "}
              {dossier?.prenom}
            </Typography>

            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              className="consultation-tabs"
            >
              <Tab label="Notes" aria-label="Notes de consultation" />
              <Tab
                label={
                  <Box className="tab-label">
                    Fichiers
                    <Badge
                      badgeContent={consultation.images?.length || 0}
                      className="tab-badge"
                    />
                  </Box>
                }
                aria-label="Fichiers associés"
              />
              <Tab label="Ordonnance" aria-label="Ordonnance médicale" />
            </Tabs>

            <AnimatePresence mode="wait">
              {activeTab === 0 && (
                <motion.div
                  key="notes"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                >
                  <Paper className="notes-container">
                    <Box className="section-header">
                      <NoteIcon />
                      <Typography variant="subtitle1" className="section-title">
                        Notes de consultation
                      </Typography>
                    </Box>
                    <Typography variant="body1" className="section-content">
                      {consultation.notes || "Aucune note pour cette consultation."}
                    </Typography>
                  </Paper>
                </motion.div>
              )}

              {activeTab === 1 && (
                <motion.div
                  key="fichiers"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                >
                  {consultation.images && consultation.images.length > 0 ? (
                    <div className="file-items-grid">
                      {consultation.images.map((fichier) => {
                        const isDicom =
                          fichier.format?.toLowerCase().includes("dicom") ||
                          fichier.nomFichier?.toLowerCase().endsWith(".dcm")
                        const isImage =
                          fichier.format?.toLowerCase().includes("image") ||
                          fichier.nomFichier?.toLowerCase().match(/\.(jpg|jpeg|png|gif)$/i)

                        let Icon = DescriptionIcon
                        let iconColor = colors.warning

                        if (isDicom) {
                          Icon = MedicalServicesIcon
                          iconColor = colors.info
                        } else if (isImage) {
                          Icon = PhotoIcon
                          iconColor = colors.success
                        }

                        return (
                          <div
                            key={fichier.idImage}
                            className="file-item-card"
                            onClick={() => handleOpenFileModal(fichier)}
                          >
                            <Avatar
                              className="file-item-avatar"
                              style={{ backgroundColor: `${iconColor}20`, color: iconColor }}
                            >
                              <Icon />
                            </Avatar>
                            <Typography className="file-item-name">{fichier.nomFichier}</Typography>
                            <Typography className="file-item-date">
                              {new Date(fichier.dateUpload).toLocaleDateString()}
                            </Typography>
                            <IconButton className="file-item-action">
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <Box className="no-files-container">
                      <DescriptionIcon className="no-files-icon" />
                      <Typography variant="h6" className="no-files-text">
                        Aucun fichier associé à cette consultation
                      </Typography>
                    </Box>
                  )}
                </motion.div>
              )}

              {activeTab === 2 && (
                <motion.div
                  key="ordonnance"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                >
                  <Paper className="ordonnance-container">
                    {consultation.ordonnance ? (
                      <>
                        <Box className="section-header">
                          <DescriptionIcon />
                          <Typography variant="subtitle1" className="section-title">
                            Ordonnance médicale
                          </Typography>
                        </Box>
                        <Typography
                          variant="body1"
                          className="section-content"
                        >
                          {consultation.ordonnance}
                        </Typography>
                        <Button
                          variant="contained"
                          startIcon={<DownloadIcon />}
                          href={`data:text/plain;charset=utf-8,${encodeURIComponent(consultation.ordonnance)}`}
                          download={`ordonnance_${consultation.idConsultation}.txt`}
                          className="download-ordonnance-button"
                        >
                          Télécharger l'ordonnance
                        </Button>
                      </>
                    ) : (
                      <Box className="no-ordonnance-container">
                        <DescriptionIcon className="no-ordonnance-icon" />
                        <Typography variant="h6" className="no-ordonnance-text">
                          Aucune ordonnance disponible pour cette consultation
                        </Typography>
                      </Box>
                    )}
                  </Paper>
                </motion.div>
              )}
            </AnimatePresence>

            <Box className="modal-footer">
              <Button
                variant="contained"
                onClick={onClose}
                className="close-button"
              >
                Fermer
              </Button>
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
  const [editDossier, setEditDossier] = useState({
    diagnostic: "",
    traitement: "",
    etat: "",
    groupeSanguin: "",
    antecedentsMedicaux: "",
    allergies: "",
    notesComplementaires: "",
  })
  const [imageFile, setImageFile] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("tous")
  const [loadingConsultations, setLoadingConsultations] = useState({})

  const validBloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]

  const fetchDossiers = async () => {
    setLoading(true)
    try {
      const response = await getDossiersForInfirmier()
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
        return { ...consultation, images: consultationImages }
      })

      setDossiers((prevDossiers) =>
        prevDossiers.map((d) =>
          d.idDossier === dossier.idDossier
            ? { ...d, consultations: consultationsWithImages, consultationsLoaded: true, fichiers: images }
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
      diagnostic: dossier.diagnostic || "",
      traitement: dossier.traitement || "",
      etat: dossier.etat || "en cours",
      groupeSanguin: dossier.groupeSanguin || "",
      antecedentsMedicaux: dossier.antecedentsMedicaux || "",
      allergies: dossier.allergies || "",
      notesComplementaires: dossier.notesComplementaires || "",
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
    if (!dossier.consultationsLoaded) {
      fetchConsultationsForDossier(dossier)
    }
  }

  const handleUpdateDossier = async (e) => {
    e.preventDefault()

    if (editDossier.groupeSanguin && !validBloodGroups.includes(editDossier.groupeSanguin)) {
      toast.error("Groupe sanguin invalide. Veuillez sélectionner une option valide.")
      return
    }

    const maxLength = 1000
    if (editDossier.antecedentsMedicaux.length > maxLength) {
      toast.error("Les antécédents médicaux ne peuvent pas dépasser 1000 caractères.")
      return
    }
    if (editDossier.allergies.length > maxLength) {
      toast.error("Les allergies ne peuvent pas dépasser 1000 caractères.")
      return
    }
    if (editDossier.notesComplementaires.length > maxLength) {
      toast.error("Les notes complémentaires ne peuvent pas dépasser 1000 caractères.")
      return
    }

    try {
      const updateData = {
        ...editDossier,
        groupeSanguin: editDossier.groupeSanguin || null,
      }
      await updateDossier(selectedDossier.idDossier, updateData)
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

      const dossier = dossiers.find((d) => d.idDossier === selectedDossier.idDossier)
      if (dossier) fetchConsultationsForDossier(dossier)
    } catch (error) {
      toast.error("Erreur ajout fichier : " + (error.response?.data?.message || "Erreur inconnue"))
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

  const filteredDossiers = dossiers.filter((dossier) => {
    const matchesSearch =
      searchTerm === "" ||
      dossier.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dossier.prenom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dossier.idDossier.toString().includes(searchTerm)

    const matchesStatus = filterStatus === "tous" || dossier.etat === filterStatus

    return matchesSearch && matchesStatus
  })

  if (loading) {
    return (
      <Box className="loading-container">
        <CircularProgress size={60} />
        <Typography className="loading-text">
          Chargement des dossiers...
        </Typography>
      </Box>
    )
  }

  return (
    <Box className="main-container">
      {/* En-tête */}
      <motion.div className="header-motion">
        <Box className="header-container">
          <Box className="header-info">
            <Avatar className="header-avatar">
              <FolderIcon />
            </Avatar>
            <Box>
              <Typography
                variant={isMobile ? "h5" : "h4"}
                className="header-title"
              >
                Gestion des dossiers
              </Typography>
              <Typography variant="body1" className="header-subtitle">
                {filteredDossiers.length} dossier{filteredDossiers.length !== 1 ? "s" : ""} patient
                {filteredDossiers.length !== 1 ? "s" : ""}
              </Typography>
            </Box>
          </Box>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            className="refresh-button"
            aria-label="Rafraîchir les dossiers"
          >
            Rafraîchir
          </Button>
        </Box>
      </motion.div>

      {/* Barre de recherche */}
      <motion.div className="search-motion">
        <Paper className="search-container">
          <Box className="search-content">
            <Box className="search-input-container">
              <TextField
                placeholder="Rechercher un patient..."
                variant="outlined"
                fullWidth
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                  endAdornment: searchTerm && (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setSearchTerm("")} aria-label="Effacer la recherche">
                        <ClearIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                className="search-input"
                aria-label="Rechercher un patient par nom ou ID"
              />
            </Box>
            <Box className="filter-container">
              <FilterListIcon />
              <Select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                displayEmpty
                className="filter-select"
                aria-label="Filtrer par statut"
              >
                <MenuItem value="tous">Tous les statuts</MenuItem>
                <MenuItem value="en cours">En cours</MenuItem>
                <MenuItem value="traité">Traité</MenuItem>
              </Select>
            </Box>
          </Box>
        </Paper>
      </motion.div>

      {filteredDossiers.length === 0 ? (
        <motion.div className="no-dossiers-motion">
          <Paper className="no-dossiers-container">
            <FolderIcon className="no-dossiers-icon" />
            <Typography variant="h6" className="no-dossiers-text">
              {searchTerm || filterStatus !== "tous"
                ? "Aucun dossier ne correspond à votre recherche"
                : "Aucun dossier assigné"}
            </Typography>
            <Button
              variant="contained"
              startIcon={<RefreshIcon />}
              onClick={handleRefresh}
              className="refresh-dossiers-button"
              aria-label="Rafraîchir les dossiers"
            >
              Rafraîchir les dossiers
            </Button>
          </Paper>
        </motion.div>
      ) : (
        <Box className="dossiers-list">
          <Box className="dossiers-container">
            <AnimatePresence>
              {filteredDossiers.map((dossier, index) => {
                const isExpanded = expandedDossier?.idDossier === dossier.idDossier
                return (
                  <Box key={dossier.idDossier} className="dossier-item">
                    <motion.div
                      custom={index}
                      className="dossier-motion"
                    >
                      <Card
                        className={`dossier-card ${isExpanded ? 'expanded' : ''}`}
                      >
                        <CardHeader
                          avatar={
                            <Avatar className="dossier-avatar">
                              {dossier.nom?.charAt(0) || "P"}
                            </Avatar>
                          }
                          title={
                            <Box className="dossier-title-container">
                              <Typography
                                variant="h6"
                                className="dossier-title"
                              >
                                {dossier.nom} {dossier.prenom}
                              </Typography>
                              <Chip
                                label={dossier.etat}
                                icon={dossier.etat === "en cours" ? <AccessTimeIcon /> : <CheckCircleIcon />}
                                className="status-chip"
                              />
                            </Box>
                          }
                          subheader={
                            <Box className="dossier-subheader">
                              <Chip
                                label={`ID Patient: ${dossier.idPatient}`}
                                size="small"
                                variant="outlined"
                                className="id-chip"
                              />
                              <Chip
                                label={`Dossier: ${dossier.idDossier}`}
                                size="small"
                                variant="outlined"
                                className="id-chip"
                              />
                            </Box>
                          }
                          action={
                            <Box className="dossier-actions">
                              <AnimatePresence>
                                {isExpanded && (
                                  <>
                                    <motion.div
                                      className="action-motion"
                                    >
                                      <Tooltip title="Modifier le dossier">
                                        <IconButton
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            handleOpenEditModal(dossier)
                                          }}
                                          className="edit-button"
                                          aria-label="Modifier le dossier"
                                        >
                                          <EditIcon />
                                        </IconButton>
                                      </Tooltip>
                                    </motion.div>
                                    <motion.div
                                      className="action-motion"
                                    >
                                      <Tooltip title="Ajouter un fichier">
                                        <IconButton
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            handleOpenImageModal(dossier)
                                          }}
                                          className="add-file-button"
                                          aria-label="Ajouter un fichier"
                                        >
                                          <ImageIcon />
                                        </IconButton>
                                      </Tooltip>
                                    </motion.div>
                                  </>
                                )}
                              </AnimatePresence>
                              <motion.div className="expand-motion">
                                <IconButton
                                  onClick={() => handleToggleExpand(dossier)}
                                  className="expand-button"
                                  aria-label={isExpanded ? "Réduire le dossier" : "Étendre le dossier"}
                                >
                                  <ExpandMoreIcon />
                                </IconButton>
                              </motion.div>
                            </Box>
                          }
                          className="dossier-header"
                          onClick={() => handleToggleExpand(dossier)}
                        />

                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div className="dossier-content-motion">
                              <CardContent className="dossier-content">
                                <Grid container spacing={2}>
                                  <Grid item xs={12}>
                                    <Paper
                                      className="patient-info-container"
                                    >
                                      <Box className="section-header">
                                        <PersonIcon />
                                        <Typography
                                          variant="h6"
                                          className="section-title"
                                        >
                                          Informations du patient
                                        </Typography>
                                      </Box>
                                      <Box className="info-list">
                                        <Box className="info-item">
                                          <EmailIcon />
                                          <Typography variant="body2" className="info-text">
                                            Email: {dossier.email || "Non spécifié"}
                                          </Typography>
                                        </Box>
                                        <Box className="info-item">
                                          <PhoneIcon />
                                          <Typography variant="body2" className="info-text">
                                            Téléphone: {dossier.telephone || "Non spécifié"}
                                          </Typography>
                                        </Box>
                                        <Box className="info-item">
                                          <CalendarMonthIcon />
                                          <Typography variant="body2" className="info-text">
                                            Date de création: {formatDate(dossier.dateCreation)}
                                          </Typography>
                                        </Box>
                                      </Box>
                                    </Paper>
                                  </Grid>

                                  <Grid item xs={12}>
                                    <motion.div
                                      initial={{ opacity: 0, y: 20 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      transition={{ duration: 0.4, ease: "easeOut" }}
                                    >
                                      <Paper className="medical-info-container">
                                        <Box className="section-header">
                                          <MedicalServicesIcon />
                                          <Typography variant="h6" className="section-title">
                                            Informations médicales
                                          </Typography>
                                        </Box>
                                        <Box className="info-list">
                                          <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: 0.1, duration: 0.3 }}
                                          >
                                            <Typography variant="body2" className="info-label">
                                              Diagnostic:
                                            </Typography>
                                            <Typography variant="body2" className="info-content">
                                              {dossier.diagnostic || "Non spécifié"}
                                            </Typography>
                                          </motion.div>
                                          <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: 0.2, duration: 0.3 }}
                                          >
                                            <Typography variant="body2" className="info-label">
                                              Traitement:
                                            </Typography>
                                            <Typography variant="body2" className="info-content">
                                              {dossier.traitement || "Non spécifié"}
                                            </Typography>
                                          </motion.div>
                                          <motion.div
                                            className="info-item"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: 0.3, duration: 0.3 }}
                                          >
                                            <BloodtypeIcon />
                                            <Typography variant="body2" className="info-text">
                                              Groupe Sanguin: {dossier.groupeSanguin || "Non spécifié"}
                                            </Typography>
                                          </motion.div>
                                          {dossier.allergies && (
                                            <motion.div
                                              className="allergies-warning"
                                              initial={{ opacity: 0 }}
                                              animate={{ opacity: 1 }}
                                              transition={{ delay: 0.4, duration: 0.3 }}
                                            >
                                              <WarningIcon />
                                              <Box>
                                                <Typography variant="body2" className="allergies-text">
                                                  Allergies: {dossier.allergies}
                                                </Typography>
                                              </Box>
                                            </motion.div>
                                          )}
                                        </Box>
                                      </Paper>
                                    </motion.div>
                                  </Grid>

                                  <Grid item xs={12}>
                                    <Paper
                                      className="additional-info-container"
                                    >
                                      <Box className="section-header">
                                        <NoteIcon />
                                        <Typography
                                          variant="h6"
                                          className="section-title"
                                        >
                                          Informations complémentaires
                                        </Typography>
                                      </Box>
                                      <Box className="info-list">
                                        {dossier.antecedentsMedicaux && (
                                          <Box>
                                            <Typography
                                              variant="body2"
                                              className="info-label"
                                            >
                                              Antécédents médicaux:
                                            </Typography>
                                            <Typography variant="body2" className="info-content">
                                              {dossier.antecedentsMedicaux}
                                            </Typography>
                                          </Box>
                                        )}
                                        {dossier.notesComplementaires && (
                                          <Box>
                                            <Typography
                                              variant="body2"
                                              className="info-label"
                                            >
                                              Notes complémentaires:
                                            </Typography>
                                            <Typography variant="body2" className="info-content">
                                              {dossier.notesComplementaires}
                                            </Typography>
                                          </Box>
                                        )}
                                        {!dossier.antecedentsMedicaux && !dossier.notesComplementaires && (
                                          <Typography
                                            variant="body2"
                                            className="no-info-text"
                                          >
                                            Aucune information complémentaire
                                          </Typography>
                                        )}
                                      </Box>
                                    </Paper>
                                  </Grid>
                                </Grid>

                                <Box className="consultations-section">
                                  <Paper
                                    className="consultations-container"
                                  >
                                    <Box
                                      className="consultations-header"
                                    >
                                      <Box className="section-header">
                                        <NoteIcon />
                                        <Typography
                                          variant="h6"
                                          className="section-title"
                                        >
                                          Consultations
                                        </Typography>
                                        <Badge
                                          badgeContent={dossier.consultations?.length || 0}
                                          className="consultations-badge"
                                        />
                                      </Box>
                                      <Button
                                        variant="contained"
                                        startIcon={
                                          loadingConsultations[dossier.idDossier] ? (
                                            <CircularProgress size={20} color="inherit" />
                                          ) : (
                                            <NoteIcon />
                                          )
                                        }
                                        onClick={() => fetchConsultationsForDossier(dossier)}
                                        disabled={
                                          loadingConsultations[dossier.idDossier] || dossier.consultationsLoaded
                                        }
                                        className="load-consultations-button"
                                        aria-label={
                                          dossier.consultationsLoaded
                                            ? "Consultations chargées"
                                            : "Charger les consultations"
                                        }
                                      >
                                        {loadingConsultations[dossier.idDossier]
                                          ? "Chargement..."
                                          : dossier.consultationsLoaded
                                            ? "Consultations chargées"
                                            : "Charger les consultations"}
                                      </Button>
                                    </Box>

                                    <Box className="consultations-content">
                                      {loadingConsultations[dossier.idDossier] ? (
                                        <Box className="loading-consultations">
                                          <CircularProgress />
                                          <Typography className="loading-consultations-text">
                                            Chargement des consultations...
                                          </Typography>
                                        </Box>
                                      ) : dossier.consultationsLoaded && dossier.consultations.length > 0 ? (
                                        <Grid container spacing={2}>
                                          {dossier.consultations.map((consultation) => (
                                            <Grid
                                              item
                                              xs={12}
                                              sm={6}
                                              md={4}
                                              lg={3}
                                              key={consultation.idConsultation}
                                            >
                                              <Card
                                                className="consultation-card"
                                                onClick={() =>
                                                  handleOpenConsultationDetailsModal(consultation, dossier)
                                                }
                                              >
                                                <CardHeader
                                                  avatar={
                                                    <Avatar className="consultation-avatar">
                                                      <LocalHospitalIcon />
                                                    </Avatar>
                                                  }
                                                  title={
                                                    <Typography
                                                      variant="subtitle1"
                                                      className="consultation-title"
                                                    >
                                                      {formatDate(consultation.dateConsultation)}
                                                    </Typography>
                                                  }
                                                  subheader={
                                                    <Typography variant="body2" className="consultation-id">
                                                      ID: {consultation.idConsultation}
                                                    </Typography>
                                                  }
                                                />
                                                <CardContent className="consultation-content">
                                                  <Typography
                                                    variant="body2"
                                                    className="consultation-notes"
                                                  >
                                                    {consultation.notes
                                                      ? consultation.notes.length > 80
                                                        ? `${consultation.notes.substring(0, 80)}...`
                                                        : consultation.notes
                                                      : "Aucune note disponible"}
                                                  </Typography>
                                                  {consultation.images && consultation.images.length > 0 && (
                                                    <Box className="consultation-files">
                                                      <PhotoIcon />
                                                      <Typography variant="caption" className="files-count">
                                                        {consultation.images.length} fichier
                                                        {consultation.images.length !== 1 ? "s" : ""}
                                                      </Typography>
                                                    </Box>
                                                  )}
                                                </CardContent>
                                                <CardActions>
                                                  <Button
                                                    size="small"
                                                    startIcon={<VisibilityIcon />}
                                                    className="details-button"
                                                    aria-label="Voir les détails de la consultation"
                                                  >
                                                    Détails
                                                  </Button>
                                                </CardActions>
                                              </Card>
                                            </Grid>
                                          ))}
                                        </Grid>
                                      ) : dossier.consultationsLoaded ? (
                                        <Box className="no-consultations">
                                          <NoteIcon
                                            className="no-consultations-icon"
                                          />
                                          <Typography variant="h6" className="no-consultations-text">
                                            Aucune consultation enregistrée
                                          </Typography>
                                        </Box>
                                      ) : (
                                        <Box className="load-consultations-placeholder">
                                          <Typography variant="h6" className="placeholder-text">
                                            Cliquez sur "Charger les consultations" pour afficher l'historique
                                          </Typography>
                                        </Box>
                                      )}
                                    </Box>
                                  </Paper>
                                </Box>
                              </CardContent>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </Card>
                    </motion.div>
                  </Box>
                )
              })}
            </AnimatePresence>
          </Box>
        </Box>
      )}

      {/* Modale pour modifier un dossier */}
      <Modal open={openEditModal} onClose={() => setOpenEditModal(false)}>
        <motion.div className="modal-content">
          <Box className="edit-modal">
            <Box className="modal-header">
              <Box className="header-content">
                <Avatar className="header-avatar">
                  <EditIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" className="modal-title">
                    Modifier le dossier
                  </Typography>
                  {selectedDossier && (
                    <Typography variant="body2" className="modal-subtitle">
                      Patient: {selectedDossier.nom} {selectedDossier.prenom} | ID: {selectedDossier.idDossier}
                    </Typography>
                  )}
                </Box>
              </Box>
            </Box>

            <form onSubmit={handleUpdateDossier}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" className="form-label">
                    Diagnostic *
                  </Typography>
                  <TextField
                    value={editDossier.diagnostic}
                    onChange={(e) => setEditDossier({ ...editDossier, diagnostic: e.target.value })}
                    fullWidth
                    required
                    multiline
                    rows={3}
                    variant="outlined"
                    className="form-input"
                    aria-label="Diagnostic médical"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" className="form-label">
                    Traitement *
                  </Typography>
                  <TextField
                    value={editDossier.traitement}
                    onChange={(e) => setEditDossier({ ...editDossier, traitement: e.target.value })}
                    fullWidth
                    required
                    multiline
                    rows={3}
                    variant="outlined"
                    className="form-input"
                    aria-label="Traitement médical"
                  />
                </Grid>
              </Grid>

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" className="form-label">
                    État
                  </Typography>
                  <Select
                    value={editDossier.etat}
                    onChange={(e) => setEditDossier({ ...editDossier, etat: e.target.value })}
                    fullWidth
                    className="form-select"
                    aria-label="Statut du dossier"
                  >
                    <MenuItem value="en cours">En cours</MenuItem>
                    <MenuItem value="traité">Traité</MenuItem>
                  </Select>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" className="form-label">
                    Groupe Sanguin
                  </Typography>
                  <FormControl fullWidth>
                    <Select
                      value={editDossier.groupeSanguin}
                      onChange={(e) => setEditDossier({ ...editDossier, groupeSanguin: e.target.value })}
                      displayEmpty
                      className="form-select"
                      aria-label="Groupe sanguin"
                    >
                      <MenuItem value="">Aucun</MenuItem>
                      {validBloodGroups.map((group) => (
                        <MenuItem key={group} value={group}>
                          {group}
                        </MenuItem>
                      ))}
                    </Select>
                    <FormHelperText className="form-helper-text">
                      Optionnel : sélectionnez un groupe sanguin si connu
                    </FormHelperText>
                  </FormControl>
                </Grid>
              </Grid>

              <Typography variant="body2" className="form-label">
                Antécédents Médicaux
              </Typography>
              <TextField
                value={editDossier.antecedentsMedicaux}
                onChange={(e) => setEditDossier({ ...editDossier, antecedentsMedicaux: e.target.value })}
                fullWidth
                variant="outlined"
                multiline
                rows={3}
                className="form-input"
                aria-label="Antécédents médicaux"
              />

              <Typography variant="body2" className="form-label">
                Allergies
              </Typography>
              <TextField
                value={editDossier.allergies}
                onChange={(e) => setEditDossier({ ...editDossier, allergies: e.target.value })}
                fullWidth
                variant="outlined"
                multiline
                rows={2}
                className="form-input"
                aria-label="Allergies"
              />

              <Typography variant="body2" className="form-label">
                Notes Complémentaires
              </Typography>
              <TextField
                value={editDossier.notesComplementaires}
                onChange={(e) => setEditDossier({ ...editDossier, notesComplementaires: e.target.value })}
                fullWidth
                variant="outlined"
                multiline
                rows={2}
                className="form-input"
                aria-label="Notes complémentaires"
              />

              <Box className="modal-footer">
                <Button
                  variant="outlined"
                  onClick={() => setOpenEditModal(false)}
                  className="cancel-button"
                  aria-label="Annuler la modification"
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  className="submit-button"
                  aria-label="Mettre à jour le dossier"
                >
                  Mettre à jour
                </Button>
              </Box>
            </form>
          </Box>
        </motion.div>
      </Modal>

      {/* Modale pour ajouter une image */}
      <Modal open={openImageModal} onClose={() => setOpenImageModal(false)}>
        <motion.div className="modal-content">
          <Box className="image-upload-modal">
            <Box className="modal-header">
              <Box className="header-content">
                <Avatar className="header-avatar">
                  <ImageIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" className="modal-title">
                    Ajouter un fichier au dossier
                  </Typography>
                  {selectedDossier && (
                    <Typography variant="body2" className="modal-subtitle">
                      Patient: {selectedDossier.nom} {selectedDossier.prenom} | ID: {selectedDossier.idDossier}
                    </Typography>
                  )}
                </Box>
              </Box>
            </Box>

            <form onSubmit={handleUploadImage}>
              <Typography variant="body2" className="form-label">
                Sélectionner un fichier
              </Typography>
              <Box
                className="file-upload-container"
              >
                <input
                  type="file"
                  id="file-upload"
                  onChange={(e) => setImageFile(e.target.files[0])}
                  style={{ display: "none" }}
                  accept=".dcm,.pdf,.jpg,.jpeg,.png,.docx,.txt"
                  aria-label="Sélectionner un fichier"
                />
                <label htmlFor="file-upload" className="file-upload-label">
                  {imageFile ? (
                    <Box className="file-selected">
                      <Avatar className="file-selected-icon">
                        <DescriptionIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="h6" className="file-name">
                          {imageFile.name}
                        </Typography>
                        <Typography variant="body2" className="file-size">
                          {(imageFile.size / 1024).toFixed(2)} KB
                        </Typography>
                      </Box>
                      <IconButton
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          setImageFile(null)
                        }}
                        className="remove-file-button"
                        aria-label="Supprimer le fichier sélectionné"
                      >
                        <WarningIcon />
                      </IconButton>
                    </Box>
                  ) : (
                    <>
                      <ImageIcon className="upload-icon" />
                      <Typography variant="h6" className="upload-title">
                        Cliquez pour sélectionner un fichier
                      </Typography>
                      <Typography variant="body2" className="upload-hint">
                        Formats supportés: DICOM, PDF, JPG, PNG, DOCX, TXT
                      </Typography>
                    </>
                  )}
                </label>
              </Box>

              <Box className="modal-footer">
                <Button
                  variant="outlined"
                  onClick={() => setOpenImageModal(false)}
                  className="cancel-button"
                  aria-label="Annuler l'ajout de fichier"
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={!imageFile}
                  className="submit-button"
                  aria-label="Ajouter le fichier"
                >
                  Ajouter le fichier
                </Button>
              </Box>
            </form>
          </Box>
        </motion.div>
      </Modal>

      {/* Modales de visualisation et détails */}
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
