import React, { useState } from 'react';
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from 'react-router-dom';
import { login } from './services/api';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import PatientDashboard from './components/Patient/PatientDashboard';
import InfirmierDashboard from './components/Infirmier/InfirmierDashboard';
import MedecinDashboard from './components/Medecin/MedecinDashboard';
import AdminDashboard from './components/Admin/AdminDashboard';
import HomePage from './components/HomePage/HomePage';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Fonction pour normaliser les chaînes (supprimer les accents et passer en minuscules)
const normalizeString = (str) => {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, ''); // Supprime les accents
};

function App() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isAuthenticated = !!localStorage.getItem('token');
  const role = localStorage.getItem('role');

  console.log('Utilisateur authentifié :', isAuthenticated);
  console.log('Rôle actuel dans localStorage :', role);

  const mapRoleToFrontend = (backendRole) => {
    const normalizedBackendRole = normalizeString(backendRole || '');
    const roleMap = {
      infirmier: 'infirmier',
      patient: 'patient',
      medecin: 'medecin',
      admin: 'admin',
    };
    console.log('Rôle backend brut :', backendRole);
    console.log('Rôle backend normalisé :', normalizedBackendRole);
    const mappedRole = roleMap[normalizedBackendRole] || 'unknown'; // Rôle par défaut si non reconnu
    console.log('Rôle mappé :', mappedRole);
    return mappedRole;
  };

  const handleLoginSubmit = async (formData, navigate) => {
    setLoading(true);
    setError('');

    try {
      const response = await login(formData.email, formData.motDePasse);
      console.log("Réponse de l'API:", response);

      if (response.data.token) {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.setItem('token', response.data.token);
        const backendRole = response.data.user?.role || 'unknown';
        const userRole = mapRoleToFrontend(backendRole);

        // Vérifier si le rôle est reconnu avant de rediriger
        if (userRole === 'unknown') {
          setError(
            "Votre rôle n'est pas reconnu dans le système. Veuillez contacter l'administrateur."
          );
          setLoading(false);
          localStorage.removeItem('token'); // Supprime le token pour éviter un état incohérent
          localStorage.removeItem('role');
          setTimeout(() => {
            navigate('/login'); // Redirige vers /login
          }, 300);
          return; // Arrête l'exécution ici
        }

        localStorage.setItem('role', userRole);
        console.log('Rôle stocké dans localStorage (après mappage):', userRole);
        console.log(
          'Token stocké dans localStorage:',
          localStorage.getItem('token')
        );

        setLoading(false);
        setError('');

        setTimeout(() => {
          console.log('Redirection vers /dashboard...');
          navigate('/dashboard');
        }, 300);
      } else {
        setError(
          'Connexion réussie, mais aucun token reçu. Veuillez réessayer.'
        );
        setLoading(false);
        setTimeout(() => {
          navigate('/login');
        }, 300);
      }
    } catch (err) {
      console.error('Erreur complète:', err);
      console.log('Erreur réponse:', err.response);
      setError(
        err.response?.data?.message ||
          'Une erreur est survenue lors de la connexion. Veuillez réessayer.'
      );
      setLoading(false);
    }
  };

  return (
    <Router>
      <ToastContainer
        position='top-right'
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <Routes>
        <Route
          path='/login'
          element={
            <Login
              onSubmit={handleLoginSubmit}
              error={error}
              loading={loading}
            />
          }
        />
        <Route path='/register' element={<Register />} />
        <Route path='/home' element={<HomePage />} />
        <Route
          path='/dashboard'
          element={
            isAuthenticated ? (
              role === 'patient' ? (
                <PatientDashboard />
              ) : role === 'medecin' ? (
                <MedecinDashboard />
              ) : role === 'infirmier' ? (
                <InfirmierDashboard />
              ) : role === 'admin' ? (
                <AdminDashboard />
              ) : (
                <Navigate to='/login' /> // Si le rôle n'est pas reconnu, redirige vers /login
              )
            ) : (
              <Navigate to='/login' />
            )
          }
        />
        <Route
          path='/dashboard/dossiers'
          element={
            isAuthenticated ? (
              role === 'patient' ||
              role === 'medecin' ||
              role === 'infirmier' ? (
                <div>Section Dossiers Médicaux (à implémenter)</div>
              ) : (
                <Navigate to='/login' />
              )
            ) : (
              <Navigate to='/login' />
            )
          }
        />
        <Route
          path='/dashboard/users'
          element={
            isAuthenticated && role === 'admin' ? (
              <div>Section Gestion des Utilisateurs (à implémenter)</div>
            ) : (
              <Navigate to='/login' />
            )
          }
        />
        <Route
          path='/dashboard/rendezvous'
          element={
            isAuthenticated ? (
              role === 'patient' ||
              role === 'medecin' ||
              role === 'infirmier' ||
              role === 'admin' ? (
                <div>Section Rendez-vous (à implémenter)</div>
              ) : (
                <Navigate to='/login' />
              )
            ) : (
              <Navigate to='/login' />
            )
          }
        />
        <Route path='/' element={<Navigate to='/home' />} />
      </Routes>
    </Router>
  );
}

export default App;
