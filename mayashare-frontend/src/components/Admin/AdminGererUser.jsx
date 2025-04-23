// src/components/Admin/AdminGererUser.js
import React, { useState, useEffect } from "react";
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
  MenuItem,
  Pagination,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import RefreshIcon from "@mui/icons-material/Refresh";
import {
  createUser,
  getUsers,
  updateUser,
  deleteUser,
} from "../../services/api";

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
    backgroundColor: "rgba(59, 130, 246, 0.1)",
    transition: { duration: 0.2 },
  },
};

const buttonVariants = {
  hover: {
    scale: 1.05,
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
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

function AdminGererUser() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    role: "",
    motDePasse: "",
    email: "",
    telephone: "",
    idHôpital: "",
  });
  const [editId, setEditId] = useState(null);
  const [errors, setErrors] = useState({});
  const [filters, setFilters] = useState({
    role: "",
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    limit: 10,
    page: 1,
  });

  // Charger les utilisateurs
  const handleRefresh = async () => {
    setLoading(true);
    try {
      const response = await getUsers({
        ...filters,
        offset: (filters.page - 1) * filters.limit,
      });
      setUsers(response.data.users);
      setTotal(response.data.total);
      setIsDataLoaded(true);
      toast.success("Liste des utilisateurs chargée avec succès.");
    } catch (err) {
      console.error("Erreur lors de la récupération des utilisateurs :", err);
      toast.error("Erreur lors de la récupération des utilisateurs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isDataLoaded) {
      handleRefresh();
    }
  }, [filters.page, filters.limit]);

  // Gestion des changements dans les filtres
  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
      page: 1,
    });
  };

  // Gestion des changements dans le formulaire
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // Validation du formulaire
  const validateForm = () => {
    const newErrors = {};
    if (!formData.nom || formData.nom.trim() === "") {
      newErrors.nom = "Le nom est requis.";
    }
    if (!formData.prenom || formData.prenom.trim() === "") {
      newErrors.prenom = "Le prénom est requis.";
    }
    if (!formData.role || formData.role.trim() === "") {
      newErrors.role = "Le rôle est requis.";
    }
    if (!formData.email || formData.email.trim() === "") {
      newErrors.email = "L'email est requis.";
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = "Veuillez entrer un email valide.";
    }
    if (!formData.telephone || formData.telephone.trim() === "") {
      newErrors.telephone = "Le téléphone est requis.";
    }
    if ((formData.role === "Médecin" || formData.role === "Infirmier") && !formData.idHôpital) {
      newErrors.idHôpital = "L'ID de l'hôpital est requis pour ce rôle.";
    }
    if (!editId && (!formData.motDePasse || formData.motDePasse.trim() === "")) {
      newErrors.motDePasse = "Le mot de passe est requis.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Ajouter un utilisateur
  const handleAddUser = async () => {
    if (!validateForm()) return;

    try {
      await createUser(formData);
      toast.success("Utilisateur ajouté avec succès.");
      handleCloseAddDialog();
      handleRefresh();
    } catch (err) {
      console.error("Erreur lors de l'ajout de l'utilisateur :", err);
      toast.error(
        err.response?.data?.message || "Erreur lors de l'ajout de l'utilisateur."
      );
    }
  };

  // Ouvrir le formulaire de modification
  const handleEditUser = (user) => {
    setEditId(user.idUtilisateur);
    setFormData({
      nom: user.nom,
      prenom: user.prenom,
      role: user.role,
      motDePasse: "",
      email: user.email,
      telephone: user.telephone,
      idHôpital: user.idHôpital || "",
    });
    setOpenEditDialog(true);
  };

  // Mettre à jour un utilisateur
  const handleUpdateUser = async () => {
    if (!validateForm()) return;

    try {
      await updateUser(editId, formData);
      toast.success("Utilisateur mis à jour avec succès.");
      handleCloseEditDialog();
      handleRefresh();
    } catch (err) {
      console.error("Erreur lors de la mise à jour de l'utilisateur :", err);
      toast.error(
        err.response?.data?.message || "Erreur lors de la mise à jour de l'utilisateur."
      );
    }
  };

  // Supprimer un utilisateur
  const handleDeleteUser = async (id) => {
    if (!window.confirm("Voulez-vous vraiment supprimer cet utilisateur ?")) return;

    try {
      await deleteUser(id);
      toast.success("Utilisateur supprimé avec succès.");
      handleRefresh();
    } catch (err) {
      console.error("Erreur lors de la suppression de l'utilisateur :", err);
      toast.error(
        err.response?.data?.message || "Erreur lors de la suppression de l'utilisateur."
      );
    }
  };

  // Gestion de l'ouverture/fermeture des dialogues
  const handleOpenAddDialog = () => {
    setFormData({
      nom: "",
      prenom: "",
      role: "",
      motDePasse: "",
      email: "",
      telephone: "",
      idHôpital: "",
    });
    setErrors({});
    setOpenAddDialog(true);
  };

  const handleCloseAddDialog = () => {
    setOpenAddDialog(false);
    setErrors({});
  };

  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
    setFormData({
      nom: "",
      prenom: "",
      role: "",
      motDePasse: "",
      email: "",
      telephone: "",
      idHôpital: "",
    });
    setEditId(null);
    setErrors({});
  };

  return (
    <Box
      sx={{
        p: isMobile ? 2 : 3,
        background: "#FFFFFF",
        borderRadius: 3,
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
        minHeight: "100%",
      }}
    >
      <motion.div variants={containerVariants} initial="initial" animate="animate">
        {/* Titre et description */}
        <Typography
          variant="h4"
          gutterBottom
          sx={{
            fontWeight: 600,
            color: "#1E3A8A",
            fontFamily: "Inter, Roboto, sans-serif",
            fontSize: isMobile ? "1.5rem" : "2rem",
          }}
        >
          Gérer les utilisateurs
        </Typography>
        <Typography
          variant="body1"
          gutterBottom
          sx={{
            color: "textSecondary",
            fontFamily: "Inter, Roboto, sans-serif",
            mb: 3,
          }}
        >
          Ici, vous pouvez ajouter, modifier ou supprimer des utilisateurs. Cliquez sur "Rafraîchir" pour charger la liste.
        </Typography>

        {/* Boutons et filtres */}
        <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
          <motion.div variants={buttonVariants} whileHover="hover">
            <Button
              variant="contained"
              sx={{
                background: "linear-gradient(195deg, #1E3A8A, #3B82F6)",
                color: "#FFFFFF",
                fontFamily: "Inter, Roboto, sans-serif",
                px: isMobile ? 2 : 3,
                py: 1.2,
                borderRadius: 2,
                "&:hover": {
                  background: "linear-gradient(195deg, #2563EB, #60A5FA)",
                },
              }}
              onClick={handleOpenAddDialog}
            >
              Ajouter un utilisateur
            </Button>
          </motion.div>
          <motion.div variants={buttonVariants} whileHover="hover">
            <Button
              variant="contained"
              sx={{
                background: "linear-gradient(195deg, #10B981, #34D399)",
                color: "#FFFFFF",
                fontFamily: "Inter, Roboto, sans-serif",
                px: isMobile ? 2 : 3,
                py: 1.2,
                borderRadius: 2,
                "&:hover": {
                  background: "linear-gradient(195deg, #059669, #10B981)",
                },
              }}
              onClick={handleRefresh}
              startIcon={<RefreshIcon />}
              aria-label="Rafraîchir la liste des utilisateurs"
            >
              Rafraîchir
            </Button>
          </motion.div>
          
          {/* Filtres */}
          <TextField
            select
            label="Rôle"
            name="role"
            value={filters.role}
            onChange={handleFilterChange}
            sx={{ minWidth: isMobile ? "100%" : 150 }}
          >
            <MenuItem value="">Tous les rôles</MenuItem>
            <MenuItem value="Médecin">Médecin</MenuItem>
            <MenuItem value="Infirmier">Infirmier</MenuItem>
            <MenuItem value="Admin">Admin</MenuItem>
            <MenuItem value="Patient">Patient</MenuItem>
          </TextField>
          
          <TextField
            label="Nom"
            name="nom"
            value={filters.nom}
            onChange={handleFilterChange}
            sx={{ minWidth: isMobile ? "100%" : 150 }}
          />
          
          <TextField
            label="Prénom"
            name="prenom"
            value={filters.prenom}
            onChange={handleFilterChange}
            sx={{ minWidth: isMobile ? "100%" : 150 }}
          />
        </Box>

        {/* Contenu principal */}
        {loading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              py: 4,
            }}
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1], opacity: [0.8, 1, 0.8] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <CircularProgress sx={{ color: "#2563EB" }} />
            </motion.div>
          </Box>
        ) : !isDataLoaded ? (
          <Box
            sx={{
              textAlign: "center",
              py: 4,
              fontFamily: "Inter, Roboto, sans-serif",
            }}
            aria-live="polite"
          >
            <Typography
              variant="body1"
              sx={{ color: "textSecondary", fontSize: isMobile ? "0.9rem" : "1rem" }}
            >
              Cliquez sur "Rafraîchir" pour charger la liste des utilisateurs.
            </Typography>
          </Box>
        ) : (
          <>
            <TableContainer
              component={Paper}
              sx={{
                background: "rgba(255, 255, 255, 0.9)",
                backdropFilter: "blur(8px)",
                borderRadius: 3,
                boxShadow: "0 4px 16px rgba(0, 0, 0, 0.1)",
                overflowX: "auto",
                mb: 2,
              }}
            >
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell
                      sx={{
                        fontWeight: 600,
                        color: "#1E3A8A",
                        fontFamily: "Inter, Roboto, sans-serif",
                        fontSize: isMobile ? "0.85rem" : "0.9rem",
                      }}
                    >
                      Nom
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 600,
                        color: "#1E3A8A",
                        fontFamily: "Inter, Roboto, sans-serif",
                        fontSize: isMobile ? "0.85rem" : "0.9rem",
                      }}
                    >
                      Prénom
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 600,
                        color: "#1E3A8A",
                        fontFamily: "Inter, Roboto, sans-serif",
                        fontSize: isMobile ? "0.85rem" : "0.9rem",
                      }}
                    >
                      Rôle
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 600,
                        color: "#1E3A8A",
                        fontFamily: "Inter, Roboto, sans-serif",
                        fontSize: isMobile ? "0.85rem" : "0.9rem",
                      }}
                    >
                      Email
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 600,
                        color: "#1E3A8A",
                        fontFamily: "Inter, Roboto, sans-serif",
                        fontSize: isMobile ? "0.85rem" : "0.9rem",
                      }}
                    >
                      Téléphone
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 600,
                        color: "#1E3A8A",
                        fontFamily: "Inter, Roboto, sans-serif",
                        fontSize: isMobile ? "0.85rem" : "0.9rem",
                      }}
                    >
                      Hôpital
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{
                        fontWeight: 600,
                        color: "#1E3A8A",
                        fontFamily: "Inter, Roboto, sans-serif",
                        fontSize: isMobile ? "0.85rem" : "0.9rem",
                      }}
                    >
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        align="center"
                        sx={{ fontFamily: "Inter, Roboto, sans-serif", py: 4 }}
                        aria-live="polite"
                      >
                        Aucun utilisateur trouvé.
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((user) => (
                      <motion.tr
                        key={user.idUtilisateur}
                        variants={rowVariants}
                        initial="initial"
                        animate="animate"
                        whileHover="hover"
                        style={{ cursor: "pointer" }}
                      >
                        <TableCell
                          sx={{
                            fontFamily: "Inter, Roboto, sans-serif",
                            fontSize: isMobile ? "0.8rem" : "0.9rem",
                          }}
                        >
                          {user.nom}
                        </TableCell>
                        <TableCell
                          sx={{
                            fontFamily: "Inter, Roboto, sans-serif",
                            fontSize: isMobile ? "0.8rem" : "0.9rem",
                          }}
                        >
                          {user.prenom}
                        </TableCell>
                        <TableCell
                          sx={{
                            fontFamily: "Inter, Roboto, sans-serif",
                            fontSize: isMobile ? "0.8rem" : "0.9rem",
                          }}
                        >
                          {user.role}
                        </TableCell>
                        <TableCell
                          sx={{
                            fontFamily: "Inter, Roboto, sans-serif",
                            fontSize: isMobile ? "0.8rem" : "0.9rem",
                          }}
                        >
                          {user.email}
                        </TableCell>
                        <TableCell
                          sx={{
                            fontFamily: "Inter, Roboto, sans-serif",
                            fontSize: isMobile ? "0.8rem" : "0.9rem",
                          }}
                        >
                          {user.telephone}
                        </TableCell>
                        <TableCell
                          sx={{
                            fontFamily: "Inter, Roboto, sans-serif",
                            fontSize: isMobile ? "0.8rem" : "0.9rem",
                          }}
                        >
                          {user.idHôpital || "-"}
                        </TableCell>
                        <TableCell align="right">
                          <motion.div
                            whileHover={{ scale: 1.2, rotate: 10 }}
                            transition={{ duration: 0.2 }}
                          >
                            <IconButton
                              color="primary"
                              onClick={() => handleEditUser(user)}
                              aria-label={`Modifier l'utilisateur ${user.nom}`}
                            >
                              <EditIcon />
                            </IconButton>
                          </motion.div>
                          <motion.div
                            whileHover={{ scale: 1.2, rotate: -10 }}
                            transition={{ duration: 0.2 }}
                          >
                            <IconButton
                              color="error"
                              onClick={() => handleDeleteUser(user.idUtilisateur)}
                              aria-label={`Supprimer l'utilisateur ${user.nom}`}
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

            {/* Pagination */}
            <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
              <Pagination
                count={Math.ceil(total / filters.limit)}
                page={filters.page}
                onChange={(event, value) => setFilters({ ...filters, page: value })}
                color="primary"
                shape="rounded"
                sx={{
                  "& .MuiPaginationItem-root": {
                    fontFamily: "Inter, Roboto, sans-serif",
                  },
                }}
              />
            </Box>
          </>
        )}
      </motion.div>

      {/* Dialogue pour ajouter un utilisateur */}
      <Dialog open={openAddDialog} onClose={handleCloseAddDialog}>
        <motion.div
          variants={dialogVariants}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          <DialogTitle
            sx={{
              fontWeight: 600,
              color: "#1E3A8A",
              fontFamily: "Inter, Roboto, sans-serif",
              background: "rgba(255, 255, 255, 0.9)",
              backdropFilter: "blur(8px)",
            }}
          >
            Ajouter un utilisateur
          </DialogTitle>
          <DialogContent
            sx={{
              background: "rgba(255, 255, 255, 0.9)",
              backdropFilter: "blur(8px)",
              fontFamily: "Inter, Roboto, sans-serif",
              pt: 2,
            }}
          >
            <TextField
              label="Nom"
              name="nom"
              value={formData.nom}
              onChange={handleChange}
              fullWidth
              margin="normal"
              error={!!errors.nom}
              helperText={errors.nom}
              aria-required="true"
              sx={{ fontFamily: "Inter, Roboto, sans-serif" }}
            />
            <TextField
              label="Prénom"
              name="prenom"
              value={formData.prenom}
              onChange={handleChange}
              fullWidth
              margin="normal"
              error={!!errors.prenom}
              helperText={errors.prenom}
              aria-required="true"
              sx={{ fontFamily: "Inter, Roboto, sans-serif" }}
            />
            <TextField
              select
              label="Rôle"
              name="role"
              value={formData.role}
              onChange={handleChange}
              fullWidth
              margin="normal"
              error={!!errors.role}
              helperText={errors.role}
              aria-required="true"
              sx={{ fontFamily: "Inter, Roboto, sans-serif" }}
            >
              <MenuItem value="Médecin">Médecin</MenuItem>
              <MenuItem value="Infirmier">Infirmier</MenuItem>
              <MenuItem value="Admin">Admin</MenuItem>
              <MenuItem value="Patient">Patient</MenuItem>
            </TextField>
            <TextField
              label="Mot de passe"
              name="motDePasse"
              type="password"
              value={formData.motDePasse}
              onChange={handleChange}
              fullWidth
              margin="normal"
              error={!!errors.motDePasse}
              helperText={errors.motDePasse}
              aria-required="true"
              sx={{ fontFamily: "Inter, Roboto, sans-serif" }}
            />
            <TextField
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              fullWidth
              margin="normal"
              error={!!errors.email}
              helperText={errors.email}
              aria-required="true"
              sx={{ fontFamily: "Inter, Roboto, sans-serif" }}
            />
            <TextField
              label="Téléphone"
              name="telephone"
              value={formData.telephone}
              onChange={handleChange}
              fullWidth
              margin="normal"
              error={!!errors.telephone}
              helperText={errors.telephone}
              aria-required="true"
              sx={{ fontFamily: "Inter, Roboto, sans-serif" }}
            />
            <TextField
              label="ID Hôpital"
              name="idHôpital"
              value={formData.idHôpital}
              onChange={handleChange}
              fullWidth
              margin="normal"
              error={!!errors.idHôpital}
              helperText={errors.idHôpital}
              disabled={formData.role !== "Médecin" && formData.role !== "Infirmier"}
              sx={{ fontFamily: "Inter, Roboto, sans-serif" }}
            />
          </DialogContent>
          <DialogActions
            sx={{
              background: "rgba(255, 255, 255, 0.9)",
              backdropFilter: "blur(8px)",
              p: 2,
            }}
          >
            <motion.div variants={buttonVariants} whileHover="hover">
              <Button
                onClick={handleCloseAddDialog}
                sx={{ fontFamily: "Inter, Roboto, sans-serif", color: "#1E3A8A" }}
              >
                Annuler
              </Button>
            </motion.div>
            <motion.div variants={buttonVariants} whileHover="hover">
              <Button
                onClick={handleAddUser}
                variant="contained"
                sx={{
                  background: "linear-gradient(195deg, #1E3A8A, #3B82F6)",
                  color: "#FFFFFF",
                  fontFamily: "Inter, Roboto, sans-serif",
                  "&:hover": {
                    background: "linear-gradient(195deg, #2563EB, #60A5FA)",
                  },
                }}
              >
                Ajouter
              </Button>
            </motion.div>
          </DialogActions>
        </motion.div>
      </Dialog>

      {/* Dialogue pour modifier un utilisateur */}
      <Dialog open={openEditDialog} onClose={handleCloseEditDialog}>
        <motion.div
          variants={dialogVariants}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          <DialogTitle
            sx={{
              fontWeight: 600,
              color: "#1E3A8A",
              fontFamily: "Inter, Roboto, sans-serif",
              background: "rgba(255, 255, 255, 0.9)",
              backdropFilter: "blur(8px)",
            }}
          >
            Modifier un utilisateur
          </DialogTitle>
          <DialogContent
            sx={{
              background: "rgba(255, 255, 255, 0.9)",
              backdropFilter: "blur(8px)",
              fontFamily: "Inter, Roboto, sans-serif",
              pt: 2,
            }}
          >
            <TextField
              label="Nom"
              name="nom"
              value={formData.nom}
              onChange={handleChange}
              fullWidth
              margin="normal"
              error={!!errors.nom}
              helperText={errors.nom}
              aria-required="true"
              sx={{ fontFamily: "Inter, Roboto, sans-serif" }}
            />
            <TextField
              label="Prénom"
              name="prenom"
              value={formData.prenom}
              onChange={handleChange}
              fullWidth
              margin="normal"
              error={!!errors.prenom}
              helperText={errors.prenom}
              aria-required="true"
              sx={{ fontFamily: "Inter, Roboto, sans-serif" }}
            />
            <TextField
              select
              label="Rôle"
              name="role"
              value={formData.role}
              onChange={handleChange}
              fullWidth
              margin="normal"
              error={!!errors.role}
              helperText={errors.role}
              aria-required="true"
              sx={{ fontFamily: "Inter, Roboto, sans-serif" }}
            >
              <MenuItem value="Médecin">Médecin</MenuItem>
              <MenuItem value="Infirmier">Infirmier</MenuItem>
              <MenuItem value="Admin">Admin</MenuItem>
              <MenuItem value="Patient">Patient</MenuItem>
            </TextField>
            <TextField
              label="Mot de passe (facultatif)"
              name="motDePasse"
              type="password"
              value={formData.motDePasse}
              onChange={handleChange}
              fullWidth
              margin="normal"
              helperText="Laisser vide pour ne pas modifier"
              sx={{ fontFamily: "Inter, Roboto, sans-serif" }}
            />
            <TextField
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              fullWidth
              margin="normal"
              error={!!errors.email}
              helperText={errors.email}
              aria-required="true"
              sx={{ fontFamily: "Inter, Roboto, sans-serif" }}
            />
            <TextField
              label="Téléphone"
              name="telephone"
              value={formData.telephone}
              onChange={handleChange}
              fullWidth
              margin="normal"
              error={!!errors.telephone}
              helperText={errors.telephone}
              aria-required="true"
              sx={{ fontFamily: "Inter, Roboto, sans-serif" }}
            />
            <TextField
              label="ID Hôpital"
              name="idHôpital"
              value={formData.idHôpital}
              onChange={handleChange}
              fullWidth
              margin="normal"
              error={!!errors.idHôpital}
              helperText={errors.idHôpital}
              disabled={formData.role !== "Médecin" && formData.role !== "Infirmier"}
              sx={{ fontFamily: "Inter, Roboto, sans-serif" }}
            />
          </DialogContent>
          <DialogActions
            sx={{
              background: "rgba(255, 255, 255, 0.9)",
              backdropFilter: "blur(8px)",
              p: 2,
            }}
          >
            <motion.div variants={buttonVariants} whileHover="hover">
              <Button
                onClick={handleCloseEditDialog}
                sx={{ fontFamily: "Inter, Roboto, sans-serif", color: "#1E3A8A" }}
              >
                Annuler
              </Button>
            </motion.div>
            <motion.div variants={buttonVariants} whileHover="hover">
              <Button
                onClick={handleUpdateUser}
                variant="contained"
                sx={{
                  background: "linear-gradient(195deg, #1E3A8A, #3B82F6)",
                  color: "#FFFFFF",
                  fontFamily: "Inter, Roboto, sans-serif",
                  "&:hover": {
                    background: "linear-gradient(195deg, #2563EB, #60A5FA)",
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

export default AdminGererUser;