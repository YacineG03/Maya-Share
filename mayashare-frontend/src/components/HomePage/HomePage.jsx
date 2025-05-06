"use client"
import {
  Box,
  Typography,
  Button,
  Grid,
  Container,
  Card,
  CardContent,
  useTheme,
  useMediaQuery,
  Avatar,
  Divider,
  Stack,
} from "@mui/material"
import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import MedicalServicesOutlinedIcon from "@mui/icons-material/MedicalServicesOutlined"
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined"
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined"
import InsightsOutlinedIcon from "@mui/icons-material/InsightsOutlined"
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined"
import SupportAgentOutlinedIcon from "@mui/icons-material/SupportAgentOutlined"
import ArrowForwardIcon from "@mui/icons-material/ArrowForward"
import HospitalImage from "../assets/hospital.jpg"
import DoctorImage from "../assets/doctor.jpg"

// Simple, clean animation variants
const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
}

function HomePage() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))
  const isMedium = useMediaQuery(theme.breakpoints.down("md"))

  const features = [
    {
      icon: <MedicalServicesOutlinedIcon />,
      title: "Gestion des Patients",
      description: "Suivi optimisé des dossiers médicaux avec interface intuitive.",
      color: "#2563EB",
    },
    {
      icon: <PeopleAltOutlinedIcon />,
      title: "Gestion du Personnel",
      description: "Administration fluide du personnel médical.",
      color: "#059669",
    },
    {
      icon: <CalendarTodayOutlinedIcon />,
      title: "Planification",
      description: "Organisation simplifiée des rendez-vous.",
      color: "#D97706",
    },
    {
      icon: <InsightsOutlinedIcon />,
      title: "Rapports",
      description: "Analyses et statistiques en temps réel.",
      color: "#7C3AED",
    },
  ]

  const testimonials = [
    {
      name: "Dr. Jean Martin",
      role: "Médecin Généraliste",
      quote:
        "Une solution qui a transformé notre gestion quotidienne. L'interface intuitive et les fonctionnalités avancées nous font gagner un temps précieux.",
      avatar: "https://randomuser.me/api/portraits/men/41.jpg",
    },
    {
      name: "Dr. Pierre Durand",
      role: "Chirurgien",
      quote:
        "L'interface intuitive réduit considérablement le temps administratif. Je peux me concentrer sur mes patients plutôt que sur la paperasse.",
      avatar: "https://randomuser.me/api/portraits/men/42.jpg",
    },
    {
      name: "Luc Bernard",
      role: "Directeur d'Hôpital",
      quote:
        "Sécurité et rapports automatisés au top niveau. Notre établissement a vu une amélioration de 30% dans la gestion des dossiers.",
      avatar: "https://randomuser.me/api/portraits/men/43.jpg",
    },
  ]

  const benefits = [
    {
      title: "Sécurité Renforcée",
      description: "Protection des données conforme RGPD avec chiffrement de bout en bout",
      icon: <ShieldOutlinedIcon />,
      color: "#2563EB",
    },
    {
      title: "Support 24/7",
      description: "Assistance technique disponible à tout moment pour vous accompagner",
      icon: <SupportAgentOutlinedIcon />,
      color: "#059669",
    },
  ]

  return (
    <Box sx={{ bgcolor: "#FFFFFF" }}>
      {/* Hero Section - Minimalist with original colors */}
      <Box
        sx={{
          pt: { xs: 8, md: 12 },
          pb: { xs: 10, md: 14 },
          background: `linear-gradient(135deg, rgba(17, 24, 39, 0.92) 0%, rgba(59, 130, 246, 0.85) 100%)`,
          color: "white",
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <motion.div initial="initial" animate="animate" variants={fadeIn}>
                <Typography
                  variant="overline"
                  sx={{
                    color: "#93C5FD",
                    fontWeight: 600,
                    letterSpacing: 1.5,
                    mb: 1,
                    display: "block",
                  }}
                >
                  PLATEFORME DE GESTION MÉDICALE
                </Typography>
                <Typography
                  variant="h2"
                  sx={{
                    fontWeight: 700,
                    color: "white",
                    mb: 3,
                    lineHeight: 1.2,
                    fontSize: { xs: "2.5rem", md: "3.5rem" },
                  }}
                >
                  <Box component="span" sx={{ color: "#93C5FD" }}>
                    Mayashare
                  </Box>{" "}
                  - Gestion Médicale Simplifiée
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: "rgba(255, 255, 255, 0.9)",
                    mb: 4,
                    fontSize: "1.125rem",
                    maxWidth: "90%",
                    lineHeight: 1.7,
                  }}
                >
                  Solution tout-en-un pour optimiser la gestion de votre établissement de santé avec des outils modernes
                  et sécurisés.
                </Typography>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                  <Button
                    component={Link}
                    to="/login"
                    variant="contained"
                    size="large"
                    sx={{
                      bgcolor: "#3B82F6",
                      color: "white",
                      px: 4,
                      py: 1.5,
                      borderRadius: 2,
                      textTransform: "none",
                      fontWeight: 600,
                      "&:hover": {
                        bgcolor: "#2563EB",
                      },
                    }}
                  >
                    Se connecter
                  </Button>
                  <Button
                    component={Link}
                    to="/register"
                    variant="outlined"
                    size="large"
                    sx={{
                      color: "white",
                      borderColor: "rgba(255, 255, 255, 0.5)",
                      px: 4,
                      py: 1.5,
                      borderRadius: 2,
                      textTransform: "none",
                      fontWeight: 600,
                      "&:hover": {
                        borderColor: "white",
                        bgcolor: "rgba(255, 255, 255, 0.1)",
                      },
                    }}
                  >
                    S'inscrire
                  </Button>
                </Stack>
              </motion.div>
            </Grid>
            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7 }}
              >
                <Box
                  sx={{
                    position: "relative",
                    borderRadius: 4,
                    overflow: "hidden",
                    boxShadow: "0 20px 40px rgba(0, 0, 0, 0.2)",
                    border: "4px solid rgba(255, 255, 255, 0.1)",
                  }}
                >
                  <Box
                    component="img"
                    src={DoctorImage}
                    alt="Docteur"
                    sx={{
                      width: "100%",
                      display: "block",
                    }}
                  />
                </Box>
              </motion.div>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section - Clean with original colors */}
      <Box sx={{ py: { xs: 8, md: 12 } }}>
        <Container maxWidth="lg">
          <motion.div initial="initial" whileInView="animate" viewport={{ once: true }} variants={staggerContainer}>
            <Box sx={{ textAlign: "center", mb: 8 }}>
              <motion.div variants={fadeIn}>
                <Typography
                  variant="overline"
                  sx={{
                    color: "#3B82F6",
                    fontWeight: 600,
                    letterSpacing: 1.5,
                    mb: 1,
                    display: "block",
                  }}
                >
                  FONCTIONNALITÉS
                </Typography>
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 700,
                    color: "#111827",
                    mb: 2,
                  }}
                >
                  Transformez Votre Pratique avec Mayashare
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: "#6B7280",
                    maxWidth: 600,
                    mx: "auto",
                    fontSize: "1.125rem",
                  }}
                >
                  Des outils puissants pour simplifier votre quotidien et améliorer l'expérience de vos patients
                </Typography>
              </motion.div>
            </Box>

            <Grid container spacing={4}>
              {features.map((feature, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <motion.div variants={fadeIn}>
                    <Card
                      sx={{
                        height: "100%",
                        display: "flex",
                        borderRadius: 3,
                        boxShadow: "0 10px 25px rgba(0, 0, 0, 0.05)",
                        border: "1px solid rgba(0, 0, 0, 0.05)",
                        transition: "all 0.3s ease",
                        "&:hover": {
                          boxShadow: "0 15px 35px rgba(0, 0, 0, 0.1)",
                          transform: "translateY(-5px)",
                        },
                      }}
                    >
                      <CardContent
                        sx={{
                          p: 4,
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          textAlign: "center",
                          height: "100%",
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: 70,
                            height: 70,
                            borderRadius: "50%",
                            bgcolor: `${feature.color}15`,
                            color: feature.color,
                            mb: 3,
                          }}
                        >
                          {feature.icon}
                        </Box>
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 600,
                            color: "#111827",
                            mb: 2,
                          }}
                        >
                          {feature.title}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            color: "#6B7280",
                          }}
                        >
                          {feature.description}
                        </Typography>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </motion.div>
        </Container>
      </Box>

      {/* About Section - Clean with original colors */}
      <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: "#F9FAFB" }}>
        <Container maxWidth="lg">
          <motion.div initial="initial" whileInView="animate" viewport={{ once: true }} variants={staggerContainer}>
            <Grid container spacing={8} alignItems="center">
              <Grid item xs={12} md={6}>
                <motion.div variants={fadeIn}>
                  <Box
                    sx={{
                      position: "relative",
                      borderRadius: 4,
                      overflow: "hidden",
                      boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)",
                    }}
                  >
                    <Box
                      component="img"
                      src={HospitalImage}
                      alt="Hôpital"
                      sx={{
                        width: "100%",
                        display: "block",
                      }}
                    />
                  </Box>
                </motion.div>
              </Grid>
              <Grid item xs={12} md={6}>
                <motion.div variants={fadeIn}>
                  <Typography
                    variant="overline"
                    sx={{
                      color: "#059669",
                      fontWeight: 600,
                      letterSpacing: 1.5,
                      mb: 1,
                      display: "block",
                    }}
                  >
                    À PROPOS
                  </Typography>
                  <Typography
                    variant="h3"
                    sx={{
                      fontWeight: 700,
                      color: "#111827",
                      mb: 3,
                    }}
                  >
                    Mayashare, Pensée pour les Experts Médicaux
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      color: "#6B7280",
                      mb: 4,
                      fontSize: "1.125rem",
                      lineHeight: 1.7,
                    }}
                  >
                    Développée avec des professionnels de santé pour répondre aux exigences des cliniques modernes.
                    Notre plateforme s'adapte à tous les types d'établissements médicaux.
                  </Typography>

                  {benefits.map((benefit, index) => (
                    <Box
                      key={index}
                      sx={{
                        display: "flex",
                        alignItems: "flex-start",
                        mb: 3,
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: 48,
                          height: 48,
                          borderRadius: 2,
                          bgcolor: `${benefit.color}15`,
                          color: benefit.color,
                          mr: 3,
                          flexShrink: 0,
                        }}
                      >
                        {benefit.icon}
                      </Box>
                      <Box>
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 600,
                            color: "#111827",
                            mb: 0.5,
                            fontSize: "1.125rem",
                          }}
                        >
                          {benefit.title}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            color: "#6B7280",
                          }}
                        >
                          {benefit.description}
                        </Typography>
                      </Box>
                    </Box>
                  ))}

                  <Box sx={{ mt: 4 }}>
                    <Button
                      component={Link}
                      to="/about"
                      endIcon={<ArrowForwardIcon />}
                      sx={{
                        color: "#059669",
                        fontWeight: 600,
                        textTransform: "none",
                        "&:hover": {
                          bgcolor: "transparent",
                          color: "#047857",
                        },
                      }}
                    >
                      En savoir plus
                    </Button>
                  </Box>
                </motion.div>
              </Grid>
            </Grid>
          </motion.div>
        </Container>
      </Box>

      {/* Testimonials Section - Clean with original colors */}
      <Box sx={{ py: { xs: 8, md: 12 } }}>
        <Container maxWidth="lg">
          <motion.div initial="initial" whileInView="animate" viewport={{ once: true }} variants={staggerContainer}>
            <Box sx={{ textAlign: "center", mb: 8 }}>
              <motion.div variants={fadeIn}>
                <Typography
                  variant="overline"
                  sx={{
                    color: "#F59E0B",
                    fontWeight: 600,
                    letterSpacing: 1.5,
                    mb: 1,
                    display: "block",
                  }}
                >
                  TÉMOIGNAGES
                </Typography>
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 700,
                    color: "#111827",
                    mb: 2,
                  }}
                >
                  Ce Qu'Ils Pensent de Mayashare
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: "#6B7280",
                    maxWidth: 600,
                    mx: "auto",
                    fontSize: "1.125rem",
                  }}
                >
                  Les retours de ceux qui utilisent notre plateforme au quotidien
                </Typography>
              </motion.div>
            </Box>

            <Grid container spacing={4}>
              {testimonials.map((testimonial, index) => (
                <Grid item xs={12} md={4} key={index}>
                  <motion.div variants={fadeIn}>
                    <Card
                      sx={{
                        height: "100%",
                        borderRadius: 3,
                        boxShadow: "0 10px 25px rgba(0, 0, 0, 0.05)",
                        border: "1px solid rgba(0, 0, 0, 0.05)",
                        transition: "all 0.3s ease",
                        "&:hover": {
                          boxShadow: "0 15px 35px rgba(0, 0, 0, 0.1)",
                          transform: "translateY(-5px)",
                        },
                      }}
                    >
                      <CardContent sx={{ p: 4 }}>
                        <Box sx={{ mb: 2 }}>
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Box
                              key={star}
                              component="span"
                              sx={{
                                color: "#F59E0B",
                                fontSize: "1.25rem",
                                mr: 0.5,
                              }}
                            >
                              ★
                            </Box>
                          ))}
                        </Box>
                        <Typography
                          variant="body1"
                          sx={{
                            color: "#334155",
                            mb: 4,
                            fontStyle: "italic",
                            lineHeight: 1.7,
                          }}
                        >
                          "{testimonial.quote}"
                        </Typography>
                        <Divider sx={{ mb: 3 }} />
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <Avatar
                            src={testimonial.avatar}
                            sx={{
                              width: 48,
                              height: 48,
                              mr: 2,
                            }}
                          />
                          <Box>
                            <Typography
                              variant="subtitle1"
                              sx={{
                                fontWeight: 600,
                                color: "#111827",
                              }}
                            >
                              {testimonial.name}
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{
                                color: "#6B7280",
                              }}
                            >
                              {testimonial.role}
                            </Typography>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </motion.div>
        </Container>
      </Box>

      {/* CTA Section - Clean with original colors */}
      <Box
        sx={{
          py: { xs: 10, md: 14 },
          background: "linear-gradient(135deg, #111827 0%, #2563EB 100%)",
          color: "white",
        }}
      >
        <Container maxWidth="md">
          <motion.div initial="initial" whileInView="animate" viewport={{ once: true }} variants={fadeIn}>
            <Box sx={{ textAlign: "center" }}>
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 700,
                  mb: 3,
                  fontSize: { xs: "2rem", md: "2.5rem" },
                }}
              >
                Révolutionnez Votre Pratique avec Mayashare
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: "rgba(255, 255, 255, 0.9)",
                  mb: 6,
                  maxWidth: 700,
                  mx: "auto",
                  fontSize: "1.125rem",
                  lineHeight: 1.7,
                }}
              >
                Rejoignez les professionnels qui optimisent leur quotidien avec notre plateforme. Essayez gratuitement
                pendant 14 jours, sans engagement.
              </Typography>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={3} justifyContent="center">
                <Button
                  component={Link}
                  to="/register"
                  variant="contained"
                  size="large"
                  sx={{
                    bgcolor: "white",
                    color: "#2563EB",
                    px: 4,
                    py: 1.5,
                    borderRadius: 2,
                    textTransform: "none",
                    fontWeight: 600,
                    "&:hover": {
                      bgcolor: "#F8FAFC",
                    },
                  }}
                >
                  Commencer maintenant
                </Button>
                <Button
                  component={Link}
                  to="/demo"
                  variant="outlined"
                  size="large"
                  sx={{
                    color: "white",
                    borderColor: "rgba(255,255,255,0.5)",
                    px: 4,
                    py: 1.5,
                    borderRadius: 2,
                    textTransform: "none",
                    fontWeight: 600,
                    "&:hover": {
                      borderColor: "white",
                      bgcolor: "rgba(255, 255, 255, 0.1)",
                    },
                  }}
                >
                  Voir la démo
                </Button>
              </Stack>
            </Box>
          </motion.div>
        </Container>
      </Box>
    </Box>
  )
}

export default HomePage
