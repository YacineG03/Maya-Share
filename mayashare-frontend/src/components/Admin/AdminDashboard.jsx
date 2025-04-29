// src/components/Admin/AdminDashboard.js

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  CircularProgress,
  Slide,
  Avatar,
  Tooltip,
  useTheme,
  useMediaQuery,
  Card,
  CardContent,
  Grid,
} from "@mui/material";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import HomeIcon from "@mui/icons-material/Home";
import PeopleIcon from "@mui/icons-material/People";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import LogoutIcon from "@mui/icons-material/Logout";
import SettingsIcon from "@mui/icons-material/Settings";
import AdminGererUtilisateurs from "./AdminGererUser";
import AdminGererHopital from "./AdminGererHopital";
import { getUsers, getHopitaux } from "../../services/api";

// Animation variants
const sidebarItemVariants = {
  initial: { x: -20, opacity: 0 },
  animate: (index) => ({
    x: 0,
    opacity: 1,
    transition: {
      delay: 0.05 * index,
      duration: 0.4,
      ease: [0.16, 1, 0.3, 1],
    },
  }),
  hover: {
    scale: 1.05,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
    transition: { duration: 0.2 },
  },
};

const contentVariants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1],
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.3,
    },
  },
};

const logoVariants = {
  initial: { scale: 0.9, opacity: 0 },
  animate: {
    scale: 1,
    opacity: 1,
    transition: {
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

const cardVariants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1],
    },
  },
  hover: {
    scale: 1.03,
    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.15)",
    transition: { duration: 0.2 },
  },
};

const SIDEBAR_WIDTH = 280;
const SIDEBAR_WIDTH_MOBILE = 240;

function AdminDashboard() {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [activeSection, setActiveSection] = useState("Accueil");
  const [userName, setUserName] = useState("Admin");
  const [loading, setLoading] = useState(true);
  const [contentLoaded, setContentLoaded] = useState(false);
  const [userInitials, setUserInitials] = useState("AD");
  const [totalUsers, setTotalUsers] = useState({
    total: 0,
    patients: 0,
    medecins: 0,
    infirmiers: 0,
    admins: 0
  });
  const [totalHospitals, setTotalHospitals] = useState(0);
  const [loadingStats, setLoadingStats] = useState(true);

  const sidebarColors = {
    background: "linear-gradient(195deg, #1E3A8A, #3B82F6)",
    selectedItem: "rgba(255, 255, 255, 0.2)",
    hoverItem: "rgba(255, 255, 255, 0.15)",
    text: "#FFFFFF",
    divider: "rgba(255, 255, 255, 0.2)",
    avatarBg: "#2563EB",
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/home");
      return;
    }

    const fetchUserInfo = async () => {
      try {
        setTimeout(() => {
          setUserName("Administrateur");
          setUserInitials("AD");
          setLoading(false);
          setTimeout(() => setContentLoaded(true), 300);
        }, 800);
      } catch (err) {
        console.error("Erreur:", err);
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, [navigate]);

  // Charger les statistiques (nombre total d'utilisateurs par rôle et d'hôpitaux)
  useEffect(() => {
    const fetchStats = async () => {
      setLoadingStats(true);
      try {
        // Récupérer tous les utilisateurs
        const usersResponse = await getUsers({ limit: 1000, page: 1 }); // Augmentez la limite pour obtenir tous les utilisateurs
        const allUsers = usersResponse.data.users || [];

        // Compter les utilisateurs par rôle
        const patientCount = allUsers.filter(user => user.role === 'patient').length;
        const medecinCount = allUsers.filter(user => user.role === 'medecin').length;
        const infirmierCount = allUsers.filter(user => user.role === 'infirmier').length;
        const adminCount = allUsers.filter(user => user.role === 'admin').length;

        setTotalUsers({
          total: usersResponse.data.total || allUsers.length,
          patients: patientCount,
          medecins: medecinCount,
          infirmiers: infirmierCount,
          admins: adminCount
        });

        // Récupérer le nombre total d'hôpitaux
        const hospitalsResponse = await getHopitaux();
        setTotalHospitals(hospitalsResponse.data.length || 0);
      } catch (err) {
        console.error("Erreur lors de la récupération des statistiques :", err);
        toast.error("Erreur lors de la récupération des statistiques.");
      } finally {
        setLoadingStats(false);
      }
    };

    fetchStats();
  }, []);

  const handleLogout = () => {
    setContentLoaded(false);
    toast.success("Déconnexion réussie !", {
      position: "top-right",
      autoClose: 1500,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      theme: "colored",
    });
    setTimeout(() => {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      navigate("/home");
    }, 1800);
  };

  const handleNavigation = (section) => {
    if (activeSection !== section) {
      setContentLoaded(false);
      setTimeout(() => {
        setActiveSection(section);
        setContentLoaded(true);
      }, 200);
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          background: "linear-gradient(135deg, #F0F7FF, #D6E4FF)",
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 16,
          }}
        >
          <motion.div
            animate={{ scale: [1, 1.1, 1], opacity: [0.8, 1, 0.8] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <svg width={64} height={64} viewBox="0 0 100 100">
              <motion.circle
                cx="50"
                cy="50"
                r="40"
                stroke="#2563EB"
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
                initial={{ pathLength: 0, rotate: -90 }}
                animate={{ pathLength: 1, rotate: 360 }}
                transition={{
                  duration: 2,
                  ease: "easeInOut",
                  repeat: Infinity,
                  repeatType: "loop",
                }}
              />
            </svg>
          </motion.div>
          <Typography
            variant="h6"
            sx={{ fontWeight: 600, color: "#1E3A8A", fontFamily: "Inter, Roboto, sans-serif" }}
          >
            Chargement...
          </Typography>
        </motion.div>
      </Box>
    );
  }

  const menuItems = [
    {
      text: "Accueil",
      icon: <HomeIcon sx={{ fontSize: "1.5rem" }} />,
      section: "Accueil",
    },
    {
      text: "Gérer les utilisateurs",
      icon: <PeopleIcon sx={{ fontSize: "1.5rem" }} />,
      section: "Gérer les utilisateurs",
    },
    {
      text: "Gérer les hôpitaux",
      icon: <LocalHospitalIcon sx={{ fontSize: "1.5rem" }} />,
      section: "Gérer les hôpitaux",
    },
    {
      text: "Paramètres",
      icon: <SettingsIcon sx={{ fontSize: "1.5rem" }} />,
      section: "Paramètres",
    },
  ];

  return (
    <Box sx={{ display: "flex", height: "100vh", width: "100vw", overflow: "hidden" }}>
      {/* Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: isMobile ? SIDEBAR_WIDTH_MOBILE : SIDEBAR_WIDTH,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: isMobile ? SIDEBAR_WIDTH_MOBILE : SIDEBAR_WIDTH,
            boxSizing: "border-box",
            background: sidebarColors.background,
            color: sidebarColors.text,
            display: "flex",
            flexDirection: "column",
            borderRight: "none",
            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.15)",
            backdropFilter: "blur(8px)",
            fontFamily: "Inter, Roboto, sans-serif",
          },
        }}
      >
        <Slide direction="right" in={true} timeout={600}>
          <Box sx={{ display: "flex", flexDirection: "column", height: "100%", p: isMobile ? 1.5 : 2 }}>
            {/* Logo & User Profile */}
            <motion.div variants={logoVariants} initial="initial" animate="animate">
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  p: 2,
                  mb: 2,
                  borderRadius: 3,
                  background: "rgba(255, 255, 255, 0.08)",
                  transition: "all 0.3s ease",
                  "&:hover": { background: "rgba(255, 255, 255, 0.12)" },
                }}
              >
                <Avatar
                  sx={{
                    bgcolor: sidebarColors.avatarBg,
                    width: isMobile ? 36 : 42,
                    height: isMobile ? 36 : 42,
                    fontWeight: 600,
                    transition: "transform 0.3s ease",
                    "&:hover": { transform: "scale(1.1)" },
                  }}
                >
                  {userInitials}
                </Avatar>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, fontSize: isMobile ? "0.9rem" : "1rem" }}>
                    {userName}
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.8, fontSize: isMobile ? "0.7rem" : "0.75rem" }}>
                    Administrateur
                  </Typography>
                </Box>
              </Box>
            </motion.div>

            <Divider sx={{ borderColor: sidebarColors.divider, my: 1 }} />

            {/* Menu Items */}
            <List sx={{ px: 1, mt: 1, flex: 1 }}>
              {menuItems.map((item, index) => (
                <motion.div
                  key={item.section}
                  custom={index}
                  variants={sidebarItemVariants}
                  initial="initial"
                  animate="animate"
                  whileHover="hover"
                >
                  <Tooltip title={item.text} placement="right" arrow>
                    <ListItem
                      onClick={() => handleNavigation(item.section)}
                      role="button"
                      aria-label={`Naviguer vers ${item.text}`}
                      sx={{
                        borderRadius: 3,
                        mb: 1,
                        py: 1.5,
                        px: 2,
                        transition: "all 0.3s ease",
                        "&.Mui-selected": {
                          background: sidebarColors.selectedItem,
                          backdropFilter: "blur(10px)",
                          "&:hover": { background: sidebarColors.selectedItem },
                        },
                        "&:hover": {
                          background: sidebarColors.hoverItem,
                        },
                        background:
                          activeSection === item.section
                            ? sidebarColors.selectedItem
                            : "transparent",
                        cursor: "pointer",
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: isMobile ? 32 : 36 }}>
                        <Box sx={{ color: sidebarColors.text }}>{item.icon}</Box>
                      </ListItemIcon>
                      <ListItemText
                        primary={item.text}
                        sx={{
                          "& .MuiListItemText-primary": {
                            fontWeight: activeSection === item.section ? 600 : 500,
                            fontSize: isMobile ? "0.85rem" : "0.9rem",
                          },
                        }}
                      />
                    </ListItem>
                  </Tooltip>
                </motion.div>
              ))}
            </List>

            {/* Footer / Logout */}
            <Box sx={{ mt: "auto" }}>
              <Divider sx={{ borderColor: sidebarColors.divider, my: 1 }} />
              <motion.div
                variants={sidebarItemVariants}
                custom={menuItems.length}
                initial="initial"
                animate="animate"
                whileHover="hover"
              >
                <ListItem
                  onClick={handleLogout}
                  role="button"
                  aria-label="Déconnexion"
                  sx={{
                    borderRadius: 3,
                    py: 1.5,
                    px: 2,
                    transition: "all 0.3s ease",
                    "&:hover": { background: sidebarColors.hoverItem },
                    cursor: "pointer",
                  }}
                >
                  <ListItemIcon sx={{ minWidth: isMobile ? 32 : 36 }}>
                    <LogoutIcon sx={{ color: sidebarColors.text, fontSize: isMobile ? "1.2rem" : "1.25rem" }} />
                  </ListItemIcon>
                  <ListItemText
                    primary="Déconnexion"
                    sx={{
                      "& .MuiListItemText-primary": {
                        fontWeight: 500,
                        fontSize: isMobile ? "0.85rem" : "0.9rem",
                      },
                    }}
                  />
                </ListItem>
              </motion.div>
            </Box>
          </Box>
        </Slide>
      </Drawer>

      {/* Main Content */}
      <Box
        sx={{
          flexGrow: 1,
          background: "linear-gradient(135deg, #F0F7FF, #D6E4FF)",
          height: "100%",
          overflow: "auto",
          position: "relative",
        }}
      >
        {/* Animated background elements */}
        <Box
          sx={{
            position: "absolute",
            top: 0,
            right: 0,
            width: "50%",
            height: "50%",
            background: "radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%)",
            zIndex: 0,
          }}
        />

        <motion.div
          key={activeSection}
          variants={contentVariants}
          initial="initial"
          animate={contentLoaded ? "animate" : "exit"}
          style={{ height: "100%", position: "relative", zIndex: 1 }}
        >
          <Box sx={{ p: isMobile ? 2 : 3 }}>
            <Typography
              variant="h5"
              sx={{
                mb: 3,
                fontWeight: 600,
                color: "#1E3A8A",
                fontFamily: "Inter, Roboto, sans-serif",
                fontSize: isMobile ? "1.25rem" : "1.5rem",
              }}
            >
              {activeSection}
            </Typography>

            <Box
              sx={{
                background: "#FFFFFF",
                borderRadius: 3,
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
                p: isMobile ? 2 : 3,
                minHeight: "80vh",
              }}
            >
              {activeSection === "Accueil" && (
                <Box
                  sx={{
                    py: 4,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <Typography
                      variant="h4"
                      sx={{
                        fontWeight: 600,
                        color: "#1E3A8A",
                        fontFamily: "Inter, Roboto, sans-serif",
                        mb: 2,
                        textAlign: "center",
                      }}
                    >
                      Bienvenue, {userName} !
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        color: "textSecondary",
                        maxWidth: 600,
                        fontFamily: "Inter, Roboto, sans-serif",
                        textAlign: "center",
                      }}
                    >
                      Gérez efficacement les utilisateurs, les hôpitaux et les paramètres depuis cette interface
                      d'administration. Sélectionnez une option dans le menu pour commencer.
                    </Typography>
                  </motion.div>

                  {/* Statistiques */}
                  {loadingStats ? (
                    <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                      <CircularProgress />
                    </Box>
                  ) : (
                    <Grid container spacing={3} justifyContent="center">
                      {/* Carte Utilisateurs */}
                      <Grid item xs={12} sm={6} md={4}>
                        <motion.div variants={cardVariants} initial="initial" animate="animate" whileHover="hover">
                          <Card
                            sx={{
                              background: "linear-gradient(135deg, #3B82F6, #60A5FA)",
                              color: "#FFFFFF",
                              borderRadius: 3,
                              boxShadow: "0 4px 16px rgba(0, 0, 0, 0.1)",
                              transition: "all 0.3s ease",
                              height: "100%",
                            }}
                          >
                            <CardContent>
                              <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
                                <PeopleIcon sx={{ fontSize: 40 }} />
                                <Box>
                                  <Typography
                                    variant="h4"
                                    sx={{ fontWeight: 600, fontFamily: "Inter, Roboto, sans-serif" }}
                                  >
                                    {totalUsers.total}
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    sx={{ fontFamily: "Inter, Roboto, sans-serif" }}
                                  >
                                    Utilisateurs au total
                                  </Typography>
                                </Box>
                              </Box>
                              <Divider sx={{ my: 1, borderColor: 'rgba(255,255,255,0.2)' }} />
                              <Grid container spacing={1}>
                                <Grid item xs={6}>
                                  <Typography variant="body2">Patients: {totalUsers.patients}</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                  <Typography variant="body2">Médecins: {totalUsers.medecins}</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                  <Typography variant="body2">Infirmiers: {totalUsers.infirmiers}</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                  <Typography variant="body2">Admins: {totalUsers.admins}</Typography>
                                </Grid>
                              </Grid>
                            </CardContent>
                          </Card>
                        </motion.div>
                      </Grid>

                      {/* Carte Hôpitaux */}
                      <Grid item xs={12} sm={6} md={4}>
                        <motion.div variants={cardVariants} initial="initial" animate="animate" whileHover="hover">
                          <Card
                            sx={{
                              background: "linear-gradient(135deg, #10B981, #34D399)",
                              color: "#FFFFFF",
                              borderRadius: 3,
                              boxShadow: "0 4px 16px rgba(0, 0, 0, 0.1)",
                              transition: "all 0.3s ease",
                              height: "100%",
                            }}
                          >
                            <CardContent sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
                              <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
                                <LocalHospitalIcon sx={{ fontSize: 40 }} />
                                <Box>
                                  <Typography
                                    variant="h4"
                                    sx={{ fontWeight: 600, fontFamily: "Inter, Roboto, sans-serif" }}
                                  >
                                    {totalHospitals}
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    sx={{ fontFamily: "Inter, Roboto, sans-serif" }}
                                  >
                                    Hôpitaux enregistrés
                                  </Typography>
                                </Box>
                              </Box>
                              <Divider sx={{ my: 1, borderColor: 'rgba(255,255,255,0.2)' }} />
                              <Typography variant="body2" sx={{ flexGrow: 1 }}>
                                Gérer les hôpitaux dans la section dédiée
                              </Typography>
                            </CardContent>
                          </Card>
                        </motion.div>
                      </Grid>
                    </Grid>
                  )}
                </Box>
              )}
              {activeSection === "Gérer les utilisateurs" && <AdminGererUtilisateurs />}
              {activeSection === "Gérer les hôpitaux" && <AdminGererHopital />}
              {activeSection === "Paramètres" && (
                <Box sx={{ textAlign: "center", py: 10 }}>
                  <Typography
                    variant="h6"
                    color="textSecondary"
                    sx={{ fontFamily: "Inter, Roboto, sans-serif" }}
                  >
                    Section Paramètres en développement
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        </motion.div>
      </Box>
    </Box>
  );
}

export default AdminDashboard;
