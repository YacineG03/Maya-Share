// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import {
//   Box,
//   Drawer,
//   List,
//   ListItem,
//   ListItemIcon,
//   ListItemText,
//   Typography,
//   Divider,
//   CircularProgress,
//   Slide,
//   Avatar,
//   Paper,
//   Grid,
//   Card,
//   CardContent,
// } from '@mui/material';
// import { motion } from 'framer-motion';
// import { toast } from 'react-toastify';
// import HomeIcon from '@mui/icons-material/Home';
// import PeopleIcon from '@mui/icons-material/People';
// import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
// import LogoutIcon from '@mui/icons-material/Logout';
// import SettingsIcon from '@mui/icons-material/Settings';
// import AdminGererUtilisateurs from './AdminGererUser';
// import AdminGererHopital from './AdminGererHopital';
// import { getUsers, getHopitaux } from '../../services/api';

// // Animation variants
// const sidebarItemVariants = {
//   initial: { x: -20, opacity: 0 },
//   animate: (index) => ({
//     x: 0,
//     opacity: 1,
//     transition: {
//       delay: 0.05 * index,
//       duration: 0.4,
//       ease: [0.16, 1, 0.3, 1],
//     },
//   }), // Fixed: Changed ) to },
//   hover: {
//     scale: 1.02,
//     backgroundColor: 'rgba(255, 255, 255, 0.1)',
//     transition: {
//       duration: 0.2,
//       ease: 'easeOut',
//     },
//   },
// };

// const contentVariants = {
//   initial: { opacity: 0, y: 10 },
//   animate: {
//     opacity: 1,
//     y: 0,
//     transition: {
//       duration: 0.5,
//       ease: [0.16, 1, 0.3, 1],
//     },
//   },
//   exit: {
//     opacity: 0,
//     y: -10,
//     transition: {
//       duration: 0.3,
//     },
//   },
// };

// const logoVariants = {
//   initial: { scale: 0.95, opacity: 0 },
//   animate: {
//     scale: 1,
//     opacity: 1,
//     transition: {
//       duration: 0.8,
//       ease: [0.16, 1, 0.3, 1],
//     },
//   },
// };

// const cardVariants = {
//   initial: { opacity: 0, scale: 0.95 },
//   animate: {
//     opacity: 1,
//     scale: 1,
//     transition: {
//       duration: 0.5,
//       ease: [0.16, 1, 0.3, 1],
//     },
//   },
//   hover: {
//     scale: 1.03,
//     boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
//     transition: { duration: 0.2 },
//   },
// };

// // Color palette (same as MedecinDashboard)
// const colors = {
//   primary: '#0077B6',
//   secondary: '#00B4D8',
//   background: '#023E8A',
//   lightBackground: '#F8F9FA',
//   text: '#FFFFFF',
//   divider: 'rgba(255, 255, 255, 0.12)',
//   hover: 'rgba(0, 180, 216, 0.7)',
//   active: '#0096C7',
// };

// const SIDEBAR_WIDTH = 280;

// function AdminDashboard() {
//   const navigate = useNavigate();
//   const [activeSection, setActiveSection] = useState('Accueil');
//   const [userName, setUserName] = useState('Admin');
//   const [loading, setLoading] = useState(true);
//   const [contentLoaded, setContentLoaded] = useState(false);
//   const [totalUsers, setTotalUsers] = useState({
//     total: 0,
//     patients: 0,
//     medecins: 0,
//     infirmiers: 0,
//     admins: 0,
//   });
//   const [totalHospitals, setTotalHospitals] = useState(0);
//   const [loadingStats, setLoadingStats] = useState(true);

//   useEffect(() => {
//     const token = localStorage.getItem('token');
//     if (!token) {
//       console.log('Token absent dans AdminDashboard, redirection vers /login');
//       navigate('/login');
//       return;
//     }

//     const fetchUserInfo = async () => {
//       try {
//         await new Promise((resolve) => setTimeout(resolve, 800)); // Simulation de chargement
//         setUserName('Administrateur');
//       } catch (err) {
//         console.error(
//           "Erreur lors de la récupération des informations de l'utilisateur :",
//           err
//         );
//       } finally {
//         setLoading(false);
//         setTimeout(() => setContentLoaded(true), 400);
//       }
//     };

//     fetchUserInfo();
//   }, [navigate]);

//   useEffect(() => {
//     const fetchStats = async () => {
//       setLoadingStats(true);
//       try {
//         const usersResponse = await getUsers({ limit: 1000, page: 1 });
//         const allUsers = usersResponse.data.users || [];
//         const patientCount = allUsers.filter(
//           (user) => user.role === 'patient'
//         ).length;
//         const medecinCount = allUsers.filter(
//           (user) => user.role === 'medecin'
//         ).length;
//         const infirmierCount = allUsers.filter(
//           (user) => user.role === 'infirmier'
//         ).length;
//         const adminCount = allUsers.filter(
//           (user) => user.role === 'admin'
//         ).length;

//         setTotalUsers({
//           total: usersResponse.data.total || allUsers.length,
//           patients: patientCount,
//           medecins: medecinCount,
//           infirmiers: infirmierCount,
//           admins: adminCount,
//         });

//         const hospitalsResponse = await getHopitaux();
//         setTotalHospitals(hospitalsResponse.data.length || 0);
//       } catch (err) {
//         console.error('Erreur lors de la récupération des statistiques :', err);
//         toast.error('Erreur lors de la récupération des statistiques.');
//       } finally {
//         setLoadingStats(false);
//       }
//     };

//     fetchStats();
//   }, []);

//   const handleLogout = () => {
//     setContentLoaded(false);
//     toast.success('Déconnexion réussie !', {
//       position: 'top-right',
//       autoClose: 2000,
//       hideProgressBar: false,
//       closeOnClick: true,
//       pauseOnHover: true,
//       draggable: true,
//       theme: 'colored',
//     });
//     setTimeout(() => {
//       localStorage.removeItem('token');
//       localStorage.removeItem('role');
//       navigate('/home');
//     }, 2000);
//   };

//   const handleNavigation = (section) => {
//     if (activeSection !== section) {
//       setContentLoaded(false);
//       setTimeout(() => {
//         setActiveSection(section);
//         setContentLoaded(true);
//       }, 300);
//     }
//   };

//   if (loading) {
//     return (
//       <Box
//         sx={{
//           display: 'flex',
//           justifyContent: 'center',
//           alignItems: 'center',
//           height: '100vh',
//           background: `linear-gradient(135deg, ${colors.background} 0%, ${colors.primary} 100%)`,
//         }}
//       >
//         <motion.div
//           initial={{ opacity: 0, scale: 0.8 }}
//           animate={{ opacity: 1, scale: 1 }}
//           transition={{ duration: 0.6 }}
//         >
//           <Box sx={{ textAlign: 'center' }}>
//             <CircularProgress
//               size={60}
//               thickness={4}
//               sx={{
//                 color: colors.secondary,
//                 mb: 2,
//               }}
//             />
//             <Typography
//               variant='h6'
//               color='white'
//               sx={{
//                 fontWeight: 500,
//                 letterSpacing: 1.2,
//               }}
//             >
//               Chargement...
//             </Typography>
//           </Box>
//         </motion.div>
//       </Box>
//     );
//   }

//   const menuItems = [
//     {
//       text: 'Accueil',
//       icon: <HomeIcon />,
//       section: 'Accueil',
//     },
//     {
//       text: 'Gérer les utilisateurs',
//       icon: <PeopleIcon />,
//       section: 'Gérer les utilisateurs',
//     },
//     {
//       text: 'Gérer les hôpitaux',
//       icon: <LocalHospitalIcon />,
//       section: 'Gérer les hôpitaux',
//     },
//     {
//       text: 'Paramètres',
//       icon: <SettingsIcon />,
//       section: 'Paramètres',
//     },
//   ];

//   return (
//     <Box
//       sx={{
//         display: 'flex',
//         height: '100vh',
//         width: '100vw',
//         overflow: 'hidden',
//         background: colors.lightBackground,
//       }}
//     >
//       <Drawer
//         variant='permanent'
//         sx={{
//           width: SIDEBAR_WIDTH,
//           flexShrink: 0,
//           '& .MuiDrawer-paper': {
//             width: SIDEBAR_WIDTH,
//             boxSizing: 'border-box',
//             background: `linear-gradient(180deg, ${colors.background} 0%, ${colors.primary} 100%)`,
//             color: colors.text,
//             display: 'flex',
//             flexDirection: 'column',
//             borderRight: 'none',
//             boxShadow: '4px 0 20px rgba(0, 0, 0, 0.1)',
//           },
//         }}
//       >
//         <Slide direction='right' in={true} timeout={800}>
//           <Box
//             sx={{
//               display: 'flex',
//               flexDirection: 'column',
//               height: '100%',
//               px: 2,
//             }}
//           >
//             <motion.div
//               variants={logoVariants}
//               initial='initial'
//               animate='animate'
//             >
//               <Box
//                 sx={{
//                   display: 'flex',
//                   alignItems: 'center',
//                   mb: 3,
//                   px: 2,
//                   pt: 4,
//                 }}
//               >
//                 <Avatar
//                   sx={{
//                     bgcolor: colors.secondary,
//                     width: 40,
//                     height: 40,
//                     mr: 2,
//                     fontSize: 20,
//                     fontWeight: 'bold',
//                   }}
//                 >
//                   {userName.charAt(0)}
//                 </Avatar>
//                 <Box>
//                   <Typography variant='h6' sx={{ fontWeight: 600 }}>
//                     MayaShare
//                   </Typography>
//                   <Typography variant='body2' sx={{ opacity: 0.8 }}>
//                     Bonjour, {userName}
//                   </Typography>
//                 </Box>
//               </Box>
//             </motion.div>

//             <Divider
//               sx={{
//                 backgroundColor: colors.divider,
//                 my: 1,
//                 opacity: 0.5,
//               }}
//             />

//             <List
//               sx={{
//                 px: 1,
//                 mt: 1,
//                 flex: 1,
//                 '& .MuiListItem-root': {
//                   borderRadius: 2,
//                   mb: 1,
//                 },
//               }}
//             >
//               {menuItems.map((item, index) => (
//                 <motion.div
//                   key={item.section}
//                   custom={index}
//                   variants={sidebarItemVariants}
//                   initial='initial'
//                   animate='animate'
//                   whileHover='hover'
//                 >
//                   <ListItem
//                     onClick={() => handleNavigation(item.section)}
//                     sx={{
//                       py: 1.5,
//                       transition: 'all 0.3s ease',
//                       backgroundColor:
//                         activeSection === item.section
//                           ? colors.active
//                           : 'transparent',
//                       '&:hover': {
//                         backgroundColor: colors.hover,
//                       },
//                       cursor: 'pointer',
//                     }}
//                   >
//                     <ListItemIcon
//                       sx={{
//                         minWidth: 40,
//                         color:
//                           activeSection === item.section
//                             ? colors.text
//                             : 'rgba(255, 255, 255, 0.8)',
//                       }}
//                     >
//                       {item.icon}
//                     </ListItemIcon>
//                     <ListItemText
//                       primary={item.text}
//                       primaryTypographyProps={{
//                         sx: {
//                           fontWeight:
//                             activeSection === item.section ? 600 : 500,
//                           fontSize: '0.95rem',
//                           color:
//                             activeSection === item.section
//                               ? colors.text
//                               : 'rgba(255, 255, 255, 0.9)',
//                         },
//                       }}
//                     />
//                   </ListItem>
//                 </motion.div>
//               ))}
//             </List>

//             <Box sx={{ mt: 'auto', mb: 2 }}>
//               <Divider
//                 sx={{
//                   backgroundColor: colors.divider,
//                   my: 2,
//                   opacity: 0.5,
//                 }}
//               />
//               <motion.div
//                 variants={sidebarItemVariants}
//                 custom={menuItems.length}
//                 initial='initial'
//                 animate='animate'
//                 whileHover='hover'
//               >
//                 <ListItem
//                   onClick={handleLogout}
//                   sx={{
//                     py: 1.5,
//                     borderRadius: 2,
//                     transition: 'all 0.3s ease',
//                     '&:hover': {
//                       backgroundColor: colors.hover,
//                     },
//                     cursor: 'pointer',
//                   }}
//                 >
//                   <ListItemIcon
//                     sx={{
//                       minWidth: 40,
//                       color: 'rgba(255, 255, 255, 0.8)',
//                     }}
//                   >
//                     <LogoutIcon />
//                   </ListItemIcon>
//                   <ListItemText
//                     primary='Déconnexion'
//                     primaryTypographyProps={{
//                       sx: {
//                         fontWeight: 500,
//                         fontSize: '0.95rem',
//                         color: 'rgba(255, 255, 255, 0.9)',
//                       },
//                     }}
//                   />
//                 </ListItem>
//               </motion.div>
//             </Box>
//           </Box>
//         </Slide>
//       </Drawer>

//       <Box
//         component='main'
//         sx={{
//           flexGrow: 1,
//           height: '100%',
//           overflow: 'auto',
//           background: colors.lightBackground,
//           p: 3,
//         }}
//       >
//         <Paper
//           component={motion.div}
//           key={activeSection}
//           variants={contentVariants}
//           initial='initial'
//           animate={contentLoaded ? 'animate' : 'exit'}
//           sx={{
//             height: '100%',
//             borderRadius: 3,
//             boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
//             overflow: 'hidden',
//             background: 'white',
//             p: 3,
//           }}
//         >
//           {activeSection === 'Accueil' && (
//             <Box>
//               <Typography
//                 variant='h5'
//                 sx={{
//                   mb: 3,
//                   fontWeight: 600,
//                   color: colors.background,
//                 }}
//               >
//                 Bienvenue, {userName} !
//               </Typography>
//               {loadingStats ? (
//                 <Box
//                   sx={{
//                     display: 'flex',
//                     justifyContent: 'center',
//                     alignItems: 'center',
//                     height: '50vh',
//                   }}
//                 >
//                   <CircularProgress sx={{ color: colors.secondary }} />
//                 </Box>
//               ) : (
//                 <Grid container spacing={3}>
//                   <Grid item xs={12} sm={6}>
//                     <motion.div
//                       variants={cardVariants}
//                       initial='initial'
//                       animate='animate'
//                       whileHover='hover'
//                     >
//                       <Card
//                         sx={{
//                           borderRadius: 3,
//                           boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
//                           background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
//                           color: colors.text,
//                         }}
//                       >
//                         <CardContent>
//                           <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
//                             <PeopleIcon sx={{ fontSize: 40, mr: 2 }} />
//                             <Typography variant='h4' sx={{ fontWeight: 600 }}>
//                               {totalUsers.total}
//                             </Typography>
//                           </Box>
//                           <Typography variant='body2' sx={{ mb: 2 }}>
//                             Utilisateurs au total
//                           </Typography>
//                           <Divider sx={{ backgroundColor: colors.divider, my: 1 }} />
//                           <Grid container spacing={1}>
//                             <Grid item xs={6}>
//                               <Typography variant='body2'>
//                                 Patients: {totalUsers.patients}
//                               </Typography>
//                             </Grid>
//                             <Grid item xs={6}>
//                               <Typography variant='body2'>
//                                 Médecins: {totalUsers.medecins}
//                               </Typography>
//                             </Grid>
//                             <Grid item xs={6}>
//                               <Typography variant='body2'>
//                                 Infirmiers: {totalUsers.infirmiers}
//                               </Typography>
//                             </Grid>
//                             <Grid item xs={6}>
//                               <Typography variant='body2'>
//                                 Admins: {totalUsers.admins}
//                               </Typography>
//                             </Grid>
//                           </Grid>
//                         </CardContent>
//                       </Card>
//                     </motion.div>
//                   </Grid>
//                   <Grid item xs={12} sm={6}>
//                     <motion.div
//                       variants={cardVariants}
//                       initial='initial'
//                       animate='animate'
//                       whileHover='hover'
//                     >
//                       <Card
//                         sx={{
//                           borderRadius: 3,
//                           boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
//                           background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
//                           color: colors.text,
//                         }}
//                       >
//                         <CardContent>
//                           <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
//                             <LocalHospitalIcon sx={{ fontSize: 40, mr: 2 }} />
//                             <Typography variant='h4' sx={{ fontWeight: 600 }}>
//                               {totalHospitals}
//                             </Typography>
//                           </Box>
//                           <Typography variant='body2'>
//                             Hôpitaux enregistrés
//                           </Typography>
//                         </CardContent>
//                       </Card>
//                     </motion.div>
//                   </Grid>
//                 </Grid>
//               )}
//             </Box>
//           )}
//           {activeSection === 'Gérer les utilisateurs' && <AdminGererUtilisateurs />}
//           {activeSection === 'Gérer les hôpitaux' && <AdminGererHopital />}
//           {activeSection === 'Paramètres' && (
//             <Box sx={{ textAlign: 'center', py: 10 }}>
//               <Typography variant='h6' color={colors.background}>
//                 Section Paramètres en développement
//               </Typography>
//             </Box>
//           )}
//         </Paper>
//       </Box>
//     </Box>
//   );
// }

// export default AdminDashboard;

// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import {
//   Box,
//   Drawer,
//   List,
//   ListItem,
//   ListItemIcon,
//   ListItemText,
//   Typography,
//   Divider,
//   CircularProgress,
//   Slide,
//   Avatar,
//   Paper,
// } from '@mui/material';
// import { motion } from 'framer-motion';
// import { toast } from 'react-toastify';
// import HomeIcon from '@mui/icons-material/Home';
// import PeopleIcon from '@mui/icons-material/People';
// import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
// import LogoutIcon from '@mui/icons-material/Logout';
// import SettingsIcon from '@mui/icons-material/Settings';
// import AdminGererUtilisateurs from './AdminGererUser';
// import AdminGererHopital from './AdminGererHopital';

// // Animation variants
// const sidebarItemVariants = {
//   initial: { x: -20, opacity: 0 },
//   animate: (index) => ({
//     x: 0,
//     opacity: 1,
//     transition: {
//       delay: 0.05 * index,
//       duration: 0.4,
//       ease: [0.16, 1, 0.3, 1],
//     },
//   }),
//   hover: {
//     scale: 1.02,
//     backgroundColor: 'rgba(255, 255, 255, 0.1)',
//     transition: {
//       duration: 0.2,
//       ease: 'easeOut',
//     },
//   },
// };

// const contentVariants = {
//   initial: { opacity: 0, y: 10 },
//   animate: {
//     opacity: 1,
//     y: 0,
//     transition: {
//       duration: 0.5,
//       ease: [0.16, 1, 0.3, 1],
//     },
//   },
//   exit: {
//     opacity: 0,
//     y: -10,
//     transition: {
//       duration: 0.3,
//     },
//   },
// };

// const logoVariants = {
//   initial: { scale: 0.95, opacity: 0 },
//   animate: {
//     scale: 1,
//     opacity: 1,
//     transition: {
//       duration: 0.8,
//       ease: [0.16, 1, 0.3, 1],
//     },
//   },
// };

// // Color palette
// const colors = {
//   primary: '#0077B6',
//   secondary: '#00B4D8',
//   background: '#023E8A',
//   lightBackground: '#F8F9FA',
//   text: '#FFFFFF',
//   divider: 'rgba(255, 255, 255, 0.12)',
//   hover: 'rgba(0, 180, 216, 0.7)',
//   active: '#0096C7',
// };

// const SIDEBAR_WIDTH = 280;

// function AdminDashboard() {
//   const navigate = useNavigate();
//   const [activeSection, setActiveSection] = useState('Accueil');
//   const [userName, setUserName] = useState('Admin');
//   const [loading, setLoading] = useState(true);
//   const [contentLoaded, setContentLoaded] = useState(false);

//   useEffect(() => {
//     const token = localStorage.getItem('token');
//     if (!token) {
//       console.log('Token absent dans AdminDashboard, redirection vers /login');
//       navigate('/login');
//       return;
//     }

//     const fetchUserInfo = async () => {
//       try {
//         await new Promise((resolve) => setTimeout(resolve, 800)); // Simulation de chargement
//         setUserName('Administrateur');
//       } catch (err) {
//         console.error(
//           "Erreur lors de la récupération des informations de l'utilisateur :",
//           err
//         );
//       } finally {
//         setLoading(false);
//         setTimeout(() => setContentLoaded(true), 400);
//       }
//     };

//     fetchUserInfo();
//   }, [navigate]);

//   const handleLogout = () => {
//     setContentLoaded(false);
//     toast.success('Déconnexion réussie !', {
//       position: 'top-right',
//       autoClose: 2000,
//       hideProgressBar: false,
//       closeOnClick: true,
//       pauseOnHover: true,
//       draggable: true,
//       theme: 'colored',
//     });
//     setTimeout(() => {
//       localStorage.removeItem('token');
//       localStorage.removeItem('role');
//       navigate('/home');
//     }, 2000);
//   };

//   const handleNavigation = (section) => {
//     if (activeSection !== section) {
//       setContentLoaded(false);
//       setTimeout(() => {
//         setActiveSection(section);
//         setContentLoaded(true);
//       }, 300);
//     }
//   };

//   if (loading) {
//     return (
//       <Box
//         sx={{
//           display: 'flex',
//           justifyContent: 'center',
//           alignItems: 'center',
//           height: '100vh',
//           background: `linear-gradient(135deg, ${colors.background} 0%, ${colors.primary} 100%)`,
//         }}
//       >
//         <motion.div
//           initial={{ opacity: 0, scale: 0.8 }}
//           animate={{ opacity: 1, scale: 1 }}
//           transition={{ duration: 0.6 }}
//         >
//           <Box sx={{ textAlign: 'center' }}>
//             <CircularProgress
//               size={60}
//               thickness={4}
//               sx={{
//                 color: colors.secondary,
//                 mb: 2,
//               }}
//             />
//             <Typography
//               variant='h6'
//               color='white'
//               sx={{
//                 fontWeight: 500,
//                 letterSpacing: 1.2,
//               }}
//             >
//               Chargement...
//             </Typography>
//           </Box>
//         </motion.div>
//       </Box>
//     );
//   }

//   const menuItems = [
//     {
//       text: 'Accueil',
//       icon: <HomeIcon />,
//       section: 'Accueil',
//     },
//     {
//       text: 'Gérer les utilisateurs',
//       icon: <PeopleIcon />,
//       section: 'Gérer les utilisateurs',
//     },
//     {
//       text: 'Gérer les hôpitaux',
//       icon: <LocalHospitalIcon />,
//       section: 'Gérer les hôpitaux',
//     },
//     {
//       text: 'Paramètres',
//       icon: <SettingsIcon />,
//       section: 'Paramètres',
//     },
//   ];

//   return (
//     <Box
//       sx={{
//         display: 'flex',
//         height: '100vh',
//         width: '100vw',
//         overflow: 'hidden',
//         background: colors.lightBackground,
//       }}
//     >
//       <Drawer
//         variant='permanent'
//         sx={{
//           width: SIDEBAR_WIDTH,
//           flexShrink: 0,
//           '& .MuiDrawer-paper': {
//             width: SIDEBAR_WIDTH,
//             boxSizing: 'border-box',
//             background: `linear-gradient(180deg, ${colors.background} 0%, ${colors.primary} 100%)`,
//             color: colors.text,
//             display: 'flex',
//             flexDirection: 'column',
//             borderRight: 'none',
//             boxShadow: '4px 0 20px rgba(0, 0, 0, 0.1)',
//           },
//         }}
//       >
//         <Slide direction='right' in={true} timeout={800}>
//           <Box
//             sx={{
//               display: 'flex',
//               flexDirection: 'column',
//               height: '100%',
//               px: 2,
//             }}
//           >
//             <motion.div
//               variants={logoVariants}
//               initial='initial'
//               animate='animate'
//             >
//               <Box
//                 sx={{
//                   display: 'flex',
//                   alignItems: 'center',
//                   mb: 3,
//                   px: 2,
//                   pt: 4,
//                 }}
//               >
//                 <Avatar
//                   sx={{
//                     bgcolor: colors.secondary,
//                     width: 40,
//                     height: 40,
//                     mr: 2,
//                     fontSize: 20,
//                     fontWeight: 'bold',
//                   }}
//                 >
//                   {userName.charAt(0)}
//                 </Avatar>
//                 <Box>
//                   <Typography variant='h6' sx={{ fontWeight: 600 }}>
//                     MayaShare
//                   </Typography>
//                   <Typography variant='body2' sx={{ opacity: 0.8 }}>
//                     Bonjour, {userName}
//                   </Typography>
//                 </Box>
//               </Box>
//             </motion.div>

//             <Divider
//               sx={{
//                 backgroundColor: colors.divider,
//                 my: 1,
//                 opacity: 0.5,
//               }}
//             />

//             <List
//               sx={{
//                 px: 1,
//                 mt: 1,
//                 flex: 1,
//                 '& .MuiListItem-root': {
//                   borderRadius: 2,
//                   mb: 1,
//                 },
//               }}
//             >
//               {menuItems.map((item, index) => (
//                 <motion.div
//                   key={item.section}
//                   custom={index}
//                   variants={sidebarItemVariants}
//                   initial='initial'
//                   animate='animate'
//                   whileHover='hover'
//                 >
//                   <ListItem
//                     onClick={() => handleNavigation(item.section)}
//                     sx={{
//                       py: 1.5,
//                       transition: 'all 0.3s ease',
//                       backgroundColor:
//                         activeSection === item.section
//                           ? colors.active
//                           : 'transparent',
//                       '&:hover': {
//                         backgroundColor: colors.hover,
//                       },
//                       cursor: 'pointer',
//                     }}
//                   >
//                     <ListItemIcon
//                       sx={{
//                         minWidth: 40,
//                         color:
//                           activeSection === item.section
//                             ? colors.text
//                             : 'rgba(255, 255, 255, 0.8)',
//                       }}
//                     >
//                       {item.icon}
//                     </ListItemIcon>
//                     <ListItemText
//                       primary={item.text}
//                       primaryTypographyProps={{
//                         sx: {
//                           fontWeight:
//                             activeSection === item.section ? 600 : 500,
//                           fontSize: '0.95rem',
//                           color:
//                             activeSection === item.section
//                               ? colors.text
//                               : 'rgba(255, 255, 255, 0.9)',
//                         },
//                       }}
//                     />
//                   </ListItem>
//                 </motion.div>
//               ))}
//             </List>

//             <Box sx={{ mt: 'auto', mb: 2 }}>
//               <Divider
//                 sx={{
//                   backgroundColor: colors.divider,
//                   my: 2,
//                   opacity: 0.5,
//                 }}
//               />
//               <motion.div
//                 variants={sidebarItemVariants}
//                 custom={menuItems.length}
//                 initial='initial'
//                 animate='animate'
//                 whileHover='hover'
//               >
//                 <ListItem
//                   onClick={handleLogout}
//                   sx={{
//                     py: 1.5,
//                     borderRadius: 2,
//                     transition: 'all 0.3s ease',
//                     '&:hover': {
//                       backgroundColor: colors.hover,
//                     },
//                     cursor: 'pointer',
//                   }}
//                 >
//                   <ListItemIcon
//                     sx={{
//                       minWidth: 40,
//                       color: 'rgba(255, 255, 255, 0.8)',
//                     }}
//                   >
//                     <LogoutIcon />
//                   </ListItemIcon>
//                   <ListItemText
//                     primary='Déconnexion'
//                     primaryTypographyProps={{
//                       sx: {
//                         fontWeight: 500,
//                         fontSize: '0.95rem',
//                         color: 'rgba(255, 255, 255, 0.9)',
//                       },
//                     }}
//                   />
//                 </ListItem>
//               </motion.div>
//             </Box>
//           </Box>
//         </Slide>
//       </Drawer>

//       <Box
//         component='main'
//         sx={{
//           flexGrow: 1,
//           height: '100%',
//           overflow: 'auto',
//           background: colors.lightBackground,
//           p: 3,
//         }}
//       >
//         <Paper
//           component={motion.div}
//           key={activeSection}
//           variants={contentVariants}
//           initial='initial'
//           animate={contentLoaded ? 'animate' : 'exit'}
//           sx={{
//             height: '100%',
//             borderRadius: 3,
//             boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
//             overflow: 'hidden',
//             background: 'white',
//             p: 3,
//           }}
//         >
//           {activeSection === 'Accueil' && (
//             <Box>
//               <Typography
//                 variant='h5'
//                 sx={{
//                   mb: 3,
//                   fontWeight: 600,
//                   color: colors.background,
//                 }}
//               >
//                 Bienvenue, {userName} !
//               </Typography>
//               <Typography variant='h6'>Charts and calendar disabled for testing.</Typography>
//             </Box>
//           )}
//           {activeSection === 'Gérer les utilisateurs' && <AdminGererUtilisateurs />}
//           {activeSection === 'Gérer les hôpitaux' && <AdminGererHopital />}
//           {activeSection === 'Paramètres' && (
//             <Box sx={{ textAlign: 'center', py: 10 }}>
//               <Typography variant='h6' color={colors.background}>
//                 Section Paramètres en développement
//               </Typography>
//             </Box>
//           )}
//         </Paper>
//       </Box>
//     </Box>
//   );
// }

// export default AdminDashboard;

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Button,
  Chip,
  IconButton,
  Select,
  MenuItem,
  Badge,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import HomeIcon from '@mui/icons-material/Home';
import PeopleIcon from '@mui/icons-material/People';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import LogoutIcon from '@mui/icons-material/Logout';
import SettingsIcon from '@mui/icons-material/Settings';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import TodayIcon from '@mui/icons-material/Today';
import AdminManageUsers from './AdminGererUser';
import AdminGererHopital from './AdminGererHopital';
import { getUsers } from '../../services/api';

// Unified color palette (aligned with AdminGererUser and MedecinAgenda)
const colors = {
  primary: '#0077B6',
  primaryLight: '#0096C7',
  secondary: '#00B4D8',
  secondaryLight: '#48CAE4',
  background: '#F8F9FA',
  cardBackground: 'white',
  text: '#1A202C',
  textSecondary: '#4A5568',
  success: '#10B981',
  successLight: '#D1FAE5',
  error: '#EF4444',
  errorLight: '#FEE2E2',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  info: '#3B82F6',
  infoLight: '#DBEAFE',
  divider: 'rgba(0, 0, 0, 0.08)',
  shadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
  hover: 'rgba(0, 119, 182, 0.05)',
  today: '#EFF6FF',
  sidebarBackground: '#0077B6',
  sidebarText: '#FFFFFF',
  sidebarHover: 'rgba(0, 180, 216, 0.7)',
  sidebarActive: '#0096C7',
};

// Animation variants (aligned with MedecinAgenda)
const sidebarItemVariants = {
  initial: { x: -20, opacity: 0 },
  animate: (index) => ({
    x: 0,
    opacity: 1,
    transition: { delay: 0.05 * index, duration: 0.4 },
  }),
  hover: { scale: 1.02, backgroundColor: colors.sidebarHover, transition: { duration: 0.2 } },
};

const contentVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.3 } },
};

const logoVariants = {
  initial: { scale: 0.95, opacity: 0 },
  animate: { scale: 1, opacity: 1, transition: { duration: 0.8 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  hover: {
    backgroundColor: colors.hover,
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
    transition: { duration: 0.2 },
  },
};

const SIDEBAR_WIDTH = 280;

function AdminDashboard() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [activeSection, setActiveSection] = useState('Accueil');
  const [userName, setUserName] = useState('Admin');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Veuillez vous connecter.', { position: 'top-right' });
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        // Simulate user info fetch
        await new Promise((resolve) => setTimeout(resolve, 800));
        setUserName('Administrateur'); // TODO: Fetch from API
        // Fetch users for statistics
        const usersResponse = await getUsers();
        setUsers(usersResponse.data.users || []);
      } catch (err) {
        setError('Impossible de charger les données.');
        toast.error('Erreur de chargement.', { position: 'top-right' });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleLogout = () => {
    toast.success('Déconnexion réussie !', { position: 'top-right', autoClose: 2000 });
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/home');
  };

  const handleNavigation = (section) => {
    if (activeSection !== section) {
      setActiveSection(section);
    }
  };

  // User statistics
  const userStats = useMemo(() => ({
    admins: users.filter((user) => user.role === 'Admin').length,
    medecins: users.filter((user) => user.role === 'Médecin').length,
    infirmiers: users.filter((user) => user.role === 'Infirmier').length,
    patients: users.filter((user) => user.role === 'Patient').length,
  }), [users]);

  // Calendar logic (simplified from MedecinAgenda)
  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();
  const getMonthData = () => {
    const year = selectedYear;
    const month = selectedDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const days = [];

    for (let i = 0; i < (firstDay === 0 ? 6 : firstDay - 1); i++) {
      days.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      // Simulate events (e.g., user registrations)
      const events = users.filter((user) => {
        const createdAt = new Date(user.createdAt || Date.now());
        return createdAt.getDate() === day && createdAt.getMonth() === month && createdAt.getFullYear() === year;
      }).map((user) => ({
        id: user.idUtilisateur,
        title: `Nouvel utilisateur: ${user.nom}`,
        role: user.role,
      }));
      days.push({ day, events });
    }

    return days;
  };

  const monthData = getMonthData();
  const weeks = [];
  for (let i = 0; i < monthData.length; i += 7) {
    weeks.push(monthData.slice(i, i + 7));
  }

  const isToday = (day) => {
    const today = new Date();
    return (
      day &&
      day.day === today.getDate() &&
      selectedDate.getMonth() === today.getMonth() &&
      selectedYear === today.getFullYear()
    );
  };

  const goToCurrentMonth = () => {
    const today = new Date();
    setSelectedDate(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedYear(today.getFullYear());
  };

  const menuItems = [
    { text: 'Accueil', icon: <HomeIcon />, section: 'Accueil' },
    { text: 'Gérer les utilisateurs', icon: <PeopleIcon />, section: 'Gérer les utilisateurs' },
    { text: 'Gérer les hôpitaux', icon: <LocalHospitalIcon />, section: 'Gérer les hôpitaux' },
    { text: 'Paramètres', icon: <SettingsIcon />, section: 'Paramètres' },
  ];

  if (loading) {
    return (
      <Box
        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: colors.background }}
        role="region"
        aria-live="polite"
      >
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6 }}>
          <Box sx={{ textAlign: 'center' }}>
            <CircularProgress size={60} thickness={4} sx={{ color: colors.secondary, mb: 2 }} aria-label="Chargement en cours" />
            <Typography variant="h6" color={colors.text}>Chargement...</Typography>
          </Box>
        </motion.div>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: colors.background, p: 3 }}>
        <Paper sx={{ p: 4, borderRadius: 2, boxShadow: colors.shadow, textAlign: 'center' }}>
          <Typography variant="h6" color={colors.error} mb={2}>{error}</Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => window.location.reload()}
            sx={{ textTransform: 'none', borderRadius: 2 }}
            aria-label="Réessayer"
          >
            Réessayer
          </Button>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', bgcolor: colors.background }}>
      <Drawer
        variant="permanent"
        sx={{
          width: SIDEBAR_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: SIDEBAR_WIDTH,
            bgcolor: colors.sidebarBackground,
            color: colors.sidebarText,
            borderRight: 'none',
            boxShadow: colors.shadow,
          },
        }}
      >
        <Slide direction="right" in mountOnEnter timeout={800}>
          <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', p: 2 }}>
            <motion.div variants={logoVariants} initial="initial" animate="animate">
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, pt: 2 }}>
                <Avatar sx={{ bgcolor: colors.secondary, width: 40, height: 40, mr: 2, fontSize: 20 }}>
                  {userName.charAt(0)}
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>MayaShare</Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>Bonjour, {userName}</Typography>
                </Box>
              </Box>
            </motion.div>
            <Divider sx={{ bgcolor: colors.divider, my: 1 }} />
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
                  <ListItem
                    onClick={() => handleNavigation(item.section)}
                    sx={{
                      py: 1.5,
                      borderRadius: 2,
                      bgcolor: activeSection === item.section ? colors.sidebarActive : 'transparent',
                      '&:hover': { bgcolor: colors.sidebarHover },
                      cursor: 'pointer',
                    }}
                    aria-label={item.text}
                  >
                    <ListItemIcon sx={{ minWidth: 40, color: colors.sidebarText }}>{item.icon}</ListItemIcon>
                    <ListItemText
                      primary={item.text}
                      primaryTypographyProps={{ sx: { fontWeight: activeSection === item.section ? 600 : 500, fontSize: '0.95rem' } }}
                    />
                  </ListItem>
                </motion.div>
              ))}
            </List>
            <Box sx={{ mt: 'auto', mb: 2 }}>
              <Divider sx={{ bgcolor: colors.divider, my: 2 }} />
              <motion.div variants={sidebarItemVariants} custom={menuItems.length} initial="initial" animate="animate" whileHover="hover">
                <ListItem
                  onClick={handleLogout}
                  sx={{ py: 1.5, borderRadius: 2, '&:hover': { bgcolor: colors.sidebarHover }, cursor: 'pointer' }}
                  aria-label="Déconnexion"
                >
                  <ListItemIcon sx={{ minWidth: 40, color: colors.sidebarText }}><LogoutIcon /></ListItemIcon>
                  <ListItemText primary="Déconnexion" primaryTypographyProps={{ sx: { fontWeight: 500, fontSize: '0.95rem' } }} />
                </ListItem>
              </motion.div>
            </Box>
          </Box>
        </Slide>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, height: '100%', overflow: 'auto', p: { xs: 2, md: 3 } }}>
        <Paper
          component={motion.div}
          key={activeSection}
          variants={contentVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          sx={{ height: '100%', borderRadius: 2, boxShadow: colors.shadow, p: { xs: 2, md: 3 } }}
        >
          {activeSection === 'Accueil' && (
            <Box>
              <Typography variant="h5" sx={{ mb: 3, fontWeight: 600, color: colors.text }}>
                Bienvenue, {userName} !
              </Typography>
              {/* User Statistics */}
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 4 }}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    flex: '1 1 auto',
                    minWidth: { xs: '100%', sm: '150px' },
                    borderRadius: 2,
                    border: `1px solid ${colors.divider}`,
                    bgcolor: colors.infoLight,
                  }}
                >
                  <Typography variant="subtitle2" sx={{ color: colors.textSecondary, mb: 1 }}>Admins</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: colors.info }}>{userStats.admins}</Typography>
                </Paper>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    flex: '1 1 auto',
                    minWidth: { xs: '100%', sm: '150px' },
                    borderRadius: 2,
                    border: `1px solid ${colors.divider}`,
                    bgcolor: colors.successLight,
                  }}
                >
                  <Typography variant="subtitle2" sx={{ color: colors.textSecondary, mb: 1 }}>Médecins</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: colors.success }}>{userStats.medecins}</Typography>
                </Paper>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    flex: '1 1 auto',
                    minWidth: { xs: '100%', sm: '150px' },
                    borderRadius: 2,
                    border: `1px solid ${colors.divider}`,
                    bgcolor: colors.warningLight,
                  }}
                >
                  <Typography variant="subtitle2" sx={{ color: colors.textSecondary, mb: 1 }}>Infirmiers</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: colors.warning }}>{userStats.infirmiers}</Typography>
                </Paper>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    flex: '1 1 auto',
                    minWidth: { xs: '100%', sm: '150px' },
                    borderRadius: 2,
                    border: `1px solid ${colors.divider}`,
                    bgcolor: colors.errorLight,
                  }}
                >
                  <Typography variant="subtitle2" sx={{ color: colors.textSecondary, mb: 1 }}>Patients</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: colors.error }}>{userStats.patients}</Typography>
                </Paper>
              </Box>
              {/* Calendar */}
              <Box sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: colors.text }}>
                    {selectedDate.toLocaleString('fr-FR', { month: 'long', year: 'numeric' }).charAt(0).toUpperCase() +
                      selectedDate.toLocaleString('fr-FR', { month: 'long', year: 'numeric' }).slice(1)}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <IconButton
                      onClick={() => setSelectedDate(new Date(selectedYear, selectedDate.getMonth() - 1, 1))}
                      sx={{ color: colors.primary }}
                    >
                      <ArrowBackIosNewIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      onClick={() => setSelectedDate(new Date(selectedYear, selectedDate.getMonth() + 1, 1))}
                      sx={{ color: colors.primary }}
                    >
                      <ArrowForwardIosIcon fontSize="small" />
                    </IconButton>
                    <Button
                      variant="outlined"
                      onClick={goToCurrentMonth}
                      sx={{ textTransform: 'none', borderRadius: 2 }}
                      startIcon={<TodayIcon />}
                    >
                      Aujourd'hui
                    </Button>
                    <Select
                      value={selectedYear}
                      onChange={(e) => {
                        setSelectedYear(e.target.value);
                        setSelectedDate(new Date(e.target.value, selectedDate.getMonth(), 1));
                      }}
                      sx={{ minWidth: 100, height: 40 }}
                      size="small"
                    >
                      {Array.from({ length: 2030 - 2020 + 1 }, (_, i) => 2020 + i).map((year) => (
                        <MenuItem key={year} value={year}>{year}</MenuItem>
                      ))}
                    </Select>
                  </Box>
                </Box>
                <Paper sx={{ p: { xs: 1, sm: 2 }, borderRadius: 2, boxShadow: colors.shadow }}>
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1 }}>
                    {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day) => (
                      <Typography
                        key={day}
                        sx={{ fontWeight: 600, textAlign: 'center', color: colors.textSecondary, py: 1 }}
                      >
                        {day}
                      </Typography>
                    ))}
                  </Box>
                  <Divider sx={{ mb: 1 }} />
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1, mt: 1 }}>
                    {weeks.map((week, weekIndex) =>
                      week.map((day, dayIndex) => (
                        <motion.div
                          key={weekIndex * 7 + dayIndex}
                          variants={itemVariants}
                          initial="hidden"
                          animate="visible"
                          whileHover={day ? 'hover' : undefined}
                          sx={{
                            border: `1px solid ${isToday(day) ? colors.primary : colors.divider}`,
                            p: { xs: 0.5, sm: 1 },
                            minHeight: { xs: 80, sm: 100 },
                            bgcolor: isToday(day) ? colors.today : day ? 'white' : '#f5f5f5',
                            borderRadius: 2,
                            cursor: day ? 'pointer' : 'default',
                            position: 'relative',
                            '&:hover': { bgcolor: day ? colors.hover : '#f5f5f5' },
                          }}
                        >
                          {day && (
                            <>
                              <Typography
                                sx={{
                                  fontWeight: isToday(day) ? 700 : 500,
                                  color: isToday(day) ? colors.primary : colors.text,
                                  mb: 1,
                                  fontSize: { xs: '0.875rem', sm: '1rem' },
                                }}
                              >
                                {day.day}
                              </Typography>
                              {day.events.length > 0 && (
                                <Badge
                                  badgeContent={day.events.length}
                                  color="primary"
                                  sx={{ position: 'absolute', top: 2, right: 2, display: { xs: 'flex', sm: 'none' } }}
                                />
                              )}
                              <Box sx={{ display: { xs: 'none', sm: 'block' }, maxHeight: 60, overflow: 'hidden' }}>
                                {day.events.slice(0, 2).map((event, eventIndex) => (
                                  <Chip
                                    key={eventIndex}
                                    label={event.title}
                                    sx={{
                                      mt: 0.5,
                                      bgcolor: event.role === 'Admin' ? colors.info :
                                        event.role === 'Médecin' ? colors.success :
                                        event.role === 'Infirmier' ? colors.warning : colors.error,
                                      color: 'white',
                                      fontSize: '0.7rem',
                                      height: 'auto',
                                      py: 0.5,
                                      width: '100%',
                                    }}
                                  />
                                ))}
                                {day.events.length > 2 && (
                                  <Typography variant="caption" sx={{ mt: 0.5, color: colors.primary }}>
                                    +{day.events.length - 2} autres
                                  </Typography>
                                )}
                              </Box>
                            </>
                          )}
                        </motion.div>
                      ))
                    )}
                  </Box>
                </Paper>
              </Box>
            </Box>
          )}
          {activeSection === 'Gérer les utilisateurs' && <AdminManageUsers />}
          {activeSection === 'Gérer les hôpitaux' && <AdminGererHopital />}
          {activeSection === 'Paramètres' && (
            <Box sx={{ textAlign: 'center', py: 10 }}>
              <Typography variant="h6" color={colors.text}>Section Paramètres en développement</Typography>
            </Box>
          )}
        </Paper>
      </Box>
    </Box>
  );
}

export default AdminDashboard;