import React from "react";
import { Box, Typography, Button } from "@mui/material";

function AdminGererUser() {
  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Gérer les utilisateurs
      </Typography>
      <Typography variant="body1" gutterBottom>
        Ici, vous pouvez ajouter, modifier ou supprimer des utilisateurs.
      </Typography>
      <Button variant="contained" color="primary" sx={{ mt: 2 }}>
        Ajouter un utilisateur
      </Button>
    </Box>
  );
}

export default AdminGererUser;