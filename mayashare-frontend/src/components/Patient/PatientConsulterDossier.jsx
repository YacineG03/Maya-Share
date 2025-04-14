import React from "react";
import { Box, Typography, Button } from "@mui/material";

function PatientConsulterDossier() {
  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Consulter un dossier médical
      </Typography>
      <Typography variant="body1" gutterBottom>
        Ici, vous pouvez consulter vos dossiers médicaux.
      </Typography>
      <Button variant="contained" color="primary" sx={{ mt: 2 }}>
        Voir les dossiers
      </Button>
    </Box>
  );
}

export default PatientConsulterDossier;