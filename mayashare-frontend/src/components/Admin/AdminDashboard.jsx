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
} from "@mui/material";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import PeopleIcon from "@mui/icons-material/People";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import LogoutIcon from "@mui/icons-material/Logout";
import SettingsIcon from "@mui/icons-material/Settings";
import AdminGererUtilisateurs from "./AdminGererUser";
import AdminGererHopital from "./AdminGererHopital";

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
    transition: { duration: 0.2 },
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
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

const SIDEBAR_WIDTH = 280;

function AdminDashboard() {
  const theme = useTheme();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("Gérer les utilisateurs");
  const [userName, setUserName] = useState("Admin");
  const [loading, setLoading] = useState(true);
  const [contentLoaded, setContentLoaded] = useState(false);
  const [userInitials, setUserInitials] = useState("AD");

  const sidebarColors = {
    background: "linear-gradient(195deg, #0078D7, #0066B4)",
    selectedItem: "rgba(255, 255, 255, 0.15)",
    hoverItem: "rgba(255, 255, 255, 0.1)",
    text: "#FFFFFF",
    divider: "rgba(255, 255, 255, 0.12)",
    avatarBg: "#004E8C",
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchUserInfo = async () => {
      try {
        // Simuler une requête API
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
      navigate("/login");
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
          background: "linear-gradient(135deg, #f5f9ff, #e6f0ff)",
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 16,
          }}
        >
          <svg width={64} height={64} viewBox="0 0 100 100">
            <motion.circle
              cx="50"
              cy="50"
              r="40"
              stroke="#0078D7"
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              initial={{ pathLength: 0, rotate: -90 }}
              animate={{ pathLength: 1, rotate: 0 }}
              transition={{
                duration: 1.5,
                ease: "easeInOut",
                repeat: Infinity,
                repeatType: "loop",
              }}
              strokeDasharray="0 1"
            />
          </svg>
          <Typography
            variant="h6"
            color="primary"
            sx={{ fontWeight: 600, mt: 2 }}
          >
            Chargement...
          </Typography>
        </motion.div>
      </Box>
    );
  }

  const menuItems = [
    {
      text: "Gérer les utilisateurs",
      icon: <PeopleIcon sx={{ fontSize: "1.25rem" }} />,
      section: "Gérer les utilisateurs",
    },
    {
      text: "Gérer les hôpitaux",
      icon: <LocalHospitalIcon sx={{ fontSize: "1.25rem" }} />,
      section: "Gérer les hôpitaux",
    },
    {
      text: "Paramètres",
      icon: <SettingsIcon sx={{ fontSize: "1.25rem" }} />,
      section: "Paramètres",
    },
  ];

  return (
    <Box sx={{ display: "flex", height: "100vh", width: "100vw", overflow: "hidden" }}>
      {/* Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: SIDEBAR_WIDTH,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: SIDEBAR_WIDTH,
            boxSizing: "border-box",
            background: sidebarColors.background,
            color: sidebarColors.text,
            display: "flex",
            flexDirection: "column",
            borderRight: "none",
            boxShadow: "0 4px 20px rgba(0, 120, 215, 0.15)",
          },
        }}
      >
        <Slide direction="right" in={true} timeout={600}>
          <Box sx={{ display: "flex", flexDirection: "column", height: "100%", p: 2 }}>
            {/* Logo & User Profile */}
            <motion.div variants={logoVariants} initial="initial" animate="animate">
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  p: 2,
                  mb: 2,
                  borderRadius: 2,
                  background: "rgba(255, 255, 255, 0.05)",
                }}
              >
                <Avatar
                  sx={{
                    bgcolor: sidebarColors.avatarBg,
                    width: 42,
                    height: 42,
                    fontWeight: 600,
                  }}
                >
                  {userInitials}
                </Avatar>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    {userName}
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.8 }}>
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
                      sx={{
                        borderRadius: 2,
                        mb: 1,
                        py: 1.2,
                        px: 2,
                        transition: "all 0.3s ease",
                        "&.Mui-selected": {
                          background: sidebarColors.selectedItem,
                          backdropFilter: "blur(5px)",
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
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <Box sx={{ color: sidebarColors.text }}>{item.icon}</Box>
                      </ListItemIcon>
                      <ListItemText
                        primary={item.text}
                        sx={{
                          "& .MuiListItemText-primary": {
                            fontWeight: activeSection === item.section ? 600 : 500,
                            fontSize: "0.9rem",
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
                  sx={{
                    borderRadius: 2,
                    py: 1.2,
                    px: 2,
                    transition: "all 0.3s ease",
                    "&:hover": { background: sidebarColors.hoverItem },
                    cursor: "pointer",
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <LogoutIcon sx={{ color: sidebarColors.text, fontSize: "1.25rem" }} />
                  </ListItemIcon>
                  <ListItemText
                    primary="Déconnexion"
                    sx={{
                      "& .MuiListItemText-primary": {
                        fontWeight: 500,
                        fontSize: "0.9rem",
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
          background: "linear-gradient(135deg, #f5f9ff, #e6f0ff)",
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
            width: "40%",
            height: "40%",
            background: "radial-gradient(circle, rgba(0, 120, 215, 0.08) 0%, transparent 70%)",
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
          <Box sx={{ p: 3 }}>
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 600, color: "#004E8C" }}>
              {activeSection}
            </Typography>
            
            {activeSection === "Gérer les utilisateurs" && <AdminGererUtilisateurs />}
            {activeSection === "Gérer les hôpitaux" && <AdminGererHopital />}
            {activeSection === "Paramètres" && (
              <Box sx={{ textAlign: "center", py: 10 }}>
                <Typography variant="h6" color="textSecondary">
                  Section Paramètres en développement
                </Typography>
              </Box>
            )}
          </Box>
        </motion.div>
      </Box>
    </Box>
  );
}

export default AdminDashboard;