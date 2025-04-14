import React from "react";
import { Box, Typography, Button } from "@mui/material";

function InfirmierGererDossier() {
  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Gérer les dossiers patients
      </Typography>
      <Typography variant="body1" gutterBottom>
        Ici, vous pouvez consulter, ajouter ou modifier des dossiers patients.
      </Typography>
      <Button variant="contained" color="primary" sx={{ mt: 2 }}>
        Ajouter un dossier
      </Button>
    </Box>
  );
}

export default InfirmierGererDossier;