import React from "react";
import { Box, Typography, Button } from "@mui/material";

function PatientConsulterSuivi() {
  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Consulter l'état de suivi
      </Typography>
      <Typography variant="body1" gutterBottom>
        Ici, vous pouvez consulter l'état de suivi de vos soins.
      </Typography>
      <Button variant="contained" color="primary" sx={{ mt: 2 }}>
        Voir l'état de suivi
      </Button>
    </Box>
  );
}

export default PatientConsulterSuivi;