// src/components/Admin/AdminGererUser.js
import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  TextField,
  MenuItem,
  IconButton,
  Pagination,
  Modal,
  CircularProgress,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { toast } from "react-toastify";
import { createUser, getUsers, updateUser, deleteUser } from "../../services/api"; // À implémenter

function AdminGererUser() {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({
    role: "",
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    limit: 10,
    page: 1,
  });
  const [loading, setLoading] = useState(false);
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    role: "",
    motDePasse: "",
    email: "",
    telephone: "",
    idHôpital: "",
  });
  const [editUserId, setEditUserId] = useState(null);

  // Récupérer les utilisateurs avec filtres et pagination
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await getUsers({
        ...filters,
        offset: (filters.page - 1) * filters.limit,
      });
      setUsers(response.data.users);
      setTotal(response.data.total);
    } catch (err) {
      toast.error("Erreur lors de la récupération des utilisateurs.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [filters]);

  // Gérer les changements dans les filtres
  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
      page: 1, // Réinitialiser à la première page lors d'un changement de filtre
    });
  };

  // Gérer le changement de page
  const handlePageChange = (event, value) => {
    setFilters({ ...filters, page: value });
  };

  // Ouvrir/fermer les modals
  const handleOpenCreateModal = () => {
    setFormData({
      nom: "",
      prenom: "",
      role: "",
      motDePasse: "",
      email: "",
      telephone: "",
      idHôpital: "",
    });
    setOpenCreateModal(true);
  };

  const handleOpenEditModal = (user) => {
    setFormData({
      nom: user.nom,
      prenom: user.prenom,
      role: user.role,
      motDePasse: "", // Ne pas pré-remplir le mot de passe
      email: user.email,
      telephone: user.telephone,
      idHôpital: user.idHôpital || "",
    });
    setEditUserId(user.idUtilisateur);
    setOpenEditModal(true);
  };

  const handleCloseModal = () => {
    setOpenCreateModal(false);
    setOpenEditModal(false);
    setEditUserId(null);
  };

  // Gérer les changements dans le formulaire
  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Soumettre le formulaire de création
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      await createUser(formData);
      toast.success("Utilisateur créé avec succès !");
      handleCloseModal();
      fetchUsers();
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Erreur lors de la création de l'utilisateur.";
      toast.error(errorMessage);
      console.error(err);
    }
  };


  // Soumettre le formulaire de modification
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateUser(editUserId, formData);
      toast.success("Utilisateur mis à jour avec succès !");
      handleCloseModal();
      fetchUsers(); // Rafraîchir la liste
    }  catch (err) {
      const errorMessage = err.response?.data?.message || "Erreur lors de la mise à jour de l'utilisateur.";
      toast.error(errorMessage);
      console.error(err);
    }
  };
  
  // Supprimer un utilisateur
  const handleDelete = async (id) => {
    if (window.confirm("Voulez-vous vraiment supprimer cet utilisateur ?")) {
      try {
        await deleteUser(id);
        toast.success("Utilisateur supprimé avec succès !");
        fetchUsers(); // Rafraîchir la liste
      } catch (err) {
        const errorMessage = err.response?.data?.message || "Erreur lors de la suppression de l'utilisateur.";
        toast.error(errorMessage);
        console.error(err);
      }
    }
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Gérer les utilisateurs
      </Typography>

      {/* Filtres */}
      <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
        <TextField
          select
          label="Rôle"
          name="role"
          value={filters.role}
          onChange={handleFilterChange}
          sx={{ minWidth: 150 }}
        >
          <MenuItem value="">Tous</MenuItem>
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
          sx={{ minWidth: 150 }}
        />
        <TextField
          label="Prénom"
          name="prenom"
          value={filters.prenom}
          onChange={handleFilterChange}
          sx={{ minWidth: 150 }}
        />
        <TextField
          label="Email"
          name="email"
          value={filters.email}
          onChange={handleFilterChange}
          sx={{ minWidth: 150 }}
        />
        <TextField
          label="Téléphone"
          name="telephone"
          value={filters.telephone}
          onChange={handleFilterChange}
          sx={{ minWidth: 150 }}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleOpenCreateModal}
          sx={{ height: "fit-content" }}
        >
          Créer un utilisateur
        </Button>
      </Box>

      {/* Tableaux des utilisateurs */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Nom</TableCell>
                  <TableCell>Prénom</TableCell>
                  <TableCell>Rôle</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Téléphone</TableCell>
                  <TableCell>ID Hôpital</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.idUtilisateur}>
                    <TableCell>{user.nom}</TableCell>
                    <TableCell>{user.prenom}</TableCell>
                    <TableCell>{user.role}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.telephone}</TableCell>
                    <TableCell>{user.idHôpital || "-"}</TableCell>
                    <TableCell>
                      <IconButton
                        color="primary"
                        onClick={() => handleOpenEditModal(user)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => handleDelete(user.idUtilisateur)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
            <Pagination
              count={Math.ceil(total / filters.limit)}
              page={filters.page}
              onChange={handlePageChange}
              color="primary"
            />
          </Box>
        </>
      )}

      {/* Modal pour créer un utilisateur */}
      <Modal open={openCreateModal} onClose={handleCloseModal}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
          }}
        >
          <Typography variant="h6" gutterBottom>
            Créer un utilisateur
          </Typography>
          <Box component="form" onSubmit={handleCreateSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              label="Nom"
              name="nom"
              value={formData.nom}
              onChange={handleFormChange}
              fullWidth
              required
            />
            <TextField
              label="Prénom"
              name="prenom"
              value={formData.prenom}
              onChange={handleFormChange}
              fullWidth
              required
            />
            <TextField
              select
              label="Rôle"
              name="role"
              value={formData.role}
              onChange={handleFormChange}
              fullWidth
              required
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
              onChange={handleFormChange}
              fullWidth
              required
            />
            <TextField
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleFormChange}
              fullWidth
              required
            />
            <TextField
              label="Téléphone"
              name="telephone"
              value={formData.telephone}
              onChange={handleFormChange}
              fullWidth
              required
            />
            <TextField
              label="ID Hôpital"
              name="idHôpital"
              value={formData.idHôpital}
              onChange={handleFormChange}
              fullWidth
              disabled={formData.role !== "Médecin" && formData.role !== "Infirmier"}
            />
            <Box sx={{ display: "flex", gap: 2 }}>
              <Button type="submit" variant="contained" color="primary">
                Créer
              </Button>
              <Button variant="outlined" onClick={handleCloseModal}>
                Annuler
              </Button>
            </Box>
          </Box>
        </Box>
      </Modal>

      {/* Modal pour modifier un utilisateur */}
      <Modal open={openEditModal} onClose={handleCloseModal}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
          }}
        >
          <Typography variant="h6" gutterBottom>
            Modifier un utilisateur
          </Typography>
          <Box component="form" onSubmit={handleEditSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              label="Nom"
              name="nom"
              value={formData.nom}
              onChange={handleFormChange}
              fullWidth
              required
            />
            <TextField
              label="Prénom"
              name="prenom"
              value={formData.prenom}
              onChange={handleFormChange}
              fullWidth
              required
            />
            <TextField
              select
              label="Rôle"
              name="role"
              value={formData.role}
              onChange={handleFormChange}
              fullWidth
              required
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
              onChange={handleFormChange}
              fullWidth
            />
            <TextField
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleFormChange}
              fullWidth
              required
            />
            <TextField
              label="Téléphone"
              name="telephone"
              value={formData.telephone}
              onChange={handleFormChange}
              fullWidth
              required
            />
            <TextField
              label="ID Hôpital"
              name="idHôpital"
              value={formData.idHôpital}
              onChange={handleFormChange}
              fullWidth
              disabled={formData.role !== "Médecin" && formData.role !== "Infirmier"}
            />
            <Box sx={{ display: "flex", gap: 2 }}>
              <Button type="submit" variant="contained" color="primary">
                Enregistrer
              </Button>
              <Button variant="outlined" onClick={handleCloseModal}>
                Annuler
              </Button>
            </Box>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
}

export default AdminGererUser;