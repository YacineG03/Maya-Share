// src/components/Dashboard/MedecinDashboard.js
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
  Paper,
} from "@mui/material";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import EventIcon from "@mui/icons-material/Event";
import FolderIcon from "@mui/icons-material/Folder";
import LogoutIcon from "@mui/icons-material/Logout";
import InfirmierGererRV from "./InfirmierGererRV";
import InfirmierGererDossier from "./InfirmierGererDossier";

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
    scale: 1.02,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    transition: { 
      duration: 0.2,
      ease: "easeOut"
    },
  },
};

const contentVariants = {
  initial: { opacity: 0, y: 10 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1],
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: {
      duration: 0.3,
    },
  },
};

const logoVariants = {
  initial: { scale: 0.95, opacity: 0 },
  animate: {
    scale: 1,
    opacity: 1,
    transition: {
      duration: 0.8,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

// Color palette
const colors = {
  primary: "#0077B6",
  secondary: "#00B4D8",
  background: "#023E8A",
  lightBackground: "#F8F9FA",
  text: "#FFFFFF",
  divider: "rgba(255, 255, 255, 0.12)",
  hover: "rgba(0, 180, 216, 0.7)",
  active: "#0096C7",
};

const SIDEBAR_WIDTH = 280;

function InfirmierDashboard() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("Gérer les rendez-vous");
  const [userName, setUserName] = useState("Infirmier");
  const [loading, setLoading] = useState(true);
  const [contentLoaded, setContentLoaded] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/home");
      return;
    }

    const fetchUserInfo = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 800));
        setUserName("Infirmier");
      } catch (err) {
        console.error("Erreur :", err);
      } finally {
        setLoading(false);
        setTimeout(() => setContentLoaded(true), 400);
      }
    };

    fetchUserInfo();
  }, [navigate]);

  const handleLogout = () => {
    setContentLoaded(false);
    toast.success("Déconnexion réussie !", {
      position: "top-right",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      theme: "colored",
    });
    setTimeout(() => {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      navigate("/home");
    }, 2000);
  };

  const handleNavigation = (section) => {
    if (activeSection !== section) {
      setContentLoaded(false);
      setTimeout(() => {
        setActiveSection(section);
        setContentLoaded(true);
      }, 300);
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
          background: `linear-gradient(135deg, ${colors.background} 0%, ${colors.primary} 100%)`,
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <Box sx={{ textAlign: "center" }}>
            <CircularProgress 
              size={60} 
              thickness={4}
              sx={{ 
                color: colors.secondary,
                mb: 2
              }} 
            />
            <Typography 
              variant="h6" 
              color="white"
              sx={{ 
                fontWeight: 500,
                letterSpacing: 1.2
              }}
            >
              Chargement...
            </Typography>
          </Box>
        </motion.div>
      </Box>
    );
  }

  const menuItems = [
    { text: "Gérer les rendez-vous", icon: <EventIcon />, section: "Gérer les rendez-vous" },
    { text: "Gérer les dossiers patients", icon: <FolderIcon />, section: "Gérer les dossiers patients" },
  ];

  return (
    <Box sx={{ 
      display: "flex", 
      height: "100vh", 
      width: "100vw", 
      overflow: "hidden",
      background: colors.lightBackground
    }}>
      <Drawer
        variant="permanent"
        sx={{
          width: SIDEBAR_WIDTH,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: SIDEBAR_WIDTH,
            boxSizing: "border-box",
            background: `linear-gradient(180deg, ${colors.background} 0%, ${colors.primary} 100%)`,
            color: colors.text,
            display: "flex",
            flexDirection: "column",
            borderRight: "none",
            boxShadow: "4px 0 20px rgba(0, 0, 0, 0.1)",
          },
        }}
      >
        <Slide direction="right" in={true} timeout={800}>
          <Box sx={{ 
            display: "flex", 
            flexDirection: "column", 
            height: "100%",
            px: 2
          }}>
            <motion.div 
              variants={logoVariants} 
              initial="initial" 
              animate="animate"
            >
              <Box sx={{ 
                display: "flex", 
                alignItems: "center", 
                mb: 3,
                px: 2,
                pt: 4
              }}>
                <Avatar
                  sx={{ 
                    bgcolor: colors.secondary,
                    width: 40,
                    height: 40,
                    mr: 2,
                    fontSize: 20,
                    fontWeight: "bold"
                  }}
                >
                  {userName.charAt(0)}
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    MayaShare
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Bonjour, {userName}
                  </Typography>
                </Box>
              </Box>
            </motion.div>

            <Divider sx={{ 
              backgroundColor: colors.divider, 
              my: 1,
              opacity: 0.5
            }} />

            <List sx={{ 
              px: 1, 
              mt: 1, 
              flex: 1,
              "& .MuiListItem-root": {
                borderRadius: 2,
                mb: 1,
              }
            }}>
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
                      py: 1.5,
                      transition: "all 0.3s ease",
                      backgroundColor: activeSection === item.section ? 
                        colors.active : "transparent",
                      "&:hover": {
                        backgroundColor: colors.hover,
                      },
                      cursor: "pointer",
                    }}
                  >
                    <ListItemIcon sx={{ 
                      minWidth: 40,
                      color: activeSection === item.section ? 
                        colors.text : "rgba(255, 255, 255, 0.8)"
                    }}>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.text}
                      primaryTypographyProps={{
                        sx: {
                          fontWeight: activeSection === item.section ? 600 : 500,
                          fontSize: "0.95rem",
                          color: activeSection === item.section ? 
                            colors.text : "rgba(255, 255, 255, 0.9)"
                        }
                      }}
                    />
                  </ListItem>
                </motion.div>
              ))}
            </List>

            <Box sx={{ mt: "auto", mb: 2 }}>
              <Divider sx={{ 
                backgroundColor: colors.divider,
                my: 2,
                opacity: 0.5
              }} />
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
                    py: 1.5,
                    borderRadius: 2,
                    transition: "all 0.3s ease",
                    "&:hover": { 
                      backgroundColor: colors.hover 
                    },
                    cursor: "pointer",
                  }}
                >
                  <ListItemIcon sx={{ 
                    minWidth: 40,
                    color: "rgba(255, 255, 255, 0.8)"
                  }}>
                    <LogoutIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Déconnexion"
                    primaryTypographyProps={{
                      sx: {
                        fontWeight: 500,
                        fontSize: "0.95rem",
                        color: "rgba(255, 255, 255, 0.9)"
                      }
                    }}
                  />
                </ListItem>
              </motion.div>
            </Box>
          </Box>
        </Slide>
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          height: "100%",
          overflow: "auto",
          background: colors.lightBackground,
          p: 3
        }}
      >
        <Paper
          component={motion.div}
          key={activeSection}
          variants={contentVariants}
          initial="initial"
          animate={contentLoaded ? "animate" : "exit"}
          sx={{
            height: "100%",
            borderRadius: 3,
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
            overflow: "hidden",
            background: "white"
          }}
        >
          {activeSection === "Gérer les rendez-vous" && <InfirmierGererRV />}
          {activeSection === "Gérer les dossiers patients" && <InfirmierGererDossier />}
        </Paper>
      </Box>
    </Box>
  );
}

export default InfirmierDashboard;