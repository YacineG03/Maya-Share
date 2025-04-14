import React from "react";
import { Box, Typography, Button } from "@mui/material";

function PatientPrendreRDV() {
  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Prendre un rendez-vous
      </Typography>
      <Typography variant="body1" gutterBottom>
        Ici, vous pouvez prendre un nouveau rendez-vous avec un médecin.
      </Typography>
      <Button variant="contained" color="primary" sx={{ mt: 2 }}>
        Prendre un rendez-vous
      </Button>
    </Box>
  );
}

export default PatientPrendreRDV;