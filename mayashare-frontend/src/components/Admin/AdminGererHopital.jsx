import React from "react";
import { Box, Typography, Button } from "@mui/material";

function AdminGererHopital() {
  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Gérer les hôpitaux
      </Typography>
      <Typography variant="body1" gutterBottom>
        Ici, vous pouvez ajouter, modifier ou supprimer des hôpitaux.
      </Typography>
      <Button variant="contained" color="primary" sx={{ mt: 2 }}>
        Ajouter un hôpital
      </Button>
    </Box>
  );
}

export default AdminGererHopital;