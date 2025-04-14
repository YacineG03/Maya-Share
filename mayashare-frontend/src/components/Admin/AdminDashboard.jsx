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
} from "@mui/material";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import PeopleIcon from "@mui/icons-material/People";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital"; // Icône pour les hôpitaux
import LogoutIcon from "@mui/icons-material/Logout";
import AdminGererUtilisateurs from "./AdminGererUser";
import AdminGererHopital from "./AdminGererHopital";

// Animation variants pour framer-motion
const sidebarItemVariants = {
  initial: { x: -20, opacity: 0 },
  animate: (index) => ({
    x: 0,
    opacity: 1,
    transition: {
      delay: 0.05 * index,
      duration: 0.4,
      ease: "easeOut",
    },
  }),
  hover: {
    scale: 1.05,
    transition: { duration: 0.2 },
  },
};

const contentVariants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
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
      ease: "easeOut",
    },
  },
};

const sidebarColors = {
  background: "#5D4294",
  selectedItem: "#6F51A8",
  hoverItem: "#6F51A8B0",
  text: "#FFFFFF",
  divider: "#FFFFFF33",
};

const SIDEBAR_WIDTH = 280;

function AdminDashboard() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("Gérer les utilisateurs");
  const [userName, setUserName] = useState("Administrateur");
  const [loading, setLoading] = useState(true);
  const [contentLoaded, setContentLoaded] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.log("Token absent dans AdminDashboard, redirection vers /login");
      navigate("/login");
      return;
    }

    const fetchUserInfo = async () => {
      try {
        setUserName("Administrateur");
      } catch (err) {
        console.error("Erreur lors de la récupération des informations de l'utilisateur :", err);
      } finally {
        setLoading(false);
        setTimeout(() => setContentLoaded(true), 300);
      }
    };

    fetchUserInfo();
  }, [navigate]);

  const handleLogout = () => {
    setContentLoaded(false);
    toast.success("Déconnexion réussie ! Vous allez être redirigé...", {
      position: "top-right",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
    setTimeout(() => {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      navigate("/login");
    }, 2000);
  };

  const handleNavigation = (section) => {
    setContentLoaded(false);
    setTimeout(() => {
      setActiveSection(section);
      setContentLoaded(true);
    }, 300);
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <CircularProgress />
        </motion.div>
      </Box>
    );
  }

  const menuItems = [
    { text: "Gérer les utilisateurs", icon: <PeopleIcon />, section: "Gérer les utilisateurs" },
    { text: "Gérer les hôpitaux", icon: <LocalHospitalIcon />, section: "Gérer les hôpitaux" },
  ];

  return (
    <Box sx={{ display: "flex", height: "100vh", width: "100vw", overflow: "hidden" }}>
      <Drawer
        variant="permanent"
        sx={{
          width: SIDEBAR_WIDTH,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: SIDEBAR_WIDTH,
            boxSizing: "border-box",
            backgroundColor: sidebarColors.background,
            color: sidebarColors.text,
            display: "flex",
            flexDirection: "column",
          },
        }}
      >
        <Slide direction="right" in={true} timeout={600}>
          <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
            <motion.div variants={logoVariants} initial="initial" animate="animate">
              <Box sx={{ p: 3, textAlign: "left", display: "flex", alignItems: "center" }}>
                <Typography variant="h6" sx={{ fontWeight: "bold", mr: 1 }}>
                  MayaShare
                </Typography>
                <Box component="span" sx={{ fontSize: 20 }}>
                  🩺
                </Box>
              </Box>
              <Typography variant="body2" sx={{ px: 3, pb: 2 }}>
                Salut, {userName}
              </Typography>
            </motion.div>
            <Divider sx={{ backgroundColor: sidebarColors.divider, mx: 2 }} />
            <List sx={{ px: 2, mt: 1, flex: 1 }}>
              {menuItems.map((item, index) => (
                <motion.div
                  key={item.section}
                  custom={index}
                  variants={sidebarItemVariants}
                  initial="initial"
                  animate="animate"
                  whileHover="hover"
                >
                  <ListItem
                    onClick={() => handleNavigation(item.section)}
                    sx={{
                      borderRadius: 1,
                      mb: 2,
                      py: 1.8,
                      transition: "background-color 0.3s, transform 0.2s",
                      "&.Mui-selected": {
                        backgroundColor: sidebarColors.selectedItem,
                        "&:hover": { backgroundColor: sidebarColors.selectedItem },
                      },
                      "&:hover": {
                        backgroundColor: sidebarColors.hoverItem,
                      },
                      backgroundColor:
                        activeSection === item.section
                          ? sidebarColors.selectedItem
                          : "transparent",
                      cursor: "pointer",
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <Box sx={{ color: sidebarColors.text }}>{item.icon}</Box>
                    </ListItemIcon>
                    <ListItemText
                      primary={item.text}
                      sx={{
                        "& .MuiListItemText-primary": {
                          fontWeight: activeSection === item.section ? "bold" : "normal",
                          fontSize: "0.95rem",
                        },
                      }}
                    />
                  </ListItem>
                </motion.div>
              ))}
            </List>

            <Box sx={{ mt: "auto" }}>
              <Divider sx={{ backgroundColor: sidebarColors.divider, mx: 2, mb: 2 }} />
              <List sx={{ px: 2, pb: 2 }}>
                <motion.div
                  variants={sidebarItemVariants}
                  custom={menuItems.length}
                  initial="initial"
                  animate="animate"
                  whileHover="hover"
                >
                  <ListItem
                    onClick={handleLogout}
                    sx={{
                      borderRadius: 1,
                      py: 1.5,
                      transition: "background-color 0.3s",
                      "&:hover": { backgroundColor: sidebarColors.hoverItem },
                      cursor: "pointer",
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <LogoutIcon sx={{ color: sidebarColors.text }} />
                    </ListItemIcon>
                    <ListItemText
                      primary="Déconnexion"
                      sx={{
                        "& .MuiListItemText-primary": {
                          fontSize: "0.95rem",
                        },
                      }}
                    />
                  </ListItem>
                </motion.div>
              </List>
            </Box>
          </Box>
        </Slide>
      </Drawer>

      <Box
        sx={{
          flexGrow: 1,
          backgroundColor: "#f5f5f5",
          height: "100%",
          overflow: "auto",
        }}
      >
        <motion.div
          key={activeSection}
          variants={contentVariants}
          initial="initial"
          animate={contentLoaded ? "animate" : "exit"}
          style={{ height: "100%" }}
        >
          {activeSection === "Gérer les utilisateurs" && <AdminGererUtilisateurs />}
          {activeSection === "Gérer les hôpitaux" && <AdminGererHopital />}
        </motion.div>
      </Box>
    </Box>
  );
}

export default AdminDashboard;