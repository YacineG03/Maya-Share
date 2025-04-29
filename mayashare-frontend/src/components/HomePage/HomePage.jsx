// src/pages/HomePage.js
import React from "react";
import {
  Box,
  Typography,
  Button,
  Grid,
  Paper,
  useTheme,
  useMediaQuery,
  Container,
  Divider,
  Avatar,
  Stack,
} from "@mui/material";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import PeopleIcon from "@mui/icons-material/People";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AssignmentIcon from "@mui/icons-material/Assignment";
import HospitalImage from "../assets/hospital.jpg"; // Vous devrez ajouter cette image
import DoctorImage from "../assets/doctor.jpg"; // Vous devrez ajouter cette image

// Animation variants
const containerVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      duration: 0.8,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

const itemVariants = {
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

const buttonVariants = {
  hover: {
    scale: 1.05,
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
    transition: { duration: 0.2 },
  },
};

const featureCardVariants = {
  hover: {
    y: -10,
    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.12)",
    transition: { duration: 0.3 },
  },
};

function HomePage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const features = [
    {
      icon: <MedicalServicesIcon fontSize="large" />,
      title: "Gestion des Patients",
      description: "Suivi complet des dossiers médicaux et historiques des patients.",
      color: "#3B82F6",
    },
    {
      icon: <PeopleIcon fontSize="large" />,
      title: "Gestion du Personnel",
      description: "Administration centralisée des médecins et infirmiers.",
      color: "#10B981",
    },
    {
      icon: <CalendarTodayIcon fontSize="large" />,
      title: "Planification",
      description: "Organisation des rendez-vous et des interventions.",
      color: "#F59E0B",
    },
    {
      icon: <AssignmentIcon fontSize="large" />,
      title: "Rapports Complets",
      description: "Génération de rapports et statistiques détaillées.",
      color: "#8B5CF6",
    },
  ];

  return (
    <Box sx={{ minHeight: "100vh", background: "#F8FAFC" }}>
      {/* Hero Section */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%)",
          color: "white",
          py: 10,
          px: isMobile ? 2 : 10,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <motion.div
          variants={containerVariants}
          initial="initial"
          animate="animate"
        >
          <Container maxWidth="lg">
            <Grid container spacing={6} alignItems="center">
              <Grid item xs={12} md={6}>
                <motion.div variants={itemVariants}>
                  <Typography
                    variant={isMobile ? "h3" : "h2"}
                    gutterBottom
                    sx={{
                      fontWeight: 800,
                      fontFamily: "Inter, Roboto, sans-serif",
                      lineHeight: 1.2,
                    }}
                  >
                    Plateforme Médicale Intégrée
                  </Typography>
                  <Typography
                    variant={isMobile ? "body1" : "h6"}
                    sx={{
                      mb: 4,
                      fontFamily: "Inter, Roboto, sans-serif",
                      opacity: 0.9,
                      lineHeight: 1.6,
                    }}
                  >
                    Une solution complète pour la gestion des patients, du personnel et des rendez-vous dans votre établissement de santé.
                  </Typography>
                  <Stack direction="row" spacing={2}>
                    <motion.div variants={buttonVariants} whileHover="hover">
                      <Button
                        component={Link}
                        to="/login"
                        variant="contained"
                        size="large"
                        sx={{
                          background: "white",
                          color: "#1E3A8A",
                          fontWeight: 600,
                          fontFamily: "Inter, Roboto, sans-serif",
                          px: 4,
                          py: 1.5,
                          borderRadius: 2,
                          "&:hover": {
                            background: "rgba(255, 255, 255, 0.9)",
                          },
                        }}
                      >
                        Se Connecter
                      </Button>
                    </motion.div>
                    <motion.div variants={buttonVariants} whileHover="hover">
                      <Button
                        component={Link}
                        to="/register"
                        variant="outlined"
                        size="large"
                        sx={{
                          borderColor: "white",
                          color: "white",
                          fontWeight: 600,
                          fontFamily: "Inter, Roboto, sans-serif",
                          px: 4,
                          py: 1.5,
                          borderRadius: 2,
                          "&:hover": {
                            background: "rgba(255, 255, 255, 0.1)",
                            borderColor: "white",
                          },
                        }}
                      >
                        S'Inscrire
                      </Button>
                    </motion.div>
                  </Stack>
                </motion.div>
              </Grid>
              {!isMobile && (
                <Grid item xs={12} md={6}>
                  <motion.div
                    variants={itemVariants}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Box
                      component="img"
                      src={DoctorImage}
                      alt="Docteur"
                      sx={{
                        width: "100%",
                        borderRadius: 3,
                        boxShadow: "0 20px 40px rgba(0, 0, 0, 0.2)",
                        transform: "rotate(3deg)",
                      }}
                    />
                  </motion.div>
                </Grid>
              )}
            </Grid>
          </Container>
        </motion.div>
      </Box>

      {/* Features Section */}
      <Box sx={{ py: 10, px: isMobile ? 2 : 10 }}>
        <Container maxWidth="lg">
          <motion.div
            variants={containerVariants}
            initial="initial"
            animate="animate"
          >
            <Typography
              variant="h4"
              align="center"
              gutterBottom
              sx={{
                fontWeight: 700,
                color: "#1E293B",
                fontFamily: "Inter, Roboto, sans-serif",
                mb: 6,
              }}
            >
              Fonctionnalités Principales
            </Typography>
            <Grid container spacing={4}>
              {features.map((feature, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <motion.div
                    variants={itemVariants}
                    whileHover="hover"
                    transition={{ delay: index * 0.1 }}
                  >
                    <Paper
                      component={motion.div}
                      variants={featureCardVariants}
                      sx={{
                        p: 3,
                        height: "100%",
                        borderRadius: 3,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        textAlign: "center",
                        transition: "all 0.3s ease",
                      }}
                    >
                      <Avatar
                        sx={{
                          bgcolor: `${feature.color}20`,
                          color: feature.color,
                          width: 60,
                          height: 60,
                          mb: 3,
                        }}
                      >
                        {feature.icon}
                      </Avatar>
                      <Typography
                        variant="h6"
                        gutterBottom
                        sx={{
                          fontWeight: 600,
                          color: "#1E293B",
                          fontFamily: "Inter, Roboto, sans-serif",
                        }}
                      >
                        {feature.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: "#64748B",
                          fontFamily: "Inter, Roboto, sans-serif",
                        }}
                      >
                        {feature.description}
                      </Typography>
                    </Paper>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </motion.div>
        </Container>
      </Box>

      {/* About Section */}
      <Box sx={{ py: 10, background: "#FFFFFF" }}>
        <Container maxWidth="lg">
          <motion.div
            variants={containerVariants}
            initial="initial"
            animate="animate"
          >
            <Grid container spacing={6} alignItems="center">
              {!isMobile && (
                <Grid item xs={12} md={6}>
                  <motion.div variants={itemVariants}>
                    <Box
                      component="img"
                      src={HospitalImage}
                      alt="Hôpital"
                      sx={{
                        width: "100%",
                        borderRadius: 3,
                        boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)",
                      }}
                    />
                  </motion.div>
                </Grid>
              )}
              <Grid item xs={12} md={6}>
                <motion.div variants={itemVariants}>
                  <Typography
                    variant="h4"
                    gutterBottom
                    sx={{
                      fontWeight: 700,
                      color: "#1E293B",
                      fontFamily: "Inter, Roboto, sans-serif",
                    }}
                  >
                    Une Solution Moderne pour les Professionnels de Santé
                  </Typography>
                  <Divider sx={{ my: 3, width: 80, height: 4, bgcolor: "#3B82F6" }} />
                  <Typography
                    variant="body1"
                    sx={{
                      mb: 3,
                      color: "#64748B",
                      fontFamily: "Inter, Roboto, sans-serif",
                      lineHeight: 1.8,
                    }}
                  >
                    Notre plateforme a été conçue en collaboration avec des professionnels de santé pour répondre aux besoins spécifiques des établissements médicaux.
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      mb: 4,
                      color: "#64748B",
                      fontFamily: "Inter, Roboto, sans-serif",
                      lineHeight: 1.8,
                    }}
                  >
                    Interface intuitive, sécurité des données et fonctionnalités complètes pour une gestion optimale de votre activité médicale.
                  </Typography>
                  <motion.div variants={buttonVariants} whileHover="hover">
                    <Button
                      component={Link}
                      to="/about"
                      variant="contained"
                      size="large"
                      sx={{
                        background: "linear-gradient(195deg, #1E3A8A, #3B82F6)",
                        color: "white",
                        fontWeight: 600,
                        fontFamily: "Inter, Roboto, sans-serif",
                        px: 4,
                        py: 1.5,
                        borderRadius: 2,
                        "&:hover": {
                          background: "linear-gradient(195deg, #2563EB, #60A5FA)",
                        },
                      }}
                    >
                      En Savoir Plus
                    </Button>
                  </motion.div>
                </motion.div>
              </Grid>
            </Grid>
          </motion.div>
        </Container>
      </Box>

      {/* Testimonials Section */}
      <Box sx={{ py: 10, background: "#F8FAFC" }}>
        <Container maxWidth="lg">
          <motion.div
            variants={containerVariants}
            initial="initial"
            animate="animate"
          >
            <Typography
              variant="h4"
              align="center"
              gutterBottom
              sx={{
                fontWeight: 700,
                color: "#1E293B",
                fontFamily: "Inter, Roboto, sans-serif",
                mb: 6,
              }}
            >
              Ce Qu'ils Disent de Nous
            </Typography>
            <Grid container spacing={4}>
              {[1, 2, 3].map((item) => (
                <Grid item xs={12} md={4} key={item}>
                  <motion.div
                    variants={itemVariants}
                    transition={{ delay: item * 0.1 }}
                  >
                    <Paper
                      sx={{
                        p: 3,
                        height: "100%",
                        borderRadius: 3,
                        background: "white",
                      }}
                    >
                      <Typography
                        variant="body1"
                        sx={{
                          mb: 3,
                          fontStyle: "italic",
                          color: "#64748B",
                          fontFamily: "Inter, Roboto, sans-serif",
                          lineHeight: 1.8,
                        }}
                      >
                        "Cette plateforme a révolutionné notre façon de travailler. La gestion des patients est maintenant fluide et efficace."
                      </Typography>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Avatar
                          src={`https://randomuser.me/api/portraits/men/${item + 40}.jpg`}
                          sx={{ width: 56, height: 56, mr: 2 }}
                        />
                        <Box>
                          <Typography
                            variant="subtitle1"
                            sx={{
                              fontWeight: 600,
                              color: "#1E293B",
                              fontFamily: "Inter, Roboto, sans-serif",
                            }}
                          >
                            Dr. {item === 1 ? "Jean Martin" : item === 2 ? "Pierre Durand" : "Luc Bernard"}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              color: "#64748B",
                              fontFamily: "Inter, Roboto, sans-serif",
                            }}
                          >
                            {item === 1 ? "Médecin Généraliste" : item === 2 ? "Chirurgien" : "Directeur d'Hôpital"}
                          </Typography>
                        </Box>
                      </Box>
                    </Paper>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </motion.div>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box
        sx={{
          py: 8,
          px: isMobile ? 2 : 10,
          background: "linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%)",
          color: "white",
        }}
      >
        <Container maxWidth="lg">
          <motion.div
            variants={containerVariants}
            initial="initial"
            animate="animate"
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
              }}
            >
              <Typography
                variant={isMobile ? "h4" : "h3"}
                gutterBottom
                sx={{
                  fontWeight: 700,
                  fontFamily: "Inter, Roboto, sans-serif",
                  mb: 3,
                }}
              >
                Prêt à transformer votre pratique médicale ?
              </Typography>
              <Typography
                variant={isMobile ? "body1" : "h6"}
                sx={{
                  mb: 4,
                  maxWidth: 700,
                  opacity: 0.9,
                  fontFamily: "Inter, Roboto, sans-serif",
                  lineHeight: 1.6,
                }}
              >
                Rejoignez des centaines de professionnels de santé qui utilisent déjà notre plateforme pour optimiser leur travail au quotidien.
              </Typography>
              <motion.div variants={buttonVariants} whileHover="hover">
                <Button
                  component={Link}
                  to="/register"
                  variant="contained"
                  size="large"
                  sx={{
                    background: "white",
                    color: "#1E3A8A",
                    fontWeight: 600,
                    fontFamily: "Inter, Roboto, sans-serif",
                    px: 6,
                    py: 1.8,
                    borderRadius: 2,
                    fontSize: "1.1rem",
                    "&:hover": {
                      background: "rgba(255, 255, 255, 0.9)",
                    },
                  }}
                >
                  Commencer Maintenant
                </Button>
              </motion.div>
            </Box>
          </motion.div>
        </Container>
      </Box>
    </Box>
  );
}

export default HomePage;