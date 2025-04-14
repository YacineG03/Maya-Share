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
} from "@mui/material";
import { toast } from "react-toastify";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  getHopitaux,
  createHopital,
  updateHopital,
  deleteHopital,
} from "../../services/api";

function AdminGererHopital() {
  const [hopitaux, setHopitaux] = useState([]);
  const [filteredHopitaux, setFilteredHopitaux] = useState([]); // État pour les hôpitaux filtrés
  const [search, setSearch] = useState(""); // État pour la barre de recherche
  const [loading, setLoading] = useState(true);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [formData, setFormData] = useState({
    nom: "",
    adresse: "",
    ville: "",
  });
  const [editId, setEditId] = useState(null);
  const [errors, setErrors] = useState({});

  // Charger la liste des hôpitaux au montage du composant
  useEffect(() => {
    const fetchHopitaux = async () => {
      try {
        const response = await getHopitaux();
        setHopitaux(response.data);
        setFilteredHopitaux(response.data); // Initialiser les hôpitaux filtrés
      } catch (err) {
        console.error("Erreur lors de la récupération des hôpitaux :", err);
        toast.error("Erreur lors de la récupération des hôpitaux.");
      } finally {
        setLoading(false);
      }
    };
    fetchHopitaux();
  }, []);

  // Filtrer les hôpitaux en fonction de la recherche
  useEffect(() => {
    const lowerCaseSearch = search.toLowerCase();
    const filtered = hopitaux.filter(
      (hopital) =>
        hopital.nom.toLowerCase().includes(lowerCaseSearch) ||
        hopital.adresse.toLowerCase().includes(lowerCaseSearch) ||
        hopital.ville.toLowerCase().includes(lowerCaseSearch)
    );
    setFilteredHopitaux(filtered);
  }, [search, hopitaux]);

  // Gestion des changements dans le formulaire
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // Gestion de la recherche
  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  // Validation du formulaire
  const validateForm = () => {
    const newErrors = {};
    if (!formData.nom || formData.nom.trim() === "") {
      newErrors.nom = "Le nom de l’hôpital est requis.";
    }
    if (!formData.adresse || formData.adresse.trim() === "") {
      newErrors.adresse = "L’adresse est requise.";
    }
    if (!formData.ville || formData.ville.trim() === "") {
      newErrors.ville = "La ville est requise.";
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
      setFilteredHopitaux((prev) => [...prev, newHopital]); // Mettre à jour les hôpitaux filtrés
      setOpenAddDialog(false);
      setFormData({ nom: "", adresse: "", ville: "" });
      toast.success("Hôpital ajouté avec succès.");
    } catch (err) {
      console.error("Erreur lors de l’ajout de l’hôpital :", err);
      toast.error(
        err.response?.data?.message || "Erreur lors de l’ajout de l’hôpital."
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
      setFormData({ nom: "", adresse: "", ville: "" });
      setEditId(null);
      toast.success("Hôpital mis à jour avec succès.");
    } catch (err) {
      console.error("Erreur lors de la mise à jour de l’hôpital :", err);
      toast.error(
        err.response?.data?.message ||
          "Erreur lors de la mise à jour de l’hôpital."
      );
    }
  };

  // Supprimer un hôpital
  const handleDeleteHopital = async (id) => {
    if (!window.confirm("Voulez-vous vraiment supprimer cet hôpital ?")) return;

    try {
      await deleteHopital(id);
      setHopitaux((prev) => prev.filter((hopital) => hopital.id !== id));
      setFilteredHopitaux((prev) =>
        prev.filter((hopital) => hopital.id !== id)
      );
      toast.success("Hôpital supprimé avec succès.");
    } catch (err) {
      console.error("Erreur lors de la suppression de l’hôpital :", err);
      toast.error(
        err.response?.data?.message ||
          "Erreur lors de la suppression de l’hôpital."
      );
    }
  };

  // Gestion de l'ouverture/fermeture des dialogues
  const handleOpenAddDialog = () => {
    setFormData({ nom: "", adresse: "", ville: "" });
    setErrors({});
    setOpenAddDialog(true);
  };

  const handleCloseAddDialog = () => {
    setOpenAddDialog(false);
    setErrors({});
  };

  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
    setFormData({ nom: "", adresse: "", ville: "" });
    setEditId(null);
    setErrors({});
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Gérer les hôpitaux
      </Typography>
      <Typography variant="body1" gutterBottom>
        Ici, vous pouvez ajouter, modifier ou supprimer des hôpitaux.
      </Typography>
      <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleOpenAddDialog}
        >
          Ajouter un hôpital
        </Button>
        <TextField
          label="Rechercher un hôpital"
          value={search}
          onChange={handleSearchChange}
          fullWidth
          sx={{ maxWidth: 400 }}
        />
      </Box>

      {/* Tableau des hôpitaux */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nom</TableCell>
              <TableCell>Adresse</TableCell>
              <TableCell>Ville</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredHopitaux.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  Aucun hôpital trouvé.
                </TableCell>
              </TableRow>
            ) : (
              filteredHopitaux.map((hopital) => (
                <TableRow key={hopital.id}>
                  <TableCell>{hopital.nom}</TableCell>
                  <TableCell>{hopital.adresse}</TableCell>
                  <TableCell>{hopital.ville}</TableCell>
                  <TableCell align="right">
                    <IconButton
                      color="primary"
                      onClick={() => handleEditHopital(hopital)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleDeleteHopital(hopital.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialogue pour ajouter un hôpital */}
      <Dialog open={openAddDialog} onClose={handleCloseAddDialog}>
        <DialogTitle>Ajouter un hôpital</DialogTitle>
        <DialogContent>
          <TextField
            label="Nom"
            name="nom"
            value={formData.nom}
            onChange={handleChange}
            fullWidth
            margin="normal"
            error={!!errors.nom}
            helperText={errors.nom}
          />
          <TextField
            label="Adresse"
            name="adresse"
            value={formData.adresse}
            onChange={handleChange}
            fullWidth
            margin="normal"
            error={!!errors.adresse}
            helperText={errors.adresse}
          />
          <TextField
            label="Ville"
            name="ville"
            value={formData.ville}
            onChange={handleChange}
            fullWidth
            margin="normal"
            error={!!errors.ville}
            helperText={errors.ville}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddDialog}>Annuler</Button>
          <Button onClick={handleAddHopital} variant="contained" color="primary">
            Ajouter
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialogue pour modifier un hôpital */}
      <Dialog open={openEditDialog} onClose={handleCloseEditDialog}>
        <DialogTitle>Modifier un hôpital</DialogTitle>
        <DialogContent>
          <TextField
            label="Nom"
            name="nom"
            value={formData.nom}
            onChange={handleChange}
            fullWidth
            margin="normal"
            error={!!errors.nom}
            helperText={errors.nom}
          />
          <TextField
            label="Adresse"
            name="adresse"
            value={formData.adresse}
            onChange={handleChange}
            fullWidth
            margin="normal"
            error={!!errors.adresse}
            helperText={errors.adresse}
          />
          <TextField
            label="Ville"
            name="ville"
            value={formData.ville}
            onChange={handleChange}
            fullWidth
            margin="normal"
            error={!!errors.ville}
            helperText={errors.ville}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog}>Annuler</Button>
          <Button
            onClick={handleUpdateHopital}
            variant="contained"
            color="primary"
          >
            Mettre à jour
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default AdminGererHopital;