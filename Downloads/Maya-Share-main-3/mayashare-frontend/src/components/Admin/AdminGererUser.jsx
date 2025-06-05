// /* eslint-disable react/jsx-no-duplicate-props */
// import React, { useState, useEffect } from 'react';
// import {
//   Box,
//   Typography,
//   Button,
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   Paper,
//   TextField,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   IconButton,
//   CircularProgress,
//   MenuItem,
//   Pagination,
//   useTheme,
//   useMediaQuery,
// } from '@mui/material';
// import { motion } from 'framer-motion';
// import { toast } from 'react-toastify';
// import EditIcon from '@mui/icons-material/Edit';
// import DeleteIcon from '@mui/icons-material/Delete';
// import RefreshIcon from '@mui/icons-material/Refresh';
// import {
//   createUser,
//   getUsers,
//   updateUser,
//   deleteUser,
// } from '../../services/api';

// // Animation variants
// const containerVariants = {
//   initial: { opacity: 0, y: 20 },
//   animate: {
//     opacity: 1,
//     y: 0,
//     transition: {
//       duration: 0.6,
//       ease: [0.16, 1, 0.3, 1],
//     },
//   },
// };

// const rowVariants = {
//   initial: { opacity: 0, y: 10 },
//   animate: {
//     opacity: 1,
//     y: 0,
//     transition: {
//       duration: 0.3,
//       ease: [0.16, 1, 0.3, 1],
//     },
//   },
//   hover: {
//     backgroundColor: 'rgba(59, 130, 246, 0.1)',
//     transition: { duration: 0.2 },
//   },
// };

// const buttonVariants = {
//   hover: {
//     scale: 1.05,
//     boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
//     transition: { duration: 0.2 },
//   },
// };

// const dialogVariants = {
//   initial: { opacity: 0, scale: 0.95 },
//   animate: {
//     opacity: 1,
//     scale: 1,
//     transition: {
//       duration: 0.4,
//       ease: [0.16, 1, 0.3, 1],
//     },
//   },
//   exit: {
//     opacity: 0,
//     scale: 0.95,
//     transition: { duration: 0.3 },
//   },
// };

// function AdminGererUser() {
//   const theme = useTheme();
//   const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
//   const [users, setUsers] = useState([]);
//   const [total, setTotal] = useState(0);
//   const [loading, setLoading] = useState(false);
//   const [isDataLoaded, setIsDataLoaded] = useState(false);
//   const [openAddDialog, setOpenAddDialog] = useState(false);
//   const [openEditDialog, setOpenEditDialog] = useState(false);
//   const [formData, setFormData] = useState({
//     nom: '',
//     prenom: '',
//     role: '',
//     motDePasse: '',
//     email: '',
//     telephone: '',
//     idHopital: '',
//     sexe: '',
//     dateNaissance: '',
//   });
//   const [editId, setEditId] = useState(null);
//   const [errors, setErrors] = useState({});
//   const [filters, setFilters] = useState({
//     role: '',
//     nom: '',
//     prenom: '',
//     email: '',
//     telephone: '',
//     limit: 10,
//     page: 1,
//   });

//   // Charger les utilisateurs
//   const handleRefresh = async () => {
//     setLoading(true);
//     try {
//       const response = await getUsers({
//         ...filters,
//         offset: (filters.page - 1) * filters.limit,
//       });
//       setUsers(response.data.users);
//       setTotal(response.data.total);
//       setIsDataLoaded(true);
//       toast.success('Liste des utilisateurs chargée avec succès.');
//     } catch (err) {
//       console.error('Erreur lors de la récupération des utilisateurs :', err);
//       toast.error('Erreur lors de la récupération des utilisateurs.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (isDataLoaded) {
//       handleRefresh();
//     }
//   }, [filters.page, filters.limit]);

//   // Gestion des changements dans les filtres
//   const handleFilterChange = (e) => {
//     setFilters({
//       ...filters,
//       [e.target.name]: e.target.value,
//       page: 1,
//     });
//   };

//   // Gestion des changements dans le formulaire
//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//     setErrors((prev) => ({ ...prev, [name]: '' }));
//   };

//   // Validation du formulaire
//   const validateForm = () => {
//     const newErrors = {};
//     if (!formData.nom || formData.nom.trim() === '') {
//       newErrors.nom = 'Le nom est requis.';
//     }
//     if (!formData.email || formData.email.trim() === '') {
//       newErrors.email = "L'email est requis.";
//     } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
//       newErrors.email = 'Veuillez entrer un email valide.';
//     }
//     if (
//       !editId &&
//       (!formData.motDePasse || formData.motDePasse.trim() === '')
//     ) {
//       newErrors.motDePasse = 'Le mot de passe est requis.';
//     }
//     if (formData.sexe && !['H', 'F'].includes(formData.sexe)) {
//       newErrors.sexe = "Le sexe doit être 'H' ou 'F'.";
//     }
//     if (formData.dateNaissance) {
//       const birthDate = new Date(formData.dateNaissance);
//       const today = new Date();
//       if (birthDate > today) {
//         newErrors.dateNaissance =
//           'La date de naissance ne peut pas être dans le futur.';
//       }
//     }
//     if (
//       (formData.role === 'Médecin' || formData.role === 'Infirmier') &&
//       !formData.idHopital
//     ) {
//       newErrors.idHopital = "L'ID de l'hôpital est requis pour ce rôle.";
//     }

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   // Ajouter un utilisateur
//   const handleAddUser = async () => {
//     if (!validateForm()) return;
//     try {
//       await createUser({
//         ...formData,
//         dateNaissance: formData.dateNaissance || null,
//       });
//       toast.success('Utilisateur ajouté avec succès.');
//       handleCloseAddDialog();
//       handleRefresh();
//     } catch (err) {
//       console.error("Erreur lors de l'ajout de l'utilisateur :", err);
//       toast.error(
//         err.response?.data?.message ||
//           "Erreur lors de l'ajout de l'utilisateur."
//       );
//     }
//   };

//   // Ouvrir le formulaire de modification
//   const handleEditUser = (user) => {
//     setEditId(user.idUtilisateur);
//     setFormData({
//       nom: user.nom,
//       prenom: user.prenom || '',
//       role: user.role || '',
//       motDePasse: '',
//       email: user.email,
//       telephone: user.telephone || '',
//       idHopital: user.idHopital || '',
//       sexe: user.sexe || '',
//       dateNaissance: user.dateNaissance ? user.dateNaissance.split('T')[0] : '',
//     });
//     setOpenEditDialog(true);
//   };

//   // Mettre à jour un utilisateur
//   const handleUpdateUser = async () => {
//     if (!validateForm()) return;
//     try {
//       await updateUser(editId, {
//         ...formData,
//         dateNaissance: formData.dateNaissance || null,
//       });
//       toast.success('Utilisateur mis à jour avec succès.');
//       handleCloseEditDialog();
//       handleRefresh();
//     } catch (err) {
//       console.error("Erreur lors de la mise à jour de l'utilisateur :", err);
//       toast.error(
//         err.response?.data?.message ||
//           "Erreur lors de la mise à jour de l'utilisateur."
//       );
//     }
//   };

//   // Supprimer un utilisateur
//   const handleDeleteUser = async (id) => {
//     if (!window.confirm('Voulez-vous vraiment supprimer cet utilisateur ?'))
//       return;
//     try {
//       await deleteUser(id);
//       toast.success('Utilisateur supprimé avec succès.');
//       handleRefresh();
//     } catch (err) {
//       console.error("Erreur lors de la suppression de l'utilisateur :", err);
//       toast.error(
//         err.response?.data?.message ||
//           "Erreur lors de la suppression de l'utilisateur."
//       );
//     }
//   };

//   // Gestion de l'ouverture/fermeture des dialogues
//   const handleOpenAddDialog = () => {
//     setFormData({
//       nom: '',
//       prenom: '',
//       role: '',
//       motDePasse: '',
//       email: '',
//       telephone: '',
//       idHopital: '',
//       sexe: '',
//       dateNaissance: '',
//     });
//     setErrors({});
//     setOpenAddDialog(true);
//   };

//   const handleCloseAddDialog = () => {
//     setOpenAddDialog(false);
//     setErrors({});
//   };

//   const handleCloseEditDialog = () => {
//     setOpenEditDialog(false);
//     setFormData({
//       nom: '',
//       prenom: '',
//       role: '',
//       motDePasse: '',
//       email: '',
//       telephone: '',
//       idHopital: '',
//       sexe: '',
//       dateNaissance: '',
//     });
//     setEditId(null);
//     setErrors({});
//   };

//   return (
//     <Box
//       sx={{
//         p: isMobile ? 2 : 3,
//         background: '#FFFFFF',
//         borderRadius: 3,
//         boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
//         minHeight: '100%',
//       }}
//     >
//       <motion.div
//         variants={containerVariants}
//         initial="initial"
//         animate="animate"
//       >
//         {/* Titre et description */}
//         <Typography
//           variant="h4"
//           gutterBottom
//           sx={{
//             fontWeight: 600,
//             color: '#1E3A8A',
//             fontFamily: 'Inter, Roboto, sans-serif',
//             fontSize: isMobile ? '1.5rem' : '2rem',
//           }}
//         >
//           Gérer les utilisateurs
//         </Typography>
//         <Typography
//           variant="body1"
//           gutterBottom
//           sx={{
//             color: 'textSecondary',
//             fontFamily: 'Inter, Roboto, sans-serif',
//             mb: 3,
//           }}
//         >
//           Ici, vous pouvez ajouter, modifier ou supprimer des utilisateurs.
//           Cliquez sur "Rafraîchir" pour charger la liste.
//         </Typography>

//         {/* Boutons et filtres */}
//         <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
//           <motion.div variants={buttonVariants} whileHover="hover">
//             <Button
//               variant="contained"
//               sx={{
//                 background: 'linear-gradient(195deg, #1E3A8A, #3B82F6)',
//                 color: '#FFFFFF',
//                 fontFamily: 'Inter, Roboto, sans-serif',
//                 px: isMobile ? 2 : 3,
//                 py: 1.2,
//                 borderRadius: 2,
//                 '&:hover': {
//                   background: 'linear-gradient(195deg, #2563EB, #60A5FA)',
//                 },
//               }}
//               onClick={handleOpenAddDialog}
//             >
//               Ajouter un utilisateur
//             </Button>
//           </motion.div>
//           <motion.div variants={buttonVariants} whileHover="hover">
//             <Button
//               variant="contained"
//               sx={{
//                 background: 'linear-gradient(195deg, #10B981, #34D399)',
//                 color: '#FFFFFF',
//                 fontFamily: 'Inter, Roboto, sans-serif',
//                 px: isMobile ? 2 : 3,
//                 py: 1.2,
//                 borderRadius: 2,
//                 '&:hover': {
//                   background: 'linear-gradient(195deg, #059669, #10B981)',
//                 },
//               }}
//               onClick={handleRefresh}
//               startIcon={<RefreshIcon />}
//               aria-label="Rafraîchir la liste des utilisateurs"
//             >
//               Rafraîchir
//             </Button>
//           </motion.div>

//           {/* Filtres */}
//           <TextField
//             select
//             label="Rôle"
//             name="role"
//             value={filters.role}
//             onChange={handleFilterChange}
//             sx={{ minWidth: isMobile ? '100%' : 150 }}
//           >
//             <MenuItem value="">Tous les rôles</MenuItem>
//             <MenuItem value="Médecin">Médecin</MenuItem>
//             <MenuItem value="Infirmier">Infirmier</MenuItem>
//             <MenuItem value="Admin">Admin</MenuItem>
//             <MenuItem value="Patient">Patient</MenuItem>
//           </TextField>

//           <TextField
//             label="Nom"
//             name="nom"
//             value={filters.nom}
//             onChange={handleFilterChange}
//             sx={{ minWidth: isMobile ? '100%' : 150 }}
//           />

//           <TextField
//             label="Prénom"
//             name="prenom"
//             value={filters.prenom}
//             onChange={handleFilterChange}
//             sx={{ minWidth: isMobile ? '100%' : 150 }}
//           />
//         </Box>

//         {/* Contenu principal */}
//         {loading ? (
//           <Box
//             sx={{
//               display: 'flex',
//               justifyContent: 'center',
//               alignItems: 'center',
//               py: 4,
//             }}
//           >
//             <motion.div
//               animate={{ scale: [1, 1.1, 1], opacity: [0.8, 1, 0.8] }}
//               transition={{
//                 duration: 1.5,
//                 repeat: Infinity,
//                 ease: 'easeInOut',
//               }}
//             >
//               <CircularProgress sx={{ color: '#2563EB' }} />
//             </motion.div>
//           </Box>
//         ) : !isDataLoaded ? (
//           <Box
//             sx={{
//               textAlign: 'center',
//               py: 4,
//               fontFamily: 'Inter, Roboto, sans-serif',
//             }}
//             aria-live="polite"
//           >
//             <Typography
//               variant="body1"
//               sx={{
//                 color: 'textSecondary',
//                 fontSize: isMobile ? '0.9rem' : '1rem',
//               }}
//             >
//               Cliquez sur "Rafraîchir" pour charger la liste des utilisateurs.
//             </Typography>
//           </Box>
//         ) : (
//           <>
//             <TableContainer
//               component={Paper}
//               sx={{
//                 background: 'rgba(255, 255, 255, 0.9)',
//                 backdropFilter: 'blur(8px)',
//                 borderRadius: 3,
//                 boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
//                 overflowX: 'auto',
//                 mb: 2,
//               }}
//             >
//               <Table>
//                 <TableHead>
//                   <TableRow>
//                     <TableCell
//                       sx={{
//                         fontWeight: 600,
//                         color: '#1E3A8A',
//                         fontFamily: 'Inter, Roboto, sans-serif',
//                         fontSize: isMobile ? '0.85rem' : '0.9rem',
//                       }}
//                     >
//                       Nom
//                     </TableCell>
//                     <TableCell
//                       sx={{
//                         fontWeight: 600,
//                         color: '#1E3A8A',
//                         fontFamily: 'Inter, Roboto, sans-serif',
//                         fontSize: isMobile ? '0.85rem' : '0.9rem',
//                       }}
//                     >
//                       Prénom
//                     </TableCell>
//                     <TableCell
//                       sx={{
//                         fontWeight: 600,
//                         color: '#1E3A8A',
//                         fontFamily: 'Inter, Roboto, sans-serif',
//                         fontSize: isMobile ? '0.85rem' : '0.9rem',
//                       }}
//                     >
//                       Rôle
//                     </TableCell>
//                     <TableCell
//                       sx={{
//                         fontWeight: 600,
//                         color: '#1E3A8A',
//                         fontFamily: 'Inter, Roboto, sans-serif',
//                         fontSize: isMobile ? '0.85rem' : '0.9rem',
//                       }}
//                     >
//                       Email
//                     </TableCell>
//                     <TableCell
//                       sx={{
//                         fontWeight: 600,
//                         color: '#1E3A8A',
//                         fontFamily: 'Inter, Roboto, sans-serif',
//                         fontSize: isMobile ? '0.85rem' : '0.9rem',
//                       }}
//                     >
//                       Téléphone
//                     </TableCell>
//                     <TableCell
//                       sx={{
//                         fontWeight: 600,
//                         color: '#1E3A8A',
//                         fontFamily: 'Inter, Roboto, sans-serif',
//                         fontSize: isMobile ? '0.85rem' : '0.9rem',
//                       }}
//                     >
//                       Sexe
//                     </TableCell>
//                     <TableCell
//                       sx={{
//                         fontWeight: 600,
//                         color: '#1E3A8A',
//                         fontFamily: 'Inter, Roboto, sans-serif',
//                         fontSize: isMobile ? '0.85rem' : '0.9rem',
//                       }}
//                     >
//                       Date de Naissance
//                     </TableCell>
//                     <TableCell
//                       sx={{
//                         fontWeight: 600,
//                         color: '#1E3A8A',
//                         fontFamily: 'Inter, Roboto, sans-serif',
//                         fontSize: isMobile ? '0.85rem' : '0.9rem',
//                       }}
//                     >
//                       Hôpital
//                     </TableCell>
//                     <TableCell
//                       align="right"
//                       sx={{
//                         fontWeight: 600,
//                         color: '#1E3A8A',
//                         fontFamily: 'Inter, Roboto, sans-serif',
//                         fontSize: isMobile ? '0.85rem' : '0.9rem',
//                       }}
//                     >
//                       Actions
//                     </TableCell>
//                   </TableRow>
//                 </TableHead>
//                 <TableBody>
//                   {users.length === 0 ? (
//                     <TableRow>
//                       <TableCell
//                         colSpan={9}
//                         align="center"
//                         sx={{ fontFamily: 'Inter, Roboto, sans-serif', py: 4 }}
//                         aria-live="polite"
//                       >
//                         Aucun utilisateur trouvé.
//                       </TableCell>
//                     </TableRow>
//                   ) : (
//                     users.map((user) => (
//                       <motion.tr
//                         key={user.idUtilisateur}
//                         variants={rowVariants}
//                         initial="initial"
//                         animate="animate"
//                         whileHover="hover"
//                         style={{ cursor: 'pointer' }}
//                       >
//                         <TableCell
//                           sx={{
//                             fontFamily: 'Inter, Roboto, sans-serif',
//                             fontSize: isMobile ? '0.8rem' : '0.9rem',
//                           }}
//                         >
//                           {user.nom}
//                         </TableCell>
//                         <TableCell
//                           sx={{
//                             fontFamily: 'Inter, Roboto, sans-serif',
//                             fontSize: isMobile ? '0.8rem' : '0.9rem',
//                           }}
//                         >
//                           {user.prenom || '-'}
//                         </TableCell>
//                         <TableCell
//                           sx={{
//                             fontFamily: 'Inter, Roboto, sans-serif',
//                             fontSize: isMobile ? '0.8rem' : '0.9rem',
//                           }}
//                         >
//                           {user.role || '-'}
//                         </TableCell>
//                         <TableCell
//                           sx={{
//                             fontFamily: 'Inter, Roboto, sans-serif',
//                             fontSize: isMobile ? '0.8rem' : '0.9rem',
//                           }}
//                         >
//                           {user.email}
//                         </TableCell>
//                         <TableCell
//                           sx={{
//                             fontFamily: 'Inter, Roboto, sans-serif',
//                             fontSize: isMobile ? '0.8rem' : '0.9rem',
//                           }}
//                         >
//                           {user.telephone || '-'}
//                         </TableCell>
//                         <TableCell
//                           sx={{
//                             fontFamily: 'Inter, Roboto, sans-serif',
//                             fontSize: isMobile ? '0.8rem' : '0.9rem',
//                           }}
//                         >
//                           {user.sexe || '-'}
//                         </TableCell>
//                         <TableCell
//                           sx={{
//                             fontFamily: 'Inter, Roboto, sans-serif',
//                             fontSize: isMobile ? '0.8rem' : '0.9rem',
//                           }}
//                         >
//                           {user.dateNaissance
//                             ? new Date(user.dateNaissance).toLocaleDateString(
//                                 'fr-FR'
//                               )
//                             : '-'}
//                         </TableCell>
//                         <TableCell
//                           sx={{
//                             fontFamily: 'Inter, Roboto, sans-serif',
//                             fontSize: isMobile ? '0.8rem' : '0.9rem',
//                           }}
//                         >
//                           {user.idHopital || '-'}
//                         </TableCell>
//                         <TableCell align="right">
//                           <motion.div
//                             whileHover={{ scale: 1.2, rotate: 10 }}
//                             transition={{ duration: 0.2 }}
//                           >
//                             <IconButton
//                               color="primary"
//                               onClick={() => handleEditUser(user)}
//                               aria-label={`Modifier l'utilisateur ${user.nom}`}
//                             >
//                               <EditIcon />
//                             </IconButton>
//                           </motion.div>
//                           <motion.div
//                             whileHover={{ scale: 1.2, rotate: -10 }}
//                             transition={{ duration: 0.2 }}
//                           >
//                             <IconButton
//                               color="error"
//                               onClick={() =>
//                                 handleDeleteUser(user.idUtilisateur)
//                               }
//                               aria-label={`Supprimer l'utilisateur ${user.nom}`}
//                             >
//                               <DeleteIcon />
//                             </IconButton>
//                           </motion.div>
//                         </TableCell>
//                       </motion.tr>
//                     ))
//                   )}
//                 </TableBody>
//               </Table>
//             </TableContainer>

//             {/* Pagination */}
//             <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
//               <Pagination
//                 count={Math.ceil(total / filters.limit)}
//                 page={filters.page}
//                 onChange={(event, value) =>
//                   setFilters({ ...filters, page: value })
//                 }
//                 color="primary"
//                 shape="rounded"
//                 sx={{
//                   '& .MuiPaginationItem-root': {
//                     fontFamily: 'Inter, Roboto, sans-serif',
//                   },
//                 }}
//               />
//             </Box>
//           </>
//         )}
//       </motion.div>

//       {/* Dialogue pour ajouter un utilisateur */}
//       <Dialog open={openAddDialog} onClose={handleCloseAddDialog}>
//         <motion.div
//           variants={dialogVariants}
//           initial="initial"
//           animate="animate"
//           exit="exit"
//         >
//           <DialogTitle
//             sx={{
//               fontWeight: 600,
//               color: '#1E3A8A',
//               fontFamily: 'Inter, Roboto, sans-serif',
//               background: 'rgba(255, 255, 255, 0.9)',
//               backdropFilter: 'blur(8px)',
//             }}
//           >
//             Ajouter un utilisateur
//           </DialogTitle>
//           <DialogContent
//             sx={{
//               background: 'rgba(255, 255, 255, 0.9)',
//               backdropFilter: 'blur(8px)',
//               fontFamily: 'Inter, Roboto, sans-serif',
//               pt: 2,
//             }}
//           >
//             <TextField
//               label="Nom"
//               name="nom"
//               value={formData.nom}
//               onChange={handleChange}
//               fullWidth
//               margin="normal"
//               error={!!errors.nom}
//               helperText={errors.nom}
//               aria-required="true"
//               sx={{ fontFamily: 'Inter, Roboto, sans-serif' }}
//             />
//             <TextField
//               label="Prénom"
//               name="prenom"
//               value={formData.prenom}
//               onChange={handleChange}
//               fullWidth
//               margin="normal"
//               sx={{ fontFamily: 'Inter, Roboto, sans-serif' }}
//             />
//             <TextField
//               select
//               label="Rôle"
//               name="role"
//               value={formData.role}
//               onChange={handleChange}
//               fullWidth
//               margin="normal"
//               sx={{ fontFamily: 'Inter, Roboto, sans-serif' }}
//             >
//               <MenuItem value="Médecin">Médecin</MenuItem>
//               <MenuItem value="Infirmier">Infirmier</MenuItem>
//               <MenuItem value="Admin">Admin</MenuItem>
//               <MenuItem value="Patient">Patient</MenuItem>
//             </TextField>
//             <TextField
//               label="Mot de passe"
//               name="motDePasse"
//               type="password"
//               value={formData.motDePasse}
//               onChange={handleChange}
//               fullWidth
//               margin="normal"
//               error={!!errors.motDePasse}
//               helperText={errors.motDePasse}
//               aria-required="true"
//               sx={{ fontFamily: 'Inter, Roboto, sans-serif' }}
//             />
//             <TextField
//               label="Email"
//               name="email"
//               type="email"
//               value={formData.email}
//               onChange={handleChange}
//               fullWidth
//               margin="normal"
//               error={!!errors.email}
//               helperText={errors.email}
//               aria-required="true"
//               sx={{ fontFamily: 'Inter, Roboto, sans-serif' }}
//             />
//             <TextField
//               label="Téléphone"
//               name="telephone"
//               value={formData.telephone}
//               onChange={handleChange}
//               fullWidth
//               margin="normal"
//               sx={{ fontFamily: 'Inter, Roboto, sans-serif' }}
//             />
//             <TextField
//               select
//               label="Sexe"
//               name="sexe"
//               value={formData.sexe}
//               onChange={handleChange}
//               fullWidth
//               margin="normal"
//               error={!!errors.sexe}
//               helperText={errors.sexe}
//               sx={{ fontFamily: 'Inter, Roboto, sans-serif' }}
//             >
//               <MenuItem value="H">Homme</MenuItem>
//               <MenuItem value="F">Femme</MenuItem>
//             </TextField>
//             <TextField
//               label="Date de Naissance"
//               name="dateNaissance"
//               type="date"
//               value={formData.dateNaissance}
//               onChange={handleChange}
//               fullWidth
//               margin="normal"
//               error={!!errors.dateNaissance}
//               helperText={errors.dateNaissance}
//               InputLabelProps={{ shrink: true }}
//               sx={{ fontFamily: 'Inter, Roboto, sans-serif' }}
//             />
//             <TextField
//               label="ID Hôpital"
//               name="idHopital"
//               value={formData.idHopital}
//               onChange={handleChange}
//               fullWidth
//               margin="normal"
//               error={!!errors.idHopital}
//               helperText={errors.idHopital}
//               disabled={
//                 formData.role !== 'Médecin' && formData.role !== 'Infirmier'
//               }
//               sx={{ fontFamily: 'Inter, Roboto, sans-serif' }}
//             />
//           </DialogContent>
//           <DialogActions
//             sx={{
//               background: 'rgba(255, 255, 255, 0.9)',
//               backdropFilter: 'blur(8px)',
//               p: 2,
//             }}
//           >
//             <motion.div variants={buttonVariants} whileHover="hover">
//               <Button
//                 onClick={handleCloseAddDialog}
//                 sx={{
//                   fontFamily: 'Inter, Roboto, sans-serif',
//                   color: '#1E3A8A',
//                 }}
//               >
//                 Annuler
//               </Button>
//             </motion.div>
//             <motion.div variants={buttonVariants} whileHover="hover">
//               <Button
//                 onClick={handleAddUser}
//                 variant="contained"
//                 sx={{
//                   background: 'linear-gradient(195deg, #1E3A8A, #3B82F6)',
//                   color: '#FFFFFF',
//                   fontFamily: 'Inter, Roboto, sans-serif',
//                   '&:hover': {
//                     background: 'linear-gradient(195deg, #2563EB, #60A5FA)',
//                   },
//                 }}
//               >
//                 Ajouter
//               </Button>
//             </motion.div>
//           </DialogActions>
//         </motion.div>
//       </Dialog>

//       {/* Dialogue pour modifier un utilisateur */}
//       <Dialog open={openEditDialog} onClose={handleCloseEditDialog}>
//         <motion.div
//           variants={dialogVariants}
//           initial="initial"
//           animate="animate"
//           exit="exit"
//         >
//           <DialogTitle
//             sx={{
//               fontWeight: 600,
//               color: '#1E3A8A',
//               fontFamily: 'Inter, Roboto, sans-serif',
//               background: 'rgba(255, 255, 255, 0.9)',
//               backdropFilter: 'blur(8px)',
//             }}
//           >
//             Modifier un utilisateur
//           </DialogTitle>
//           <DialogContent
//             sx={{
//               background: 'rgba(255, 255, 255, 0.9)',
//               backdropFilter: 'blur(8px)',
//               fontFamily: 'Inter, Roboto, sans-serif',
//               pt: 2,
//             }}
//           >
//             <TextField
//               label="Nom"
//               name="nom"
//               value={formData.nom}
//               onChange={handleChange}
//               fullWidth
//               margin="normal"
//               error={!!errors.nom}
//               helperText={errors.nom}
//               aria-required="true"
//               sx={{ fontFamily: 'Inter, Roboto, sans-serif' }}
//             />
//             <TextField
//               label="Prénom"
//               name="prenom"
//               value={formData.prenom}
//               onChange={handleChange}
//               fullWidth
//               margin="normal"
//               sx={{ fontFamily: 'Inter, Roboto, sans-serif' }}
//             />
//             <TextField
//               select
//               label="Rôle"
//               name="role"
//               value={formData.role}
//               onChange={handleChange}
//               fullWidth
//               margin="normal"
//               sx={{ fontFamily: 'Inter, Roboto, sans-serif' }}
//             >
//               <MenuItem value="Médecin">Médecin</MenuItem>
//               <MenuItem value="Infirmier">Infirmier</MenuItem>
//               <MenuItem value="Admin">Admin</MenuItem>
//               <MenuItem value="Patient">Patient</MenuItem>
//             </TextField>
//             <TextField
//               label="Mot de passe (facultatif)"
//               name="motDePasse"
//               type="password"
//               value={formData.motDePasse}
//               onChange={handleChange}
//               fullWidth
//               margin="normal"
//               helperText="Laisser vide pour ne pas modifier"
//               sx={{ fontFamily: 'Inter, Roboto, sans-serif' }}
//             />
//             <TextField
//               label="Email"
//               name="email"
//               type="email"
//               value={formData.email}
//               onChange={handleChange}
//               fullWidth
//               margin="normal"
//               error={!!errors.email}
//               helperText={errors.email}
//               aria-required="true"
//               sx={{ fontFamily: 'Inter, Roboto, sans-serif' }}
//             />
//             <TextField
//               label="Téléphone"
//               name="telephone"
//               value={formData.telephone}
//               onChange={handleChange}
//               fullWidth
//               margin="normal"
//               sx={{ fontFamily: 'Inter, Roboto, sans-serif' }}
//             />
//             <TextField
//               select
//               label="Sexe"
//               name="sexe"
//               value={formData.sexe}
//               onChange={handleChange}
//               fullWidth
//               margin="normal"
//               error={!!errors.sexe}
//               helperText={errors.sexe}
//               sx={{ fontFamily: 'Inter, Roboto, sans-serif' }}
//             >
//               <MenuItem value="H">Homme</MenuItem>
//               <MenuItem value="F">Femme</MenuItem>
//             </TextField>
//             <TextField
//               label="Date de Naissance"
//               name="dateNaissance"
//               type="date"
//               value={formData.dateNaissance}
//               onChange={handleChange}
//               fullWidth
//               margin="normal"
//               error={!!errors.dateNaissance}
//               helperText={errors.dateNaissance}
//               InputLabelProps={{ shrink: true }}
//               sx={{ fontFamily: 'Inter, Roboto, sans-serif' }}
//             />
//             <TextField
//               label="ID Hôpital"
//               name="idHopital"
//               value={formData.idHopital}
//               onChange={handleChange}
//               fullWidth
//               margin="normal"
//               error={!!errors.idHopital}
//               helperText={errors.idHopital}
//               disabled={
//                 formData.role !== 'Médecin' && formData.role !== 'Infirmier'
//               }
//               sx={{ fontFamily: 'Inter, Roboto, sans-serif' }}
//             />
//           </DialogContent>
//           <DialogActions
//             sx={{
//               background: 'rgba(255, 255, 255, 0.9)',
//               backdropFilter: 'blur(8px)',
//               p: 2,
//             }}
//           >
//             <motion.div variants={buttonVariants} whileHover="hover">
//               <Button
//                 onClick={handleCloseEditDialog}
//                 sx={{
//                   fontFamily: 'Inter, Roboto, sans-serif',
//                   color: '#1E3A8A',
//                 }}
//               >
//                 Annuler
//               </Button>
//             </motion.div>
//             <motion.div variants={buttonVariants} whileHover="hover">
//               <Button
//                 onClick={handleUpdateUser}
//                 variant="contained"
//                 sx={{
//                   background: 'linear-gradient(195deg, #1E3A8A, #3B82F6)',
//                   color: '#FFFFFF',
//                   fontFamily: 'Inter, Roboto, sans-serif',
//                   '&:hover': {
//                     background: 'linear-gradient(195deg, #2563EB, #60A5FA)',
//                   },
//                 }}
//               >
//                 Mettre à jour
//               </Button>
//             </motion.div>
//           </DialogActions>
//         </motion.div>
//       </Dialog>
//     </Box>
//   );
// }

// export default AdminGererUser;

/* eslint-disable react/jsx-no-duplicate-props */
// import React, { useState, useEffect } from 'react';
// import {
//   Box,
//   Typography,
//   Button,
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   Paper,
//   TextField,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogContentText,
//   DialogActions,
//   Card,
//   CardContent,
//   Skeleton,
//   Avatar,
//   useTheme,
//   useMediaQuery,
//   MenuItem,
//   Pagination,
// } from '@mui/material';
// import { motion, AnimatePresence } from 'framer-motion';
// import { toast } from 'react-toastify';
// import EditIcon from '@mui/icons-material/Edit';
// import DeleteIcon from '@mui/icons-material/Delete';
// import RefreshIcon from '@mui/icons-material/Refresh';
// import PersonIcon from '@mui/icons-material/Person';
// import {
//   createUser,
//   getUsers,
//   updateUser,
//   deleteUser,
// } from '../../services/api';

// // Palette de couleurs (identique à AdminGererHopital)
// const colors = {
//   primary: '#0077B6',
//   primaryLight: '#0096C7',
//   secondary: '#00B4D8',
//   secondaryLight: '#48CAE4',
//   background: '#F8F9FA',
//   cardBackground: 'white',
//   text: '#1A202C',
//   textSecondary: '#4A5568',
//   success: '#10B981',
//   error: '#EF4444',
//   warning: '#F59E0B',
//   info: '#3B82F6',
//   divider: 'rgba(0, 0, 0, 0.08)',
//   shadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
//   hover: 'rgba(0, 119, 182, 0.05)',
// };

// // Animation variants (identique à AdminGererHopital)
// const containerVariants = {
//   hidden: { opacity: 0 },
//   visible: {
//     opacity: 1,
//     transition: {
//       duration: 0.5,
//       when: 'beforeChildren',
//       staggerChildren: 0.1,
//     },
//   },
// };

// const itemVariants = {
//   hidden: { opacity: 0, y: 20 },
//   visible: {
//     opacity: 1,
//     y: 0,
//     transition: {
//       duration: 0.4,
//       ease: [0.25, 0.1, 0.25, 1.0],
//     },
//   },
//   hover: {
//     backgroundColor: colors.hover,
//     transition: { duration: 0.2 },
//   },
// };

// const buttonVariants = {
//   hover: { scale: 1.05, transition: { duration: 0.2 } },
//   tap: { scale: 0.95, transition: { duration: 0.1 } },
// };

// const dialogVariants = {
//   hidden: { opacity: 0, scale: 0.95 },
//   visible: {
//     opacity: 1,
//     scale: 1,
//     transition: {
//       duration: 0.4,
//       ease: [0.25, 0.1, 0.25, 1.0],
//     },
//   },
// };

// function AdminGererUser() {
//   const theme = useTheme();
//   const isMobile = useMediaQuery(theme.breakpoints.down('md'));

//   const [users, setUsers] = useState([]);
//   const [filteredUsers, setFilteredUsers] = useState([]);
//   const [total, setTotal] = useState(0);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [openAddDialog, setOpenAddDialog] = useState(false);
//   const [openEditDialog, setOpenEditDialog] = useState(false);
//   const [formData, setFormData] = useState({
//     nom: '',
//     prenom: '',
//     role: '',
//     motDePasse: '',
//     email: '',
//     telephone: '',
//     idHopital: '',
//     sexe: '',
//     dateNaissance: '',
//   });
//   const [editId, setEditId] = useState(null);
//   const [errors, setErrors] = useState({});
//   const [search, setSearch] = useState('');
//   const [filters, setFilters] = useState({
//     role: '',
//     limit: 10,
//     page: 1,
//   });
//   const [refreshing, setRefreshing] = useState(false);

//   // Charger les utilisateurs
//   const fetchData = async () => {
//     try {
//       setLoading(true);
//       setRefreshing(true);
//       const response = await getUsers({
//         ...filters,
//         offset: (filters.page - 1) * filters.limit,
//       });
//       const data = Array.isArray(response.data.users)
//         ? response.data.users
//         : response.data.users || [];
//       setUsers(data);
//       setFilteredUsers(data);
//       setTotal(response.data.total || 0);
//       setError(null);
//       toast.success('Liste des utilisateurs chargée avec succès.');
//     } catch (err) {
//       const errorMessage =
//         err.response?.data?.message || 'Erreur de chargement des utilisateurs';
//       setError(errorMessage);
//       toast.error(errorMessage);
//       setUsers([]);
//       setFilteredUsers([]);
//     } finally {
//       setLoading(false);
//       setTimeout(() => setRefreshing(false), 500);
//     }
//   };

//   // Charger les données au montage
//   useEffect(() => {
//     fetchData();
//   }, [filters.page, filters.limit]);

//   // Filtrer les utilisateurs
//   useEffect(() => {
//     if (search || filters.role) {
//       const lowerCaseSearch = search.toLowerCase();
//       const filtered = users.filter(
//         (user) =>
//           (!filters.role || user.role === filters.role) &&
//           (user.nom.toLowerCase().includes(lowerCaseSearch) ||
//             user.prenom?.toLowerCase().includes(lowerCaseSearch) ||
//             user.email.toLowerCase().includes(lowerCaseSearch) ||
//             user.telephone?.toLowerCase().includes(lowerCaseSearch))
//       );
//       setFilteredUsers(filtered);
//     } else {
//       setFilteredUsers(users);
//     }
//   }, [search, filters.role, users]);

//   // Gestion des changements dans les filtres
//   const handleFilterChange = (e) => {
//     setFilters({
//       ...filters,
//       [e.target.name]: e.target.value,
//       page: 1,
//     });
//   };

//   // Gestion de la recherche
//   const handleSearchChange = (e) => {
//     setSearch(e.target.value);
//   };

//   // Gestion des changements dans le formulaire
//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//     setErrors((prev) => ({ ...prev, [name]: '' }));
//   };

//   // Validation du formulaire
//   const validateForm = () => {
//     const newErrors = {};
//     if (!formData.nom || formData.nom.trim() === '') {
//       newErrors.nom = 'Le nom est requis.';
//     }
//     if (!formData.email || formData.email.trim() === '') {
//       newErrors.email = "L'email est requis.";
//     } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
//       newErrors.email = 'Veuillez entrer un email valide.';
//     }
//     if (!editId && (!formData.motDePasse || formData.motDePasse.trim() === '')) {
//       newErrors.motDePasse = 'Le mot de passe est requis.';
//     }
//     if (formData.sexe && !['H', 'F'].includes(formData.sexe)) {
//       newErrors.sexe = "Le sexe doit être 'H' ou 'F'.";
//     }
//     if (formData.dateNaissance) {
//       const birthDate = new Date(formData.dateNaissance);
//       const today = new Date();
//       if (birthDate > today) {
//         newErrors.dateNaissance =
//           'La date de naissance ne peut pas être dans le futur.';
//       }
//     }
//     if (
//       (formData.role === 'Médecin' || formData.role === 'Infirmier') &&
//       !formData.idHopital
//     ) {
//       newErrors.idHopital = "L'ID de l'hôpital est requis pour ce rôle.";
//     }
//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   // Ajouter un utilisateur
//   const handleAddUser = async () => {
//     if (!validateForm()) return;
//     try {
//       await createUser({
//         ...formData,
//         dateNaissance: formData.dateNaissance || null,
//       });
//       toast.success('Utilisateur ajouté avec succès.');
//       setOpenAddDialog(false);
//       setFormData({
//         nom: '',
//         prenom: '',
//         role: '',
//         motDePasse: '',
//         email: '',
//         telephone: '',
//         idHopital: '',
//         sexe: '',
//         dateNaissance: '',
//       });
//       fetchData();
//     } catch (err) {
//       const errorMessage =
//         err.response?.data?.message || "Erreur lors de l'ajout de l'utilisateur.";
//       toast.error(errorMessage);
//     }
//   };

//   // Ouvrir le formulaire de modification
//   const handleEditUser = (user) => {
//     setEditId(user.idUtilisateur);
//     setFormData({
//       nom: user.nom,
//       prenom: user.prenom || '',
//       role: user.role || '',
//       motDePasse: '',
//       email: user.email,
//       telephone: user.telephone || '',
//       idHopital: user.idHopital || '',
//       sexe: user.sexe || '',
//       dateNaissance: user.dateNaissance ? user.dateNaissance.split('T')[0] : '',
//     });
//     setOpenEditDialog(true);
//   };

//   // Mettre à jour un utilisateur
//   const handleUpdateUser = async () => {
//     if (!validateForm()) return;
//     try {
//       await updateUser(editId, {
//         ...formData,
//         dateNaissance: formData.dateNaissance || null,
//       });
//       toast.success('Utilisateur mis à jour avec succès.');
//       setOpenEditDialog(false);
//       setFormData({
//         nom: '',
//         prenom: '',
//         role: '',
//         motDePasse: '',
//         email: '',
//         telephone: '',
//         idHopital: '',
//         sexe: '',
//         dateNaissance: '',
//       });
//       setEditId(null);
//       fetchData();
//     } catch (err) {
//       const errorMessage =
//         err.response?.data?.message ||
//         "Erreur lors de la mise à jour de l'utilisateur.";
//       toast.error(errorMessage);
//     }
//   };

//   // Supprimer un utilisateur
//   const handleDeleteUser = async (id) => {
//     if (!window.confirm('Voulez-vous vraiment supprimer cet utilisateur ?'))
//       return;
//     try {
//       await deleteUser(id);
//       toast.success('Utilisateur supprimé avec succès.');
//       fetchData();
//     } catch (err) {
//       const errorMessage =
//         err.response?.data?.message ||
//         "Erreur lors de la suppression de l'utilisateur.";
//       toast.error(errorMessage);
//     }
//   };

//   // Vue mobile avec cartes
//   const renderMobileView = () => {
//     if (loading && !refreshing) {
//       return Array.from(new Array(3)).map((_, index) => (
//         <Card
//           key={index}
//           sx={{
//             mb: 2,
//             borderRadius: 2,
//             boxShadow: colors.shadow,
//           }}
//         >
//           <CardContent sx={{ p: 2 }}>
//             <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
//               <Skeleton
//                 variant="circular"
//                 width={40}
//                 height={40}
//                 sx={{ mr: 2 }}
//               />
//               <Box sx={{ width: '100%' }}>
//                 <Skeleton variant="text" width="60%" height={24} />
//                 <Skeleton variant="text" width="40%" height={20} />
//               </Box>
//             </Box>
//             <Skeleton
//               variant="rectangular"
//               width="100%"
//               height={100}
//               sx={{ borderRadius: 1 }}
//             />
//           </CardContent>
//         </Card>
//       ));
//     }

//     return filteredUsers.map((user, index) => (
//       <motion.div
//         key={user.idUtilisateur}
//         variants={itemVariants}
//         initial="hidden"
//         animate="visible"
//         whileHover="hover"
//         custom={index}
//       >
//         <Card
//           sx={{
//             mb: 2,
//             borderRadius: 2,
//             boxShadow: colors.shadow,
//             overflow: 'visible',
//             transition: 'all 0.3s ease',
//             '&:hover': {
//               boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
//             },
//           }}
//         >
//           <CardContent sx={{ p: 2 }}>
//             <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
//               <Avatar
//                 sx={{
//                   bgcolor: colors.primary,
//                   color: 'white',
//                   fontWeight: 'bold',
//                   mr: 2,
//                 }}
//               >
//                 {user.nom ? user.nom.charAt(0) : 'U'}
//               </Avatar>
//               <Box>
//                 <Typography
//                   variant="subtitle1"
//                   sx={{ fontWeight: 600, color: colors.text }}
//                 >
//                   {user.nom} {user.prenom || ''}
//                 </Typography>
//                 <Typography variant="body2" color="text.secondary">
//                   {user.role || '-'}
//                 </Typography>
//               </Box>
//             </Box>

//             <Typography
//               variant="body2"
//               sx={{ mb: 1, color: colors.textSecondary }}
//             >
//               <strong>Email:</strong> {user.email}
//             </Typography>
//             <Typography
//               variant="body2"
//               sx={{ mb: 1, color: colors.textSecondary }}
//             >
//               <strong>Téléphone:</strong> {user.telephone || '-'}
//             </Typography>
//             <Typography
//               variant="body2"
//               sx={{ mb: 1, color: colors.textSecondary }}
//             >
//               <strong>Sexe:</strong> {user.sexe || '-'}
//             </Typography>
//             <Typography
//               variant="body2"
//               sx={{ mb: 2, color: colors.textSecondary }}
//             >
//               <strong>Date de Naissance:</strong>{' '}
//               {user.dateNaissance
//                 ? new Date(user.dateNaissance).toLocaleDateString('fr-FR')
//                 : '-'}
//             </Typography>
//             <Typography
//               variant="body2"
//               sx={{ mb: 2, color: colors.textSecondary }}
//             >
//               <strong>Hôpital:</strong> {user.idHopital || '-'}
//             </Typography>

//             <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
//               <motion.div
//                 variants={buttonVariants}
//                 whileHover="hover"
//                 whileTap="tap"
//               >
//                 <Button
//                   variant="outlined"
//                   color="primary"
//                   size="small"
//                   startIcon={<EditIcon />}
//                   onClick={() => handleEditUser(user)}
//                   sx={{
//                     fontWeight: 500,
//                     borderRadius: 2,
//                     textTransform: 'none',
//                   }}
//                 >
//                   Modifier
//                 </Button>
//               </motion.div>
//               <motion.div
//                 variants={buttonVariants}
//                 whileHover="hover"
//                 whileTap="tap"
//               >
//                 <Button
//                   variant="outlined"
//                   color="error"
//                   size="small"
//                   startIcon={<DeleteIcon />}
//                   onClick={() => handleDeleteUser(user.idUtilisateur)}
//                   sx={{
//                     fontWeight: 500,
//                     borderRadius: 2,
//                     textTransform: 'none',
//                   }}
//                 >
//                   Supprimer
//                 </Button>
//               </motion.div>
//             </Box>
//           </CardContent>
//         </Card>
//       </motion.div>
//     ));
//   };

//   // Vue desktop avec tableau
//   const renderDesktopView = () => {
//     return (
//       <TableContainer
//         component={Paper}
//         sx={{ boxShadow: colors.shadow, borderRadius: 2 }}
//       >
//         <Table>
//           <TableHead>
//             <TableRow sx={{ backgroundColor: 'rgba(0, 119, 182, 0.05)' }}>
//               <TableCell sx={{ fontWeight: 600, color: colors.text }}>
//                 Nom
//               </TableCell>
//               <TableCell sx={{ fontWeight: 600, color: colors.text }}>
//                 Prénom
//               </TableCell>
//               <TableCell sx={{ fontWeight: 600, color: colors.text }}>
//                 Rôle
//               </TableCell>
//               <TableCell sx={{ fontWeight: 600, color: colors.text }}>
//                 Email
//               </TableCell>
//               <TableCell sx={{ fontWeight: 600, color: colors.text }}>
//                 Téléphone
//               </TableCell>
//               <TableCell sx={{ fontWeight: 600, color: colors.text }}>
//                 Sexe
//               </TableCell>
//               <TableCell sx={{ fontWeight: 600, color: colors.text }}>
//                 Date de Naissance
//               </TableCell>
//               <TableCell sx={{ fontWeight: 600, color: colors.text }}>
//                 Hôpital
//               </TableCell>
//               <TableCell sx={{ fontWeight: 600, color: colors.text }}>
//                 Actions
//               </TableCell>
//             </TableRow>
//           </TableHead>
//           <TableBody>
//             {loading && !refreshing ? (
//               Array.from(new Array(5)).map((_, index) => (
//                 <TableRow key={index}>
//                   <TableCell>
//                     <Skeleton variant="text" width={150} />
//                   </TableCell>
//                   <TableCell>
//                     <Skeleton variant="text" width={150} />
//                   </TableCell>
//                   <TableCell>
//                     <Skeleton variant="text" width={100} />
//                   </TableCell>
//                   <TableCell>
//                     <Skeleton variant="text" width={200} />
//                   </TableCell>
//                   <TableCell>
//                     <Skeleton variant="text" width={100} />
//                   </TableCell>
//                   <TableCell>
//                     <Skeleton variant="text" width={50} />
//                   </TableCell>
//                   <TableCell>
//                     <Skeleton variant="text" width={100} />
//                   </TableCell>
//                   <TableCell>
//                     <Skeleton variant="text" width={50} />
//                   </TableCell>
//                   <TableCell>
//                     <Skeleton variant="rectangular" width={200} height={40} />
//                   </TableCell>
//                 </TableRow>
//               ))
//             ) : filteredUsers.length === 0 ? (
//               <TableRow>
//                 <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
//                   <Typography color="text.secondary">
//                     Aucun utilisateur trouvé.
//                   </Typography>
//                 </TableCell>
//               </TableRow>
//             ) : (
//               filteredUsers.map((user) => (
//                 <TableRow
//                   key={user.idUtilisateur}
//                   sx={{
//                     '&:hover': {
//                       backgroundColor: colors.hover,
//                     },
//                     transition: 'background-color 0.3s ease',
//                   }}
//                 >
//                   <TableCell>
//                     <Box sx={{ display: 'flex', alignItems: 'center' }}>
//                       <Avatar
//                         sx={{
//                           width: 32,
//                           height: 32,
//                           mr: 1,
//                           bgcolor: colors.primary,
//                           fontSize: '0.875rem',
//                         }}
//                       >
//                         {user.nom ? user.nom.charAt(0) : 'U'}
//                       </Avatar>
//                       <Typography variant="body2" sx={{ fontWeight: 500 }}>
//                         {user.nom}
//                       </Typography>
//                     </Box>
//                   </TableCell>
//                   <TableCell>{user.prenom || '-'}</TableCell>
//                   <TableCell>{user.role || '-'}</TableCell>
//                   <TableCell>{user.email}</TableCell>
//                   <TableCell>{user.telephone || '-'}</TableCell>
//                   <TableCell>{user.sexe || '-'}</TableCell>
//                   <TableCell>
//                     {user.dateNaissance
//                       ? new Date(user.dateNaissance).toLocaleDateString('fr-FR')
//                       : '-'}
//                   </TableCell>
//                   <TableCell>{user.idHopital || '-'}</TableCell>
//                   <TableCell>
//                     <Box sx={{ display: 'flex', gap: 1 }}>
//                       <motion.div
//                         variants={buttonVariants}
//                         whileHover="hover"
//                         whileTap="tap"
//                       >
//                         <Button
//                           variant="outlined"
//                           color="primary"
//                           size="small"
//                           startIcon={<EditIcon />}
//                           onClick={() => handleEditUser(user)}
//                           sx={{
//                             fontWeight: 500,
//                             borderRadius: 2,
//                             textTransform: 'none',
//                           }}
//                         >
//                           Modifier
//                         </Button>
//                       </motion.div>
//                       <motion.div
//                         variants={buttonVariants}
//                         whileHover="hover"
//                         whileTap="tap"
//                       >
//                         <Button
//                           variant="outlined"
//                           color="error"
//                           size="small"
//                           startIcon={<DeleteIcon />}
//                           onClick={() => handleDeleteUser(user.idUtilisateur)}
//                           sx={{
//                             fontWeight: 500,
//                             borderRadius: 2,
//                             textTransform: 'none',
//                           }}
//                         >
//                           Supprimer
//                         </Button>
//                       </motion.div>
//                     </Box>
//                   </TableCell>
//                 </TableRow>
//               ))
//             )}
//           </TableBody>
//         </Table>
//       </TableContainer>
//     );
//   };

//   return (
//     <Box
//       sx={{
//         p: { xs: 2, md: 4 },
//         bgcolor: colors.background,
//         height: '100%',
//         overflow: 'auto',
//       }}
//     >
//       <motion.div variants={containerVariants} initial="hidden" animate="visible">
//         <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, gap: 2 }}>
//           <motion.div
//             initial={{ scale: 0 }}
//             animate={{ scale: 1 }}
//             transition={{
//               type: 'spring',
//               stiffness: 260,
//               damping: 20,
//             }}
//           >
//             <Avatar sx={{ bgcolor: colors.primary, width: 56, height: 56 }}>
//               <PersonIcon fontSize="large" />
//             </Avatar>
//           </motion.div>
//           <Box>
//             <Typography
//               variant="h4"
//               component="h1"
//               sx={{
//                 fontWeight: 700,
//                 color: colors.text,
//                 fontSize: { xs: '1.5rem', sm: '2rem', md: '2.25rem' },
//               }}
//             >
//               Gestion des utilisateurs
//             </Typography>
//             <Typography
//               variant="body1"
//               color="text.secondary"
//               sx={{ mt: 0.5 }}
//             >
//               {filteredUsers.length} utilisateur
//               {filteredUsers.length !== 1 ? 's' : ''} au total
//             </Typography>
//           </Box>
//           <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
//             <motion.div
//               variants={buttonVariants}
//               whileHover="hover"
//               whileTap="tap"
//             >
//               <Button
//                 variant="contained"
//                 color="primary"
//                 startIcon={<PersonIcon />}
//                 onClick={() => setOpenAddDialog(true)}
//                 sx={{ textTransform: 'none', fontWeight: 500 }}
//               >
//                 Ajouter un utilisateur
//               </Button>
//             </motion.div>
//             <motion.div
//               variants={buttonVariants}
//               whileHover="hover"
//               whileTap="tap"
//             >
//               <Button
//                 variant="contained"
//                 color="primary"
//                 startIcon={<RefreshIcon />}
//                 onClick={fetchData}
//                 disabled={refreshing}
//                 sx={{ textTransform: 'none', fontWeight: 500 }}
//               >
//                 {refreshing ? 'Actualisation...' : 'Actualiser'}
//               </Button>
//             </motion.div>
//           </Box>
//         </Box>

//         <Box
//           sx={{
//             display: 'flex',
//             justifyContent: 'flex-end',
//             alignItems: 'center',
//             mb: 3,
//             flexDirection: { xs: 'column', sm: 'row' },
//             gap: 2,
//           }}
//         >
//           <TextField
//             label="Rechercher un utilisateur"
//             value={search}
//             onChange={handleSearchChange}
//             fullWidth
//             sx={{
//               maxWidth: { xs: '100%', sm: 300 },
//               '& .MuiOutlinedInput-root': {
//                 borderRadius: 2,
//               },
//             }}
//           />
//           <TextField
//             select
//             label="Rôle"
//             name="role"
//             value={filters.role}
//             onChange={handleFilterChange}
//             sx={{
//               maxWidth: { xs: '100%', sm: 150 },
//               '& .MuiOutlinedInput-root': {
//                 borderRadius: 2,
//               },
//             }}
//           >
//             <MenuItem value="">Tous les rôles</MenuItem>
//             <MenuItem value="Médecin">Médecin</MenuItem>
//             <MenuItem value="Infirmier">Infirmier</MenuItem>
//             <MenuItem value="Admin">Admin</MenuItem>
//             <MenuItem value="Patient">Patient</MenuItem>
//           </TextField>
//         </Box>

//         {error && (
//           <Box
//             sx={{
//               mb: 3,
//               p: 2,
//               bgcolor: colors.error,
//               color: 'white',
//               borderRadius: 2,
//               display: 'flex',
//               alignItems: 'center',
//             }}
//           >
//             <Typography>{error}</Typography>
//           </Box>
//         )}

//         <AnimatePresence>
//           {isMobile ? renderMobileView() : renderDesktopView()}
//         </AnimatePresence>

//         <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
//           <Pagination
//             count={Math.ceil(total / filters.limit)}
//             page={filters.page}
//             onChange={(event, value) => setFilters({ ...filters, page: value })}
//             color="primary"
//             shape="rounded"
//             sx={{
//               '& .MuiPaginationItem-root': {
//                 fontFamily: 'Inter, Roboto, sans-serif',
//               },
//             }}
//           />
//         </Box>
//       </motion.div>

//       {/* Dialogue pour ajouter un utilisateur */}
//       <Dialog
//         open={openAddDialog}
//         onClose={() => {
//           setOpenAddDialog(false);
//           setFormData({
//             nom: '',
//             prenom: '',
//             role: '',
//             motDePasse: '',
//             email: '',
//             telephone: '',
//             idHopital: '',
//             sexe: '',
//             dateNaissance: '',
//           });
//           setErrors({});
//         }}
//         PaperProps={{
//           sx: {
//             borderRadius: 2,
//             boxShadow: colors.shadow,
//             maxWidth: 400,
//           },
//         }}
//       >
//         <motion.div variants={dialogVariants} initial="hidden" animate="visible">
//           <DialogTitle sx={{ fontWeight: 600, color: colors.text }}>
//             Ajouter un utilisateur
//           </DialogTitle>
//           <DialogContent>
//             <DialogContentText sx={{ mb: 2, color: colors.textSecondary }}>
//               Remplissez les informations pour ajouter un nouvel utilisateur.
//             </DialogContentText>
//             <TextField
//               label="Nom"
//               name="nom"
//               value={formData.nom}
//               onChange={handleChange}
//               fullWidth
//               margin="normal"
//               error={!!errors.nom}
//               helperText={errors.nom}
//               sx={{ '& .MuiInputBase-root': { borderRadius: 2 } }}
//             />
//             <TextField
//               label="Prénom"
//               name="prenom"
//               value={formData.prenom}
//               onChange={handleChange}
//               fullWidth
//               margin="normal"
//               sx={{ '& .MuiInputBase-root': { borderRadius: 2 } }}
//             />
//             <TextField
//               select
//               label="Rôle"
//               name="role"
//               value={formData.role}
//               onChange={handleChange}
//               fullWidth
//               margin="normal"
//               sx={{ '& .MuiInputBase-root': { borderRadius: 2 } }}
//             >
//               <MenuItem value="Médecin">Médecin</MenuItem>
//               <MenuItem value="Infirmier">Infirmier</MenuItem>
//               <MenuItem value="Admin">Admin</MenuItem>
//               <MenuItem value="Patient">Patient</MenuItem>
//             </TextField>
//             <TextField
//               label="Mot de passe"
//               name="motDePasse"
//               type="password"
//               value={formData.motDePasse}
//               onChange={handleChange}
//               fullWidth
//               margin="normal"
//               error={!!errors.motDePasse}
//               helperText={errors.motDePasse}
//               sx={{ '& .MuiInputBase-root': { borderRadius: 2 } }}
//             />
//             <TextField
//               label="Email"
//               name="email"
//               type="email"
//               value={formData.email}
//               onChange={handleChange}
//               fullWidth
//               margin="normal"
//               error={!!errors.email}
//               helperText={errors.email}
//               sx={{ '& .MuiInputBase-root': { borderRadius: 2 } }}
//             />
//             <TextField
//               label="Téléphone"
//               name="telephone"
//               value={formData.telephone}
//               onChange={handleChange}
//               fullWidth
//               margin="normal"
//               sx={{ '& .MuiInputBase-root': { borderRadius: 2 } }}
//             />
//             <TextField
//               select
//               label="Sexe"
//               name="sexe"
//               value={formData.sexe}
//               onChange={handleChange}
//               fullWidth
//               margin="normal"
//               error={!!errors.sexe}
//               helperText={errors.sexe}
//               sx={{ '& .MuiInputBase-root': { borderRadius: 2 } }}
//             >
//               <MenuItem value="H">Homme</MenuItem>
//               <MenuItem value="F">Femme</MenuItem>
//             </TextField>
//             <TextField
//               label="Date de Naissance"
//               name="dateNaissance"
//               type="date"
//               value={formData.dateNaissance}
//               onChange={handleChange}
//               fullWidth
//               margin="normal"
//               error={!!errors.dateNaissance}
//               helperText={errors.dateNaissance}
//               InputLabelProps={{ shrink: true }}
//               sx={{ '& .MuiInputBase-root': { borderRadius: 2 } }}
//             />
//             <TextField
//               label="ID Hôpital"
//               name="idHopital"
//               value={formData.idHopital}
//               onChange={handleChange}
//               fullWidth
//               margin="normal"
//               error={!!errors.idHopital}
//               helperText={errors.idHopital}
//               disabled={formData.role !== 'Médecin' && formData.role !== 'Infirmier'}
//               sx={{ '& .MuiInputBase-root': { borderRadius: 2 } }}
//             />
//           </DialogContent>
//           <DialogActions sx={{ p: 2 }}>
//             <Button
//               onClick={() => {
//                 setOpenAddDialog(false);
//                 setFormData({
//                   nom: '',
//                   prenom: '',
//                   role: '',
//                   motDePasse: '',
//                   email: '',
//                   telephone: '',
//                   idHopital: '',
//                   sexe: '',
//                   dateNaissance: '',
//                 });
//                 setErrors({});
//               }}
//               sx={{
//                 textTransform: 'none',
//                 fontWeight: 500,
//                 color: colors.textSecondary,
//               }}
//             >
//               Annuler
//             </Button>
//             <motion.div
//               variants={buttonVariants}
//               whileHover="hover"
//               whileTap="tap"
//             >
//               <Button
//                 onClick={handleAddUser}
//                 color="primary"
//                 variant="contained"
//                 sx={{
//                   textTransform: 'none',
//                   fontWeight: 500,
//                   borderRadius: 2,
//                   boxShadow: 'none',
//                 }}
//               >
//                 Ajouter
//               </Button>
//             </motion.div>
//           </DialogActions>
//         </motion.div>
//       </Dialog>

//       {/* Dialogue pour modifier un utilisateur */}
//       <Dialog
//         open={openEditDialog}
//         onClose={() => {
//           setOpenEditDialog(false);
//           setFormData({
//             nom: '',
//             prenom: '',
//             role: '',
//             motDePasse: '',
//             email: '',
//             telephone: '',
//             idHopital: '',
//             sexe: '',
//             dateNaissance: '',
//           });
//           setEditId(null);
//           setErrors({});
//         }}
//         PaperProps={{
//           sx: {
//             borderRadius: 2,
//             boxShadow: colors.shadow,
//             maxWidth: 400,
//           },
//         }}
//       >
//         <motion.div variants={dialogVariants} initial="hidden" animate="visible">
//           <DialogTitle sx={{ fontWeight: 600, color: colors.text }}>
//             Modifier un utilisateur
//           </DialogTitle>
//           <DialogContent>
//             <DialogContentText sx={{ mb: 2, color: colors.textSecondary }}>
//               Modifiez les informations de l’utilisateur.
//             </DialogContentText>
//             <TextField
//               label="Nom"
//               name="nom"
//               value={formData.nom}
//               onChange={handleChange}
//               fullWidth
//               margin="normal"
//               error={!!errors.nom}
//               helperText={errors.nom}
//               sx={{ '& .MuiInputBase-root': { borderRadius: 2 } }}
//             />
//             <TextField
//               label="Prénom"
//               name="prenom"
//               value={formData.prenom}
//               onChange={handleChange}
//               fullWidth
//               margin="normal"
//               sx={{ '& .MuiInputBase-root': { borderRadius: 2 } }}
//             />
//             <TextField
//               select
//               label="Rôle"
//               name="role"
//               value={formData.role}
//               onChange={handleChange}
//               fullWidth
//               margin="normal"
//               sx={{ '& .MuiInputBase-root': { borderRadius: 2 } }}
//             >
//               <MenuItem value="Médecin">Médecin</MenuItem>
//               <MenuItem value="Infirmier">Infirmier</MenuItem>
//               <MenuItem value="Admin">Admin</MenuItem>
//               <MenuItem value="Patient">Patient</MenuItem>
//             </TextField>
//             <TextField
//               label="Mot de passe (facultatif)"
//               name="motDePasse"
//               type="password"
//               value={formData.motDePasse}
//               onChange={handleChange}
//               fullWidth
//               margin="normal"
//               helperText="Laisser vide pour ne pas modifier"
//               sx={{ '& .MuiInputBase-root': { borderRadius: 2 } }}
//             />
//             <TextField
//               label="Email"
//               name="email"
//               type="email"
//               value={formData.email}
//               onChange={handleChange}
//               fullWidth
//               margin="normal"
//               error={!!errors.email}
//               helperText={errors.email}
//               sx={{ '& .MuiInputBase-root': { borderRadius: 2 } }}
//             />
//             <TextField
//               label="Téléphone"
//               name="telephone"
//               value={formData.telephone}
//               onChange={handleChange}
//               fullWidth
//               margin="normal"
//               sx={{ '& .MuiInputBase-root': { borderRadius: 2 } }}
//             />
//             <TextField
//               select
//               label="Sexe"
//               name="sexe"
//               value={formData.sexe}
//               onChange={handleChange}
//               fullWidth
//               margin="normal"
//               error={!!errors.sexe}
//               helperText={errors.sexe}
//               sx={{ '& .MuiInputBase-root': { borderRadius: 2 } }}
//             >
//               <MenuItem value="H">Homme</MenuItem>
//               <MenuItem value="F">Femme</MenuItem>
//             </TextField>
//             <TextField
//               label="Date de Naissance"
//               name="dateNaissance"
//               type="date"
//               value={formData.dateNaissance}
//               onChange={handleChange}
//               fullWidth
//               margin="normal"
//               error={!!errors.dateNaissance}
//               helperText={errors.dateNaissance}
//               InputLabelProps={{ shrink: true }}
//               sx={{ '& .MuiInputBase-root': { borderRadius: 2 } }}
//             />
//             <TextField
//               label="ID Hôpital"
//               name="idHopital"
//               value={formData.idHopital}
//               onChange={handleChange}
//               fullWidth
//               margin="normal"
//               error={!!errors.idHopital}
//               helperText={errors.idHopital}
//               disabled={formData.role !== 'Médecin' && formData.role !== 'Infirmier'}
//               sx={{ '& .MuiInputBase-root': { borderRadius: 2 } }}
//             />
//           </DialogContent>
//           <DialogActions sx={{ p: 2 }}>
//             <Button
//               onClick={() => {
//                 setOpenEditDialog(false);
//                 setFormData({
//                   nom: '',
//                   prenom: '',
//                   role: '',
//                   motDePasse: '',
//                   email: '',
//                   telephone: '',
//                   idHopital: '',
//                   sexe: '',
//                   dateNaissance: '',
//                 });
//                 setEditId(null);
//                 setErrors({});
//               }}
//               sx={{
//                 textTransform: 'none',
//                 fontWeight: 500,
//                 color: colors.textSecondary,
//               }}
//             >
//               Annuler
//             </Button>
//             <motion.div
//               variants={buttonVariants}
//               whileHover="hover"
//               whileTap="tap"
//             >
//               <Button
//                 onClick={handleUpdateUser}
//                 color="primary"
//                 variant="contained"
//                 sx={{
//                   textTransform: 'none',
//                   fontWeight: 500,
//                   borderRadius: 2,
//                   boxShadow: 'none',
//                 }}
//               >
//                 Mettre à jour
//               </Button>
//             </motion.div>
//           </DialogActions>
//         </motion.div>
//       </Dialog>
//     </Box>
//   );
// }

// export default AdminGererUser;

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Card,
  CardContent,
  Skeleton,
  Avatar,
  useTheme,
  useMediaQuery,
  MenuItem,
  Pagination,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';
import PersonIcon from '@mui/icons-material/Person';
import {
  createUser,
  getUsers,
  updateUser,
  deleteUser,
} from '../../services/api';

// Palette de couleurs
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
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',
  divider: 'rgba(0, 0, 0, 0.08)',
  shadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
  hover: 'rgba(0, 119, 182, 0.05)',
};

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.5,
      when: 'beforeChildren',
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.1, 0.25, 1.0],
    },
  },
  hover: {
    backgroundColor: colors.hover,
    transition: { duration: 0.2 },
  },
};

const buttonVariants = {
  hover: { scale: 1.05, transition: { duration: 0.2 } },
  tap: { scale: 0.95, transition: { duration: 0.1 } },
};

const dialogVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.1, 0.25, 1.0],
    },
  },
};

function AdminGererUser() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    role: '',
    motDePasse: '',
    email: '',
    telephone: '',
    idHopital: '',
    sexe: '',
    dateNaissance: '',
  });
  const [editId, setEditId] = useState(null);
  const [errors, setErrors] = useState({});
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    role: '',
    limit: 10,
    page: 1,
  });
  const [refreshing, setRefreshing] = useState(false);

  // Charger les utilisateurs
  const fetchData = async () => {
    try {
      setLoading(true);
      setRefreshing(true);
      const response = await getUsers({
        ...filters,
        offset: (filters.page - 1) * filters.limit,
      });
      console.log('getUsers response:', response); // Debug API response
      const data = Array.isArray(response.data?.users)
        ? response.data.users
        : response.data?.users || [];
      setUsers(data);
      setFilteredUsers(data);
      setTotal(response.data?.total || 0);
      setError(null);
      toast.success('Liste des utilisateurs chargée avec succès.');
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || 'Erreur de chargement des utilisateurs';
      console.error('fetchData error:', err); // Debug error
      setError(errorMessage);
      toast.error(errorMessage);
      setUsers([]);
      setFilteredUsers([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Charger les données au montage et lorsque les filtres changent
  useEffect(() => {
    fetchData();
  }, [filters]); // Include entire filters object

  // Filtrer les utilisateurs
  useEffect(() => {
    if (search || filters.role) {
      const lowerCaseSearch = search.toLowerCase();
      const filtered = users.filter(
        (user) =>
          (!filters.role || user.role === filters.role) &&
          (user.nom.toLowerCase().includes(lowerCaseSearch) ||
            user.prenom?.toLowerCase().includes(lowerCaseSearch) ||
            user.email.toLowerCase().includes(lowerCaseSearch) ||
            user.telephone?.toLowerCase().includes(lowerCaseSearch))
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  }, [search, filters.role, users]);

  // Gestion des changements dans les filtres
  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
      page: 1,
    });
  };

  // Gestion de la recherche
  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  // Gestion des changements dans le formulaire
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  // Validation du formulaire
  const validateForm = () => {
    const newErrors = {};
    if (!formData.nom || formData.nom.trim() === '') {
      newErrors.nom = 'Le nom est requis.';
    }
    if (!formData.email || formData.email.trim() === '') {
      newErrors.email = "L'email est requis.";
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'Veuillez entrer un email valide.';
    }
    if (!editId && (!formData.motDePasse || formData.motDePasse.trim() === '')) {
      newErrors.motDePasse = 'Le mot de passe est requis.';
    }
    if (formData.sexe && !['H', 'F'].includes(formData.sexe)) {
      newErrors.sexe = "Le sexe doit être 'H' ou 'F'.";
    }
    if (formData.dateNaissance) {
      const birthDate = new Date(formData.dateNaissance);
      const today = new Date();
      if (birthDate > today) {
        newErrors.dateNaissance =
          'La date de naissance ne peut pas être dans le futur.';
      }
    }
    if (
      (formData.role === 'Médecin' || formData.role === 'Infirmier') &&
      !formData.idHopital
    ) {
      newErrors.idHopital = "L'ID de l'hôpital est requis pour ce rôle.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Ajouter un utilisateur
  const handleAddUser = async () => {
    if (!validateForm()) return;
    try {
      await createUser({
        ...formData,
        dateNaissance: formData.dateNaissance || null,
      });
      toast.success('Utilisateur ajouté avec succès.');
      setOpenAddDialog(false);
      setFormData({
        nom: '',
        prenom: '',
        role: '',
        motDePasse: '',
        email: '',
        telephone: '',
        idHopital: '',
        sexe: '',
        dateNaissance: '',
      });
      fetchData();
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Erreur lors de l'ajout de l'utilisateur.";
      toast.error(errorMessage);
    }
  };

  // Ouvrir le formulaire de modification
  const handleEditUser = (user) => {
    setEditId(user.idUtilisateur);
    setFormData({
      nom: user.nom,
      prenom: user.prenom || '',
      role: user.role || '',
      motDePasse: '',
      email: user.email,
      telephone: user.telephone || '',
      idHopital: user.idHopital || '',
      sexe: user.sexe || '',
      dateNaissance: user.dateNaissance ? user.dateNaissance.split('T')[0] : '',
    });
    setOpenEditDialog(true);
  };

  // Mettre à jour un utilisateur
  const handleUpdateUser = async () => {
    if (!validateForm()) return;
    try {
      await updateUser(editId, {
        ...formData,
        dateNaissance: formData.dateNaissance || null,
      });
      toast.success('Utilisateur mis à jour avec succès.');
      setOpenEditDialog(false);
      setFormData({
        nom: '',
        prenom: '',
        role: '',
        motDePasse: '',
        email: '',
        telephone: '',
        idHopital: '',
        sexe: '',
        dateNaissance: '',
      });
      setEditId(null);
      fetchData();
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        "Erreur lors de la mise à jour de l'utilisateur.";
      toast.error(errorMessage);
    }
  };

  // Supprimer un utilisateur
  const handleDelete = async (id) => {
    if (!window.confirm('Voulez-vous vraiment supprimer cet utilisateur')) return;
    try {
      await deleteUser(id);
      toast.success('Utilisateur supprimé avec succès.');
      fetchData();
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        "Erreur lors de la suppression de l'utilisateur.";
      toast.error(errorMessage);
    }
  };

  // Vue mobile avec cartes
  const renderMobileView = () => {
    if (loading && !refreshing) {
      return Array.from(new Array(3)).map((_, index) => (
        <Card key={index} sx={{ mb: 2, borderRadius: 2, boxShadow: colors.shadow }}>
          <CardContent sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
              <Box sx={{ width: '100%' }}>
                <Skeleton variant="text" width="60%" height={24} />
                <Skeleton variant="text" width="40%" height={20} />
              </Box>
            </Box>
            <Skeleton variant="rectangular" width="100%" height={100} sx={{ borderRadius: 1 }} />
          </CardContent>
        </Card>
      ));
    }

    return filteredUsers.map((user, index) => (
      <motion.div
        key={user.idUtilisateur}
        variants={itemVariants}
        initial="hidden"
        animate="visible"
        whileHover="hover"
        custom={index}
      >
        <Card
          sx={{
            mb: 2,
            borderRadius: 2,
            boxShadow: colors.shadow,
            overflow: 'visible',
            transition: 'all 0.3s ease',
            '&:hover': { boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)' },
          }}
        >
          <CardContent sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar sx={{ bgcolor: colors.primary, color: 'white', fontWeight: 'bold', mr: 2 }}>
                {user.nom ? user.nom.charAt(0) : 'U'}
              </Avatar>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: colors.text }}>
                  {user.nom} {user.prenom || ''}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {user.role || '-'}
                </Typography>
              </Box>
            </Box>
            <Typography variant="body2" sx={{ mb: 1, color: colors.textSecondary }}>
              <strong>Email:</strong> {user.email}
            </Typography>
            <Typography variant="body2" sx={{ mb: 1, color: colors.textSecondary }}>
              <strong>Téléphone:</strong> {user.telephone || '-'}
            </Typography>
            <Typography variant="body2" sx={{ mb: 1, color: colors.textSecondary }}>
              <strong>Sexe:</strong> {user.sexe || '-'}
            </Typography>
            <Typography variant="body2" sx={{ mb: 2, color: colors.textSecondary }}>
              <strong>Date de Naissance:</strong>{' '}
              {user.dateNaissance
                ? new Date(user.dateNaissance).toLocaleDateString('fr-FR')
                : '-'}
            </Typography>
            <Typography variant="body2" sx={{ mb: 2, color: colors.textSecondary }}>
              <strong>Hôpital:</strong> {user.idHopital || '-'}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
              <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                <Button
                  variant="outlined"
                  color="primary"
                  size="small"
                  startIcon={<EditIcon />}
                  onClick={() => handleEditUser(user)}
                  sx={{ fontWeight: 500, borderRadius: 2, textTransform: 'none' }}
                >
                  Modifier
                </Button>
              </motion.div>
              <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                <Button
                  variant="outlined"
                  color="error"
                  size="small"
                  startIcon={<DeleteIcon />}
                  onClick={() => handleDelete(user.idUtilisateur)}
                  sx={{ fontWeight: 500, borderRadius: 2, textTransform: 'none' }}
                >
                  Supprimer
                </Button>
              </motion.div>
            </Box>
          </CardContent>
        </Card>
      </motion.div>
    ));
  };

  // Vue desktop avec tableau
  const renderDesktopView = () => {
    return (
      <TableContainer component={Paper} sx={{ boxShadow: colors.shadow, borderRadius: 2 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: 'rgba(0, 119, 182, 0.05)' }}>
              <TableCell sx={{ fontWeight: 600, color: colors.text }}>Nom</TableCell>
              <TableCell sx={{ fontWeight: 600, color: colors.text }}>Prénom</TableCell>
              <TableCell sx={{ fontWeight: 600, color: colors.text }}>Rôle</TableCell>
              <TableCell sx={{ fontWeight: 600, color: colors.text }}>Email</TableCell>
              <TableCell sx={{ fontWeight: 600, color: colors.text }}>Téléphone</TableCell>
              <TableCell sx={{ fontWeight: 600, color: colors.text }}>Sexe</TableCell>
              <TableCell sx={{ fontWeight: 600, color: colors.text }}>Date de Naissance</TableCell>
              <TableCell sx={{ fontWeight: 600, color: colors.text }}>Hôpital</TableCell>
              <TableCell sx={{ fontWeight: 600, color: colors.text }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading && !refreshing ? (
              Array.from(new Array(5)).map((_, index) => (
                <TableRow key={index}>
                  <TableCell><Skeleton variant="text" width={150} /></TableCell>
                  <TableCell><Skeleton variant="text" width={150} /></TableCell>
                  <TableCell><Skeleton variant="text" width={100} /></TableCell>
                  <TableCell><Skeleton variant="text" width={200} /></TableCell>
                  <TableCell><Skeleton variant="text" width={100} /></TableCell>
                  <TableCell><Skeleton variant="text" width={50} /></TableCell>
                  <TableCell><Skeleton variant="text" width={100} /></TableCell>
                  <TableCell><Skeleton variant="text" width={50} /></TableCell>
                  <TableCell><Skeleton variant="rectangular" width={200} height={40} /></TableCell>
                </TableRow>
              ))
            ) : filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">Aucun utilisateur trouvé.</Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow
                  key={user.idUtilisateur}
                  sx={{
                    '&:hover': { backgroundColor: colors.hover },
                    transition: 'background-color 0.3s ease',
                  }}
                >
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar
                        sx={{ width: 32, height: 32, mr: 1, bgcolor: colors.primary, fontSize: '0.875rem' }}
                      >
                        {user.nom ? user.nom.charAt(0) : 'U'}
                      </Avatar>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {user.nom}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{user.prenom || '-'}</TableCell>
                  <TableCell>{user.role || '-'}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.telephone || '-'}</TableCell>
                  <TableCell>{user.sexe || '-'}</TableCell>
                  <TableCell>
                    {user.dateNaissance
                      ? new Date(user.dateNaissance).toLocaleDateString('fr-FR')
                      : '-'}
                  </TableCell>
                  <TableCell>{user.idHopital || '-'}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                        <Button
                          variant="outlined"
                          color="primary"
                          size="small"
                          startIcon={<EditIcon />}
                          onClick={() => handleEditUser(user)}
                          sx={{ fontWeight: 500, borderRadius: 2, textTransform: 'none' }}
                        >
                          Modifier
                        </Button>
                      </motion.div>
                      <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          startIcon={<DeleteIcon />}
                          onClick={() => handleDelete(user.idUtilisateur)}
                          sx={{ fontWeight: 500, borderRadius: 2, textTransform: 'none' }}
                        >
                          Supprimer
                        </Button>
                      </motion.div>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  return (
    <Box
      sx={{
        p: { xs: 2, md: 4 },
        bgcolor: colors.background,
        height: '100%',
        overflow: 'auto',
      }}
    >
      <motion.div variants={containerVariants} initial="hidden" animate="visible">
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, gap: 2 }}>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          >
            <Avatar sx={{ bgcolor: colors.primary, width: 56, height: 56 }}>
              <PersonIcon fontSize="large" />
            </Avatar>
          </motion.div>
          <Box>
            <Typography
              variant="h4"
              component="h1"
              sx={{ fontWeight: 700, color: colors.text, fontSize: { xs: '1.5rem', sm: '2rem', md: '2.25rem' } }}
            >
              Gestion des utilisateurs
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
              {filteredUsers.length} utilisateur{filteredUsers.length !== 1 ? 's' : ''} au total
            </Typography>
          </Box>
          <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
            <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
              <Button
                variant="contained"
                color="primary"
                startIcon={<PersonIcon />}
                onClick={() => setOpenAddDialog(true)}
                sx={{ textTransform: 'none', fontWeight: 500 }}
              >
                Ajouter un utilisateur
              </Button>
            </motion.div>
            <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
              <Button
                variant="contained"
                color="primary"
                startIcon={<RefreshIcon />}
                onClick={fetchData}
                disabled={refreshing}
                sx={{ textTransform: 'none', fontWeight: 500 }}
              >
                {refreshing ? 'Actualisation...' : 'Actualiser'}
              </Button>
            </motion.div>
          </Box>
        </Box>

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            mb: 3,
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 2,
          }}
        >
          <TextField
            label="Rechercher un utilisateur"
            value={search}
            onChange={handleSearchChange}
            fullWidth
            sx={{ maxWidth: { xs: '100%', sm: 300 }, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          />
          <TextField
            select
            label="Rôle"
            name="role"
            value={filters.role}
            onChange={handleFilterChange}
            sx={{ maxWidth: { xs: '100%', sm: 150 }, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          >
            <MenuItem value="">Tous les rôles</MenuItem>
            <MenuItem value="Médecin">Médecin</MenuItem>
            <MenuItem value="Infirmier">Infirmier</MenuItem>
            <MenuItem value="Admin">Admin</MenuItem>
            <MenuItem value="Patient">Patient</MenuItem>
          </TextField>
        </Box>

        {error && (
          <Box
            sx={{ mb: 3, p: 2, bgcolor: colors.error, color: 'white', borderRadius: 2, display: 'flex', alignItems: 'center' }}
          >
            <Typography>{error}</Typography>
          </Box>
        )}

        <AnimatePresence>
          {isMobile ? renderMobileView() : renderDesktopView()}
        </AnimatePresence>

        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Pagination
            count={Math.ceil(total / filters.limit)}
            page={filters.page}
            onChange={(event, value) => setFilters({ ...filters, page: value })}
            color="primary"
            shape="rounded"
            sx={{ '& .MuiPaginationItem-root': { fontFamily: 'Inter, Roboto, sans-serif' } }}
          />
        </Box>
      </motion.div>

      {/* Dialogue pour ajouter un utilisateur */}
      <Dialog
        open={openAddDialog}
        onClose={() => {
          setOpenAddDialog(false);
          setFormData({
            nom: '',
            prenom: '',
            role: '',
            motDePasse: '',
            email: '',
            telephone: '',
            idHopital: '',
            sexe: '',
            dateNaissance: '',
          });
          setErrors({});
        }}
        PaperProps={{ sx: { borderRadius: 2, boxShadow: colors.shadow, maxWidth: 400 } }}
      >
        <motion.div variants={dialogVariants} initial="hidden" animate="visible">
          <DialogTitle sx={{ fontWeight: 600, color: colors.text }}>Ajouter un utilisateur</DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ mb: 2, color: colors.textSecondary }}>
              Remplissez les informations pour ajouter un nouvel utilisateur.
            </DialogContentText>
            <TextField
              label="Nom"
              name="nom"
              value={formData.nom}
              onChange={handleChange}
              fullWidth
              margin="normal"
              error={!!errors.nom}
              helperText={errors.nom}
              sx={{ '& .MuiInputBase-root': { borderRadius: 2 } }}
            />
            <TextField
              label="Prénom"
              name="prenom"
              value={formData.prenom}
              onChange={handleChange}
              fullWidth
              margin="normal"
              sx={{ '& .MuiInputBase-root': { borderRadius: 2 } }}
            />
            <TextField
              select
              label="Rôle"
              name="role"
              value={formData.role}
              onChange={handleChange}
              fullWidth
              margin="normal"
              sx={{ '& .MuiInputBase-root': { borderRadius: 2 } }}
            >
              <MenuItem value="Médecin">Médecin</MenuItem>
              <MenuItem value="Infirmier">Infirmier</MenuItem>
              <MenuItem value="Admin">Admin</MenuItem>
              <MenuItem value="Patient">Patient</MenuItem>
            </TextField>
            <TextField
              label="Mot de passe"
              name="motDePasse"
              type="password"
              value={formData.motDePasse}
              onChange={handleChange}
              fullWidth
              margin="normal"
              error={!!errors.motDePasse}
              helperText={errors.motDePasse}
              sx={{ '& .MuiInputBase-root': { borderRadius: 2 } }}
            />
            <TextField
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              fullWidth
              margin="normal"
              error={!!errors.email}
              helperText={errors.email}
              sx={{ '& .MuiInputBase-root': { borderRadius: 2 } }}
            />
            <TextField
              label="Téléphone"
              name="telephone"
              value={formData.telephone}
              onChange={handleChange}
              fullWidth
              margin="normal"
              sx={{ '& .MuiInputBase-root': { borderRadius: 2 } }}
            />
            <TextField
              select
              label="Sexe"
              name="sexe"
              value={formData.sexe}
              onChange={handleChange}
              fullWidth
              margin="normal"
              error={!!errors.sexe}
              helperText={errors.sexe}
              sx={{ '& .MuiInputBase-root': { borderRadius: 2 } }}
            >
              <MenuItem value="H">Homme</MenuItem>
              <MenuItem value="F">Femme</MenuItem>
            </TextField>
            <TextField
              label="Date de Naissance"
              name="dateNaissance"
              type="date"
              value={formData.dateNaissance}
              onChange={handleChange}
              fullWidth
              margin="normal"
              error={!!errors.dateNaissance}
              helperText={errors.dateNaissance}
              InputLabelProps={{ shrink: true }}
              sx={{ '& .MuiInputBase-root': { borderRadius: 2 } }}
            />
            <TextField
              label="ID Hôpital"
              name="idHopital"
              value={formData.idHopital}
              onChange={handleChange}
              fullWidth
              margin="normal"
              error={!!errors.idHopital}
              helperText={errors.idHopital}
              disabled={formData.role !== 'Médecin' && formData.role !== 'Infirmier'}
              sx={{ '& .MuiInputBase-root': { borderRadius: 2 } }}
            />
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button
              onClick={() => {
                setOpenAddDialog(false);
                setFormData({
                  nom: '',
                  prenom: '',
                  role: '',
                  motDePasse: '',
                  email: '',
                  telephone: '',
                  idHopital: '',
                  sexe: '',
                  dateNaissance: '',
                });
                setErrors({});
              }}
              sx={{ textTransform: 'none', fontWeight: 500, color: colors.textSecondary }}
            >
              Annuler
            </Button>
            <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
              <Button
                onClick={handleAddUser}
                color="primary"
                variant="contained"
                sx={{ textTransform: 'none', fontWeight: 500, borderRadius: 2, boxShadow: 'none' }}
              >
                Ajouter
              </Button>
            </motion.div>
          </DialogActions>
        </motion.div>
      </Dialog>

      {/* Dialogue pour modifier un utilisateur */}
      <Dialog
        open={openEditDialog}
        onClose={() => {
          setOpenEditDialog(false);
          setFormData({
            nom: '',
            prenom: '',
            role: '',
            motDePasse: '',
            email: '',
            telephone: '',
            idHopital: '',
            sexe: '',
            dateNaissance: '',
          });
          setEditId(null);
          setErrors({});
        }}
        PaperProps={{ sx: { borderRadius: 2, boxShadow: colors.shadow, maxWidth: 400 } }}
      >
        <motion.div variants={dialogVariants} initial="hidden" animate="visible">
          <DialogTitle sx={{ fontWeight: 600, color: colors.text }}>Modifier un utilisateur</DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ mb: 2, color: colors.textSecondary }}>
              Modifiez les informations de l’utilisateur.
            </DialogContentText>
            <TextField
              label="Nom"
              name="nom"
              value={formData.nom}
              onChange={handleChange}
              fullWidth
              margin="normal"
              error={!!errors.nom}
              helperText={errors.nom}
              sx={{ '& .MuiInputBase-root': { borderRadius: 2 } }}
            />
            <TextField
              label="Prénom"
              name="prenom"
              value={formData.prenom}
              onChange={handleChange}
              fullWidth
              margin="normal"
              sx={{ '& .MuiInputBase-root': { borderRadius: 2 } }}
            />
            <TextField
              select
              label="Rôle"
              name="role"
              value={formData.role}
              onChange={handleChange}
              fullWidth
              margin="normal"
              sx={{ '& .MuiInputBase-root': { borderRadius: 2 } }}
            >
              <MenuItem value="Médecin">Médecin</MenuItem>
              <MenuItem value="Infirmier">Infirmier</MenuItem>
              <MenuItem value="Admin">Admin</MenuItem>
              <MenuItem value="Patient">Patient</MenuItem>
            </TextField>
            <TextField
              label="Mot de passe (facultatif)"
              name="motDePasse"
              type="password"
              value={formData.motDePasse}
              onChange={handleChange}
              fullWidth
              margin="normal"
              helperText="Laisser vide pour ne pas modifier"
              sx={{ '& .MuiInputBase-root': { borderRadius: 2 } }}
            />
            <TextField
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              fullWidth
              margin="normal"
              error={!!errors.email}
              helperText={errors.email}
              sx={{ '& .MuiInputBase-root': { borderRadius: 2 } }}
            />
            <TextField
              label="Téléphone"
              name="telephone"
              value={formData.telephone}
              onChange={handleChange}
              fullWidth
              margin="normal"
              sx={{ '& .MuiInputBase-root': { borderRadius: 2 } }}
            />
            <TextField
              select
              label="Sexe"
              name="sexe"
              value={formData.sexe}
              onChange={handleChange}
              fullWidth
              margin="normal"
              error={!!errors.sexe}
              helperText={errors.sexe}
              sx={{ '& .MuiInputBase-root': { borderRadius: 2 } }}
            >
              <MenuItem value="H">Homme</MenuItem>
              <MenuItem value="F">Femme</MenuItem>
            </TextField>
            <TextField
              label="Date de Naissance"
              name="dateNaissance"
              type="date"
              value={formData.dateNaissance}
              onChange={handleChange}
              fullWidth
              margin="normal"
              error={!!errors.dateNaissance}
              helperText={errors.dateNaissance}
              InputLabelProps={{ shrink: true }}
              sx={{ '& .MuiInputBase-root': { borderRadius: 2 } }}
            />
            <TextField
              label="ID Hôpital"
              name="idHopital"
              value={formData.idHopital}
              onChange={handleChange}
              fullWidth
              margin="normal"
              error={!!errors.idHopital}
              helperText={errors.idHopital}
              disabled={formData.role !== 'Médecin' && formData.role !== 'Infirmier'}
              sx={{ '& .MuiInputBase-root': { borderRadius: 2 } }}
            />
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button
              onClick={() => {
                setOpenEditDialog(false);
                setFormData({
                  nom: '',
                  prenom: '',
                  role: '',
                  motDePasse: '',
                  email: '',
                  telephone: '',
                  idHopital: '',
                  sexe: '',
                  dateNaissance: '',
                });
                setEditId(null);
                setErrors({});
              }}
              sx={{ textTransform: 'none', fontWeight: 500, color: colors.textSecondary }}
            >
              Annuler
            </Button>
            <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
              <Button
                onClick={handleUpdateUser}
                color="primary"
                variant="contained"
                sx={{ textTransform: 'none', fontWeight: 500, borderRadius: 2, boxShadow: 'none' }}
              >
                Mettre à jour
              </Button>
            </motion.div>
          </DialogActions>
        </motion.div>
      </Dialog>
    </Box>
  );
}

export default AdminGererUser;