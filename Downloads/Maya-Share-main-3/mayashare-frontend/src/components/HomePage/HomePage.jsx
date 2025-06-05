// import { motion } from 'framer-motion';
// import { Link } from 'react-router-dom';
// import MedicalServicesOutlinedIcon from '@mui/icons-material/MedicalServicesOutlined';
// import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
// import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
// import InsightsOutlinedIcon from '@mui/icons-material/InsightsOutlined';
// import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
// import SupportAgentOutlinedIcon from '@mui/icons-material/SupportAgentOutlined';
// import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
// import StarIcon from '@mui/icons-material/Star';
// import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
// import HospitalImage from '../assets/hospital.jpg';
// import DoctorImage from '../assets/doctor.jpg';
// import './HomePage.css';

// // Animation variants
// const fadeIn = {
//   initial: { opacity: 0, y: 20 },
//   animate: {
//     opacity: 1,
//     y: 0,
//     transition: { duration: 0.6, ease: 'easeOut' },
//   },
// };

// const staggerContainer = {
//   animate: {
//     transition: {
//       staggerChildren: 0.1,
//     },
//   },
// };

// function HomePage() {
//   const features = [
//     {
//       icon: <MedicalServicesOutlinedIcon />,
//       title: 'Gestion des Patients',
//       description:
//         'Suivi optimisé des dossiers médicaux avec interface intuitive.',
//     },
//     {
//       icon: <PeopleAltOutlinedIcon />,
//       title: 'Gestion du Personnel',
//       description: 'Administration fluide du personnel médical.',
//     },
//     {
//       icon: <CalendarTodayOutlinedIcon />,
//       title: 'Planification',
//       description: 'Organisation simplifiée des rendez-vous.',
//     },
//     {
//       icon: <InsightsOutlinedIcon />,
//       title: 'Rapports',
//       description: 'Analyses et statistiques en temps réel.',
//     },
//   ];

//   const testimonials = [
//     {
//       name: 'Dr. Jean Martin',
//       role: 'Médecin Généraliste',
//       quote:
//         "Une solution qui a transformé notre gestion quotidienne. L'interface intuitive et les Service avancées nous font gagner un temps précieux.",
//       avatar:
//         'https://static.wixstatic.com/media/2735966afd054c0ebc69fc94004ec0ff.jpg/v1/fill/w_320,h_292,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/2735966afd054c0ebc69fc94004ec0ff.jpg',
//     },
//     {
//       name: 'Dr. Pierre Durand',
//       role: 'Chirurgienne',
//       quote:
//         "L'interface intuitive réduit considérablement le temps administratif. Je peux me concentrer sur mes patients plutôt que sur la paperasse.",
//       avatar:
//         'https://img.freepik.com/photos-gratuite/portrait-chirurgienne-afro-americaine-heureuse-debout-dans-salle-operation-prete-travailler-patient-travailleuse-medicale-uniforme-chirurgical-salle-operation_657921-38.jpg?semt=ais_hybrid&w=740',
//     },
//     {
//       name: 'Luc Bernard',
//       role: "Directeur d'Hôpital",
//       quote:
//         'Sécurité et rapports automatisés au top niveau. Notre établissement a vu une amélioration de 30% dans la gestion des dossiers.',
//       avatar:
//         'https://www.afdb.org/sites/default/files/u100/adf50-yaounde_sanitation_project_pady-dr-paul-eloundou.jpg',
//     },
//   ];

//   const benefits = [
//     {
//       title: 'Sécurité Renforcée',
//       description:
//         'Protection des données conforme RGPD avec chiffrement de bout en bout',
//       icon: <ShieldOutlinedIcon />,
//       type: 'security',
//     },
//     {
//       title: 'Support 24/7',
//       description:
//         'Assistance technique disponible à tout moment pour vous accompagner',
//       icon: <SupportAgentOutlinedIcon />,
//       type: 'support',
//     },
//   ];

//   return (
//     <div className='homepage-container'>
//       {/* Hero Section - Amélioré */}
//       <section className='hero-section'>
//         <div className='hero-background-overlay'></div>
//         <div className='hero-background-pattern'></div>

//         <div className='section-container relative-position'>
//           <div className='hero-content'>
//             <div className='hero-text'>
//               <motion.div initial='initial' animate='animate' variants={fadeIn}>
//                 <div className='badge-container'>
//                   <AutoAwesomeIcon className='badge-icon' />
//                   <span className='hero-overline'>
//                     PLATEFORME DE GESTION MÉDICALE
//                   </span>
//                 </div>

//                 <h1 className='hero-title'>
//                   <span className='hero-title-accent'>Mayashare</span> - Gestion
//                   Médicale Simplifiée
//                 </h1>

//                 <p className='hero-description'>
//                   Solution tout-en-un pour optimiser la gestion de votre
//                   établissement de santé avec des outils modernes et sécurisés.
//                 </p>

//                 <div className='hero-buttons'>
//                   <Link to='/login' className='btn btn-primary'>
//                     Se connecter
//                     <ArrowForwardIcon className='btn-icon' />
//                   </Link>
//                   <Link to='/register' className='btn btn-outline'>
//                     S'inscrire
//                   </Link>
//                 </div>
//               </motion.div>
//             </div>

//             <div>
//               <motion.div
//                 initial={{ opacity: 0, scale: 0.95 }}
//                 animate={{ opacity: 1, scale: 1 }}
//                 transition={{ duration: 0.7 }}
//               >
//                 <div className='hero-image-container'>
//                   <div className='hero-image-glow'></div>
//                   <img
//                     src={DoctorImage || '/placeholder.svg'}
//                     alt='Docteur'
//                     className='hero-image'
//                   />
//                 </div>
//               </motion.div>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* Features Section - Amélioré */}
//       <section className='section'>
//         <div className='section-background-gradient'></div>

//         <div className='section-container relative-position'>
//           <motion.div
//             initial='initial'
//             whileInView='animate'
//             viewport={{ once: true }}
//             variants={staggerContainer}
//           >
//             <div className='section-header'>
//               <motion.div variants={fadeIn}>
//                 <div className='badge-container badge-blue'>
//                   <MedicalServicesOutlinedIcon className='badge-icon' />
//                   <span className='section-overline overline-blue'>
//                     Service
//                   </span>
//                 </div>

//                 <h2 className='section-title'>
//                   Transformez Votre Pratique avec{' '}
//                   <span className='text-gradient-blue'>Mayashare</span>
//                 </h2>

//                 <p className='section-description'>
//                   Des outils puissants pour simplifier votre quotidien et
//                   améliorer l'expérience de vos patients
//                 </p>
//               </motion.div>
//             </div>

//             <div className='grid-container grid-4-cols'>
//               {features.map((feature, index) => (
//                 <motion.div variants={fadeIn} key={index}>
//                   <div
//                     className={`card feature-card feature-card-${index + 1}`}
//                   >
//                     <div className='card-content'>
//                       <div className={`card-icon feature-icon-${index + 1}`}>
//                         {feature.icon}
//                       </div>
//                       <h3 className='card-title'>{feature.title}</h3>
//                       <p className='card-description'>{feature.description}</p>
//                     </div>
//                   </div>
//                 </motion.div>
//               ))}
//             </div>
//           </motion.div>
//         </div>
//       </section>

//       {/* About Section - Amélioré */}
//       <section className='section section-gray'>
//         <div className='section-container'>
//           <motion.div
//             initial='initial'
//             whileInView='animate'
//             viewport={{ once: true }}
//             variants={staggerContainer}
//           >
//             <div className='about-content'>
//               <div>
//                 <motion.div variants={fadeIn}>
//                   <div className='about-image-container'>
//                     <div className='about-image-glow'></div>
//                     <img
//                       src={HospitalImage || '/placeholder.svg'}
//                       alt='Hôpital'
//                       className='about-image'
//                     />
//                   </div>
//                 </motion.div>
//               </div>

//               <div>
//                 <motion.div variants={fadeIn}>
//                   <div className='badge-container badge-green'>
//                     <MedicalServicesOutlinedIcon className='badge-icon' />
//                     <span className='section-overline overline-green'>
//                       À PROPOS
//                     </span>
//                   </div>

//                   <h2 className='section-title'>
//                     Mayashare, Pensée pour les{' '}
//                     <span className='text-gradient-green'>
//                       Experts Médicaux
//                     </span>
//                   </h2>

//                   <p
//                     className='section-description'
//                     style={{
//                       textAlign: 'left',
//                       margin: 0,
//                       marginBottom: '2rem',
//                     }}
//                   >
//                     Développée avec des professionnels de santé pour répondre
//                     aux exigences des cliniques modernes. Notre plateforme
//                     s'adapte à tous les types d'établissements médicaux.
//                   </p>

//                   {benefits.map((benefit, index) => (
//                     <div key={index} className='benefit-item'>
//                       <div className={`benefit-icon ${benefit.type}`}>
//                         {benefit.icon}
//                       </div>
//                       <div>
//                         <h3 className='benefit-title'>{benefit.title}</h3>
//                         <p className='benefit-description'>
//                           {benefit.description}
//                         </p>
//                       </div>
//                     </div>
//                   ))}

//                   <div className='mt-4'>
//                     <Link to='/about' className='btn btn-text'>
//                       En savoir plus{' '}
//                       <ArrowForwardIcon className='btn-icon-right' />
//                     </Link>
//                   </div>
//                 </motion.div>
//               </div>
//             </div>
//           </motion.div>
//         </div>
//       </section>

//       {/* Testimonials Section - Amélioré */}
//       <section className='section'>
//         <div className='section-container'>
//           <motion.div
//             initial='initial'
//             whileInView='animate'
//             viewport={{ once: true }}
//             variants={staggerContainer}
//           >
//             <div className='section-header'>
//               <motion.div variants={fadeIn}>
//                 <div className='badge-container badge-amber'>
//                   <StarIcon className='badge-icon' />
//                   <span className='section-overline overline-amber'>
//                     TÉMOIGNAGES
//                   </span>
//                 </div>

//                 <h2 className='section-title'>
//                   Ce Qu'Ils Pensent de{' '}
//                   <span className='text-gradient-amber'>Mayashare</span>
//                 </h2>

//                 <p className='section-description'>
//                   Les retours de ceux qui utilisent notre plateforme au
//                   quotidien
//                 </p>
//               </motion.div>
//             </div>

//             <div className='grid-container grid-3-cols'>
//               {testimonials.map((testimonial, index) => (
//                 <motion.div variants={fadeIn} key={index}>
//                   <div className='card testimonial-card'>
//                     <div className='card-content' style={{ textAlign: 'left' }}>
//                       <div className='testimonial-rating'>
//                         {[1, 2, 3, 4, 5].map((star) => (
//                           <StarIcon key={star} className='star' />
//                         ))}
//                       </div>

//                       <p className='testimonial-quote'>"{testimonial.quote}"</p>

//                       <hr className='testimonial-divider' />

//                       <div className='testimonial-author'>
//                         <img
//                           src={testimonial.avatar || '/placeholder.svg'}
//                           alt={testimonial.name}
//                           className='testimonial-avatar'
//                         />
//                         <div>
//                           <h4 className='testimonial-name'>
//                             {testimonial.name}
//                           </h4>
//                           <p className='testimonial-role'>{testimonial.role}</p>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 </motion.div>
//               ))}
//             </div>
//           </motion.div>
//         </div>
//       </section>

//       {/* CTA Section - Amélioré */}
//       <section className='section section-gradient cta-section'>
//         <div className='cta-background-overlay'></div>
//         <div className='cta-background-pattern'></div>

//         <div className='section-container relative-position'>
//           <motion.div
//             initial='initial'
//             whileInView='animate'
//             viewport={{ once: true }}
//             variants={fadeIn}
//           >
//             <div className='text-center'>
//               <div className='badge-container badge-white'>
//                 <AutoAwesomeIcon className='badge-icon' />
//                 <span className='badge-text'>Commencez Maintenant</span>
//               </div>

//               <h2 className='cta-title section-title-white'>
//                 Révolutionnez Votre Pratique avec{' '}
//                 <span className='text-gradient-light'>Mayashare</span>
//               </h2>

//               <p className='cta-description'>
//                 Rejoignez les professionnels qui optimisent leur quotidien avec
//                 notre plateforme. Essayez gratuitement pendant 14 jours, sans
//                 engagement.
//               </p>

//               <div className='cta-buttons'>
//                 <Link to='/register' className='btn btn-secondary'>
//                   Commencer maintenant
//                   <ArrowForwardIcon className='btn-icon' />
//                 </Link>
//                 <Link to='/demo' className='btn btn-outline'>
//                   Voir la démo
//                 </Link>
//               </div>
//             </div>
//           </motion.div>
//         </div>
//       </section>
//     </div>
//   );
// }

// export default HomePage;

// import React from 'react';
// import { Link } from 'react-router-dom';
// import { motion } from 'framer-motion';
// import MedicalServicesOutlinedIcon from '@mui/icons-material/MedicalServicesOutlined';
// import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
// import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
// import InsightsOutlinedIcon from '@mui/icons-material/InsightsOutlined';
// import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
// import SupportAgentOutlinedIcon from '@mui/icons-material/SupportAgentOutlined';
// import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
// import StarIcon from '@mui/icons-material/Star';
// import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
// import DoctorImage from '../assets/doctor.jpg';
// import HospitalImage from '../assets/hospital.jpg';
// import './HomePage.css';

// function HomePage() {
//   const fadeIn = {
//     initial: { opacity: 0, y: 20 },
//     animate: {
//       opacity: 1,
//       y: 0,
//       transition: { duration: 0.6, ease: 'easeOut' },
//     },
//   };

//   const staggerContainer = {
//     animate: {
//       transition: {
//         staggerChildren: 0.1,
//       },
//     },
//   };

//   const features = [
//     {
//       icon: <MedicalServicesOutlinedIcon />,
//       title: 'Gestion des Patients',
//       description: 'Suivi optimisé des dossiers médicaux avec interface intuitive.',
//     },
//     {
//       icon: <PeopleAltOutlinedIcon />,
//       title: 'Gestion du Personnel',
//       description: 'Administration fluide du personnel médical.',
//     },
//     {
//       icon: <CalendarTodayOutlinedIcon />,
//       title: 'Planification',
//       description: 'Organisation simplifiée des rendez-vous.',
//     },
//     {
//       icon: <InsightsOutlinedIcon />,
//       title: 'Rapports',
//       description: 'Analyses et statistiques en temps réel.',
//     },
//   ];

//   const testimonials = [
//     {
//       name: 'Dr. Jean Martin',
//       role: 'Médecin Généraliste',
//       quote: "Une solution qui a transformé notre gestion quotidienne. L'interface intuitive et les Service avancées nous font gagner un temps précieux.",
//       avatar: 'https://static.wixstatic.com/media/2735966afd054c0ebc69fc94004ec0ff.jpg/v1/fill/w_320,h_292,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/2735966afd054c0ebc69fc94004ec0ff.jpg',
//     },
//     {
//       name: 'Dr. Pierre Durand',
//       role: 'Chirurgienne',
//       quote: "L'interface intuitive réduit considérablement le temps administratif. Je peux me concentrer sur mes patients plutôt que sur la paperasse.",
//       avatar: 'https://img.freepik.com/photos-gratuite/portrait-chirurgienne-afro-americaine-heureuse-debout-dans-salle-operation-prete-travailler-patient-travailleuse-medicale-uniforme-chirurgical-salle-operation_657921-38.jpg?semt=ais_hybrid&w=740',
//     },
//     {
//       name: 'Luc Bernard',
//       role: "Directeur d'Hôpital",
//       quote: 'Sécurité et rapports automatisés au top niveau. Notre établissement a vu une amélioration de 30% dans la gestion des dossiers.',
//       avatar: 'https://www.afdb.org/sites/default/files/u100/adf50-yaounde_sanitation_project_pady-dr-paul-eloundou.jpg',
//     },
//   ];

//   const benefits = [
//     {
//       title: 'Sécurité Renforcée',
//       description: 'Protection des données conforme RGPD avec chiffrement de bout en bout',
//       icon: <ShieldOutlinedIcon />,
//       type: 'security',
//     },
//     {
//       title: 'Support 24/7',
//       description: 'Assistance technique disponible à tout moment pour vous accompagner',
//       icon: <SupportAgentOutlinedIcon />,
//       type: 'support',
//     },
//   ];

//   return (
//     <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white font-sans">
//       {/* Header */}
//       <header className="flex justify-between items-center p-4 bg-white shadow-md">
//         <div className="text-2xl font-bold text-blue-700">Ologo</div>
//         <nav className="space-x-4">
//           <Link to="/" className="text-blue-700 hover:text-blue-900">Home</Link>
//           <Link to="/about" className="text-blue-700 hover:text-blue-900">About</Link>
//           <Link to="/services" className="text-blue-700 hover:text-blue-900">Service</Link>
//           <Link to="/contact" className="text-blue-700 hover:text-blue-900">Contact Us</Link>
//           <Link to="/faq" className="text-blue-700 hover:text-blue-900">FAQ</Link>
//         </nav>
//       </header>

//       {/* Hero Section - Inspired by Online Doctor Consultation Image */}
//       <section className="relative py-16 px-4 text-center bg-blue-100">
//         <motion.div variants={fadeIn} initial="initial" animate="animate">
//           <div className="badge-container inline-flex items-center px-4 py-2 bg-blue-200 text-blue-700 rounded-full mb-4">
//             <AutoAwesomeIcon className="mr-2" />
//             <span className="text-sm font-semibold">PLATEFORME DE CONSULTATION</span>
//           </div>
//           <h1 className="text-4xl font-bold text-blue-700 mb-4">Online Doctor Consultation</h1>
//           <p className="text-gray-600 mb-6 max-w-md mx-auto">
//             Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat.
//           </p>
//           <Link to="/consult" className="inline-block bg-blue-600 text-white py-2 px-6 rounded-full hover:bg-blue-700 transition duration-300">
//             Get Started <ArrowForwardIcon className="ml-2" />
//           </Link>
//         </motion.div>
//         <div className="mt-8 flex justify-center items-center space-x-6">
//           <div className="w-1/3">
//             <img src={DoctorImage || 'https://via.placeholder.com/150'} alt="Doctor" className="rounded-lg shadow-md" />
//           </div>
//           <div className="w-1/3">
//             <img src="https://via.placeholder.com/150" alt="Patient" className="rounded-lg shadow-md" />
//           </div>
//         </div>
//         <div className="absolute bottom-4 right-4 flex space-x-2">
//           <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
//           <span className="w-2 h-2 bg-gray-300 rounded-full"></span>
//           <span className="w-2 h-2 bg-gray-300 rounded-full"></span>
//         </div>
//       </section>

//       {/* Features Section */}
//       <section className="py-12 px-4">
//         <div className="section-container max-w-6xl mx-auto">
//           <motion.div
//             initial="initial"
//             whileInView="animate"
//             viewport={{ once: true }}
//             variants={staggerContainer}
//           >
//             <div className="section-header text-center mb-8">
//               <motion.div variants={fadeIn}>
//                 <div className="badge-container inline-flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-full mb-4">
//                   <MedicalServicesOutlinedIcon className="mr-2" />
//                   <span className="text-sm font-semibold">Service</span>
//                 </div>
//                 <h2 className="text-3xl font-bold text-blue-700">
//                   Transformez Votre Pratique avec <span className="text-blue-600">Mayashare</span>
//                 </h2>
//                 <p className="text-gray-600 mt-2 max-w-xl mx-auto">
//                   Des outils puissants pour simplifier votre quotidien et améliorer l'expérience de vos patients.
//                 </p>
//               </motion.div>
//             </div>
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//               {features.map((feature, index) => (
//                 <motion.div variants={fadeIn} key={index}>
//                   <div className="card bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition duration-300">
//                     <div className="card-icon flex items-center justify-center w-16 h-16 bg-blue-100 text-blue-700 rounded-full mb-4">
//                       {feature.icon}
//                     </div>
//                     <h3 className="text-xl font-semibold text-blue-700 mb-2">{feature.title}</h3>
//                     <p className="text-gray-600">{feature.description}</p>
//                   </div>
//                 </motion.div>
//               ))}
//             </div>
//           </motion.div>
//         </div>
//       </section>

//       {/* About Section */}
//       <section className="py-12 px-4 bg-gray-100">
//         <div className="section-container max-w-6xl mx-auto">
//           <motion.div
//             initial="initial"
//             whileInView="animate"
//             viewport={{ once: true }}
//             variants={staggerContainer}
//           >
//             <div className="about-content flex flex-col md:flex-row items-center gap-8">
//               <div className="w-full md:w-1/2">
//                 <motion.div variants={fadeIn}>
//                   <img
//                     src={HospitalImage || 'https://via.placeholder.com/300'}
//                     alt="Hospital"
//                     className="rounded-lg shadow-md w-full"
//                   />
//                 </motion.div>
//               </div>
//               <div className="w-full md:w-1/2">
//                 <motion.div variants={fadeIn}>
//                   <div className="badge-container inline-flex items-center px-4 py-2 bg-green-100 text-green-700 rounded-full mb-4">
//                     <MedicalServicesOutlinedIcon className="mr-2" />
//                     <span className="text-sm font-semibold">À PROPOS</span>
//                   </div>
//                   <h2 className="text-3xl font-bold text-blue-700">
//                     Mayashare, Pensée pour les <span className="text-green-600">Experts Médicaux</span>
//                   </h2>
//                   <p className="text-gray-600 mt-4">
//                     Développée avec des professionnels de santé pour répondre aux exigences des cliniques modernes. Notre plateforme s'adapte à tous les types d'établissements médicaux.
//                   </p>
//                   {benefits.map((benefit, index) => (
//                     <div key={index} className="flex items-start gap-4 mt-6">
//                       <div className={`benefit-icon flex items-center justify-center w-12 h-12 bg-${benefit.type === 'security' ? 'blue-100' : 'green-100'} text-${benefit.type === 'security' ? 'blue-700' : 'green-700'} rounded-full`}>
//                         {benefit.icon}
//                       </div>
//                       <div>
//                         <h3 className="text-lg font-semibold text-blue-700">{benefit.title}</h3>
//                         <p className="text-gray-600">{benefit.description}</p>
//                       </div>
//                     </div>
//                   ))}
//                   <Link to="/about" className="mt-6 inline-flex items-center text-green-600 hover:text-green-700">
//                     En savoir plus <ArrowForwardIcon className="ml-2" />
//                   </Link>
//                 </motion.div>
//               </div>
//             </div>
//           </motion.div>
//         </div>
//       </section>

//       {/* Testimonials Section */}
//       <section className="py-12 px-4">
//         <div className="section-container max-w-6xl mx-auto">
//           <motion.div
//             initial="initial"
//             whileInView="animate"
//             viewport={{ once: true }}
//             variants={staggerContainer}
//           >
//             <div className="section-header text-center mb-8">
//               <motion.div variants={fadeIn}>
//                 <div className="badge-container inline-flex items-center px-4 py-2 bg-amber-100 text-amber-700 rounded-full mb-4">
//                   <StarIcon className="mr-2" />
//                   <span className="text-sm font-semibold">TÉMOIGNAGES</span>
//                 </div>
//                 <h2 className="text-3xl font-bold text-blue-700">
//                   Ce Qu'Ils Pensent de <span className="text-amber-600">Mayashare</span>
//                 </h2>
//                 <p className="text-gray-600 mt-2 max-w-xl mx-auto">
//                   Les retours de ceux qui utilisent notre plateforme au quotidien.
//                 </p>
//               </motion.div>
//             </div>
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//               {testimonials.map((testimonial, index) => (
//                 <motion.div variants={fadeIn} key={index}>
//                   <div className="card bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition duration-300">
//                     <div className="text-amber-500 flex space-x-1 mb-4">
//                       {Array(5).fill().map((_, i) => <StarIcon key={i} />)}
//                     </div>
//                     <p className="text-gray-600 italic mb-4">"{testimonial.quote}"</p>
//                     <hr className="border-gray-200 my-4" />
//                     <div className="flex items-center">
//                       <img
//                         src={testimonial.avatar || 'https://via.placeholder.com/50'}
//                         alt={testimonial.name}
//                         className="w-12 h-12 rounded-full mr-4"
//                       />
//                       <div>
//                         <h4 className="text-lg font-semibold text-blue-700">{testimonial.name}</h4>
//                         <p className="text-gray-600 text-sm">{testimonial.role}</p>
//                       </div>
//                     </div>
//                   </div>
//                 </motion.div>
//               ))}
//             </div>
//           </motion.div>
//         </div>
//       </section>

//       {/* CTA Section */}
//       <section className="py-16 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-center">
//         <motion.div variants={fadeIn} initial="initial" animate="animate">
//           <div className="badge-container inline-flex items-center px-4 py-2 bg-white/10 text-white rounded-full mb-4">
//             <AutoAwesomeIcon className="mr-2" />
//             <span className="text-sm font-semibold">Commencez Maintenant</span>
//           </div>
//           <h2 className="text-3xl font-bold mb-4">Révolutionnez Votre Pratique avec <span className="text-teal-200">Mayashare</span></h2>
//           <p className="mb-6 max-w-lg mx-auto">
//             Rejoignez les professionnels qui optimisent leur quotidien avec notre plateforme. Essayez gratuitement pendant 14 jours, sans engagement.
//           </p>
//           <div className="space-x-4">
//             <Link to="/register" className="inline-block bg-white text-blue-700 py-2 px-6 rounded-full hover:bg-gray-100 transition duration-300">
//               Commencer maintenant <ArrowForwardIcon className="ml-2" />
//             </Link>
//             <Link to="/demo" className="inline-block border-2 border-white text-white py-2 px-6 rounded-full hover:bg-white/10 transition duration-300">
//               Voir la démo
//             </Link>
//           </div>
//         </motion.div>
//       </section>
//     </div>
//   );
// }

// export default HomePage;

// import React from 'react';
// import { Link } from 'react-router-dom';
// import { motion } from 'framer-motion';
// import MedicalServicesOutlinedIcon from '@mui/icons-material/MedicalServicesOutlined';
// import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
// import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
// import InsightsOutlinedIcon from '@mui/icons-material/InsightsOutlined';
// import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
// import SupportAgentOutlinedIcon from '@mui/icons-material/SupportAgentOutlined';
// import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
// import StarIcon from '@mui/icons-material/Star';
// import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
// import DoctorImage from '../assets/doctor.jpg';
// import HospitalImage from '../assets/hospital.jpg';
// import './HomePage.css';

// function HomePage() {
//   const fadeIn = {
//     initial: { opacity: 0, y: 20 },
//     animate: {
//       opacity: 1,
//       y: 0,
//       transition: { duration: 0.6, ease: 'easeOut' },
//     },
//   };

//   const staggerContainer = {
//     animate: {
//       transition: {
//         staggerChildren: 0.1,
//       },
//     },
//   };

//   const features = [
//     {
//       icon: <MedicalServicesOutlinedIcon />,
//       title: 'Gestion des Patients',
//       description: 'Suivi optimisé des dossiers médicaux avec interface intuitive.',
//     },
//     {
//       icon: <PeopleAltOutlinedIcon />,
//       title: 'Gestion du Personnel',
//       description: 'Administration fluide du personnel médical.',
//     },
//     {
//       icon: <CalendarTodayOutlinedIcon />,
//       title: 'Planification',
//       description: 'Organisation simplifiée des rendez-vous.',
//     },
//     {
//       icon: <InsightsOutlinedIcon />,
//       title: 'Rapports',
//       description: 'Analyses et statistiques en temps réel.',
//     },
//   ];

//   const testimonials = [
//     {
//       name: 'Dr. Jean Martin',
//       role: 'Médecin Généraliste',
//       quote: "Une solution qui a transformé notre gestion quotidienne. L'interface intuitive et les fonctionnalités avancées nous font gagner un temps précieux.",
//       avatar: 'https://static.wixstatic.com/media/2735966afd054c0ebc69fc94004ec0ff.jpg/v1/fill/w_320,h_292,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/2735966afd054c0ebc69fc94004ec0ff.jpg',
//     },
//     {
//       name: 'Dr. Pierre Durand',
//       role: 'Chirurgienne',
//       quote: "L'interface intuitive réduit considérablement le temps administratif. Je peux me concentrer sur mes patients plutôt que sur la paperasse.",
//       avatar: 'https://img.freepik.com/photos-gratuite/portrait-chirurgienne-afro-americaine-heureuse-debout-dans-salle-operation-prete-travailler-patient-travailleuse-medicale-uniforme-chirurgical-salle-operation_657921-38.jpg?semt=ais_hybrid&w=740',
//     },
//     {
//       name: 'Luc Bernard',
//       role: "Directeur d'Hôpital",
//       quote: 'Sécurité et rapports automatisés au top niveau. Notre établissement a vu une amélioration de 30% dans la gestion des dossiers.',
//       avatar: 'https://www.afdb.org/sites/default/files/u100/adf50-yaounde_sanitation_project_pady-dr-paul-eloundou.jpg',
//     },
//   ];

//   const benefits = [
//     {
//       title: 'Sécurité Renforcée',
//       description: 'Protection des données conforme RGPD avec chiffrement de bout en bout',
//       icon: <ShieldOutlinedIcon />,
//       type: 'security',
//     },
//     {
//       title: 'Support 24/7',
//       description: 'Assistance technique disponible à tout moment pour vous accompagner',
//       icon: <SupportAgentOutlinedIcon />,
//       type: 'support',
//     },
//   ];

//   return (
//     <div className="hp-container">
//       {/* Header */}
//       <header className="hp-header">
//         <div className="hp-logo">MAYAShare +</div>
//         <nav className="hp-nav">
//           <Link to="/" className="hp-nav-link">Acceuil</Link>
//           <Link to="/about" className="hp-nav-link">A Propos</Link>
//           <Link to="/services" className="hp-nav-link">Service</Link>
//           <Link to="/contact" className="hp-nav-link">Contactez-nous</Link>
//           <Link to="/faq" className="hp-nav-link">FAQ</Link>
//         </nav>
//       </header>

//       {/* Hero Section */}
//       <section className="hp-hero">
//         <motion.div variants={fadeIn} initial="initial" animate="animate">
//           <div className="hp-badge">
//             <AutoAwesomeIcon className="mr-2" />
//             <span>PLATEFORME DE CONSULTATION</span>
//           </div>
//           <h1 className="hp-title">Get Appointment<br/>Easy And Fast</h1>
//           <p className="hp-text">
//             You can monitor and manage your business with the platform we will provide. 
//             You can monitor and manage your appointments efficiently.
//           </p>
//           <Link to="/consult" className="hp-button">
//             Get Started <ArrowForwardIcon className="ml-2" />
//           </Link>
//         </motion.div>
//         <div className="hp-dots">
//           <span></span>
//           <span></span>
//           <span></span>
//         </div>
//       </section>

//       {/* Stats Section - Inspired by your image */}
//       <section className="hp-stats">
//         <motion.div variants={fadeIn}>
//           <div className="stat-item">
//             <div className="stat-number">50k+</div>
//             <div className="stat-label">Happy Patients</div>
//           </div>
//           <div className="stat-item">
//             <div className="stat-number">350+</div>
//             <div className="stat-label">Specialist Doctors</div>
//           </div>
//           <div className="stat-item">
//             <div className="stat-number">98%</div>
//             <div className="stat-label">Success Rate</div>
//           </div>
//         </motion.div>
//       </section>

//       {/* Features Section */}
//       <section className="hp-features">
//         <div className="hp-section-container">
//           <motion.div
//             initial="initial"
//             whileInView="animate"
//             viewport={{ once: true }}
//             variants={staggerContainer}
//           >
//             <div className="hp-section-header">
//               <motion.div variants={fadeIn}>
//                 <div className="hp-badge">
//                   <MedicalServicesOutlinedIcon className="mr-2" />
//                   <span>FONCTIONNALITÉS</span>
//                 </div>
//                 <h2 className="hp-title">
//                 Transformez votre pratique avec <span>MAYAShare +</span>
//                 </h2>
//                 <p className="hp-text">
//                  Des outils puissants pour simplifier votre travail quotidien et améliorer l'expérience de vos patients.
//                 </p>
//               </motion.div>
//             </div>
//             <div className="hp-grid">
//               {features.map((feature, index) => (
//                 <motion.div variants={fadeIn} key={index}>
//                   <div className="hp-feature-card">
//                     <div className="hp-icon">
//                       {feature.icon}
//                     </div>
//                     <h3 className="hp-subtitle">{feature.title}</h3>
//                     <p className="hp-text">{feature.description}</p>
//                   </div>
//                 </motion.div>
//               ))}
//             </div>
//           </motion.div>
//         </div>
//       </section>

//       {/* About Section */}
//       <section className="hp-about">
//         <div className="hp-section-container">
//           <motion.div
//             initial="initial"
//             whileInView="animate"
//             viewport={{ once: true }}
//             variants={staggerContainer}
//           >
//             <div className="hp-about-content">
//               <div className="hp-image">
//                 <motion.div variants={fadeIn}>
//                   <img
//                     src={HospitalImage}
//                     alt="Modern hospital with state-of-the-art equipment"
//                     loading="lazy"
//                   />
//                 </motion.div>
//               </div>
//               <div className="hp-about-text">
//                 <motion.div variants={fadeIn}>
//                   <div className="hp-badge">
//                     <MedicalServicesOutlinedIcon className="mr-2" />
//                     <span>À PROPOS</span>
//                   </div>
//                   <h2 className="hp-title">
//                     Designed for <span>Medical Experts</span>
//                   </h2>
//                   <p className="hp-text">
//                     Developed with healthcare professionals to meet the requirements of modern clinics. 
//                     Our platform adapts to all types of medical facilities.
//                   </p>
//                   {benefits.map((benefit, index) => (
//                     <div key={index} className="hp-benefit">
//                       <div className={`hp-icon ${benefit.type}`}>
//                         {benefit.icon}
//                       </div>
//                       <div>
//                         <h3 className="hp-subtitle">{benefit.title}</h3>
//                         <p className="hp-text">{benefit.description}</p>
//                       </div>
//                     </div>
//                   ))}
//                   <Link to="/about" className="hp-link">
//                     Learn more <ArrowForwardIcon className="ml-2" />
//                   </Link>
//                 </motion.div>
//               </div>
//             </div>
//           </motion.div>
//         </div>
//       </section>

//       {/* Testimonials Section */}
//       <section className="hp-testimonials">
//         <div className="hp-section-container">
//           <motion.div
//             initial="initial"
//             whileInView="animate"
//             viewport={{ once: true }}
//             variants={staggerContainer}
//           >
//             <div className="hp-section-header">
//               <motion.div variants={fadeIn}>
//                 <div className="hp-badge">
//                   <StarIcon className="mr-2" />
//                   <span>TÉMOIGNAGES</span>
//                 </div>
//                 <h2 className="hp-title">
//                   What They Say About <span>MAYAShare +</span>
//                 </h2>
//                 <p className="hp-text">
//                   Feedback from those who use our platform daily.
//                 </p>
//               </motion.div>
//             </div>
//             <div className="hp-grid">
//               {testimonials.map((testimonial, index) => (
//                 <motion.div variants={fadeIn} key={index}>
//                   <div className="hp-testimonial-card">
//                     <div className="hp-stars">
//                       {Array(5).fill().map((_, i) => <StarIcon key={i} className="w-5 h-5" />)}
//                     </div>
//                     <p className="hp-text">"{testimonial.quote}"</p>
//                     <hr className="divider" />
//                     <div className="hp-testimonial-author">
//                       <img
//                         src={testimonial.avatar}
//                         alt={`Photo of ${testimonial.name}`}
//                         className="hp-avatar"
//                         loading="lazy"
//                       />
//                       <div>
//                         <h4 className="hp-subtitle">{testimonial.name}</h4>
//                         <p className="hp-text">{testimonial.role}</p>
//                       </div>
//                     </div>
//                   </div>
//                 </motion.div>
//               ))}
//             </div>
//           </motion.div>
//         </div>
//       </section>

//       {/* CTA Section */}
//       <section className="hp-cta">
//         <motion.div variants={fadeIn} initial="initial" animate="animate">
//           <div className="hp-badge">
//             <AutoAwesomeIcon className="mr-2" />
//             <span>GET STARTED</span>
//           </div>
//           <h2 className="hp-title">Revolutionize Your Practice with <span>MAYAShare +</span></h2>
//           <p className="hp-text">
//             Join the professionals who optimize their daily work with our platform. 
//             Try it free for 14 days, no commitment.
//           </p>
//           <div className="hp-buttons">
//             <Link to="/register" className="hp-button primary">
//               Get Started <ArrowForwardIcon className="ml-2" />
//             </Link>
//             <Link to="/demo" className="hp-button secondary">
//               See Demo
//             </Link>
//           </div>
//         </motion.div>
//       </section>
//     </div>
//   );
// }

import React, { useState, useEffect } from 'react';
import Navbar from '../Navbar/Navbar';
import './HomePage.css';

const HomePage = () => {
  const [activeFeature, setActiveFeature] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % 3);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    { icon: "🛡️", title: "Sécurisé", desc: "Chiffrement de bout en bout" },
    { icon: "👥", title: "Collaboratif", desc: "Travail d'équipe simplifié" },
    { icon: "⚡", title: "Temps réel", desc: "Synchronisation instantanée" }
  ];

  const stats = [
    { number: "+500", label: "Utilisateurs" },
    { number: "99.9%", label: "Disponibilité" },
    { number: "4.9/5", label: "Satisfaction" }
  ];

  return (
    <div className="hp-container">
      <Navbar />

      <section className="hp-hero">
        <div className="hp-hero-content">
          <div className="hp-hero-badge">Nouveau</div>
          <h1 className="hp-hero-title">
            Bienvenue sur{' '}
            <span className="hp-hero-title-highlight">MAYAShare +</span>
          </h1>
          <p className="hp-hero-subtitle">
            Une solution intuitive et sécurisée pour révolutionner la collaboration entre professionnels de santé
          </p>
          <div className="hp-hero-cta">
            <a href="#" className="hp-hero-button">
              Commencer maintenant <span className="hp-hero-arrow">→</span>
            </a>
          </div>
        </div>
      </section>

      <section className="hp-features">
        <div className="hp-features-grid">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`hp-feature-card ${index === activeFeature ? 'active' : ''}`}
            >
              <div className="hp-feature-icon">{feature.icon}</div>
              <h3 className="hp-feature-title">{feature.title}</h3>
              <p className="hp-feature-desc">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="hp-stats">
        <div className="hp-stats-grid">
          {stats.map((stat, index) => (
            <div key={index}>
              <div className="hp-stat-number">{stat.number}</div>
              <p className="hp-stat-label">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="hp-cta">
        <div className="hp-cta-content">
          <div className="hp-cta-card">
            <h2 className="hp-cta-title">
              Rejoignez{' '}
              <span className="hp-cta-title-highlight">la révolution médicale</span>
            </h2>
            <p className="hp-cta-subtitle">
              Inscrivez-vous gratuitement et commencez à gérer votre cabinet en toute sérénité
            </p>
            <div className="hp-cta-buttons">
              <a href="/register" className="hp-cta-primary">
                <span>✓</span> Créer un compte
              </a>
              <a href="/login" className="hp-cta-secondary">
                Se connecter <span className="hp-cta-arrow">→</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      <footer className="hp-footer">
        <div className="hp-footer-content">
          <p>© 2025 MAYAShare +. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
