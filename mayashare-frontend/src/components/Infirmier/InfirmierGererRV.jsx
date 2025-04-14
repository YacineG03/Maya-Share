import React from "react";
import { Box, Typography, Button } from "@mui/material";

function InfirmierGererRV() {
  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Gérer les rendez-vous
      </Typography>
      <Typography variant="body1" gutterBottom>
        Ici, vous pouvez consulter, ajouter ou modifier des rendez-vous.
      </Typography>
      <Button variant="contained" color="primary" sx={{ mt: 2 }}>
        Ajouter un rendez-vous
      </Button>
    </Box>
  );
}

export default InfirmierGererRV;