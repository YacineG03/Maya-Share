/* eslint-disable prettier/prettier */
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
});

console.log("URL de base de l'API :", api.defaults.baseURL);

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  const isAuthRequest =
    config.url.includes('/auth/register') || config.url.includes('/auth/login');
  if (token && !isAuthRequest) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  console.log('Requête envoyée:', config);
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Erreur de réponse:', {
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url,
    });
    return Promise.reject(error);
  }
);

// Authentification
export const login = (email, motDePasse) =>
  api.post('/auth/login', { email, motDePasse });

export const register = (data) =>
  api.post('/auth/register', {
    nom: data.nom,
    prenom: data.prenom,
    email: data.email,
    motDePasse: data.motDePasse,
    telephone: data.telephone,
  });

export const getUserInfo = () => api.get('/auth/me');

// Utilisateurs
export const getUsers = (filters) =>
  api.get('/users', {
    params: filters,
  });

export const getUserById = (id) => api.get(`/users/${id}`);

export const createUser = (data) => api.post('/users', data);

export const updateUser = (id, data) => api.put(`/users/${id}`, data);

export const deleteUser = (id) => api.delete(`/users/${id}`);

// Images
export const uploadImage = (formData) =>
  api.post('/images', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const getImages = () => api.get('/images');

export const getImageById = (id) => api.get(`/images/${id}`);

export const getImagesByUser = () => api.get('/images/user');

export const getImagesByDossier = (idDossier) =>
  api.get(`/images/dossier/${idDossier}`);

export const getImage = (id) => api.get(`/images/${id}`);

export const deleteImage = (id) => api.delete(`/images/${id}`);

// WADO
export const getWadoUrl = (instanceId) =>
  api.get('/images/wado', {
    params: { requestType: 'WADO', instanceId },
  });

// Partages
export const shareDossier = (idDossier, data) => api.post('/shares/dossier', data);

export const getShares = () => api.get('/shares');

export const getShareById = (id) => api.get(`/shares/${id}`);

export const deleteShare = (id) => api.delete(`/shares/${id}`);

// Agendas partagés
export const getSharedAgendas = () => api.get('/rendezvous/shared-agendas');

export const getSharedAgendasForInfirmier = () => api.get('/rendezvous/shared-agendas/infirmier');

export const getMedecinRendezVous = (idMedecin, dateDebut, dateFin) =>
  api.get('/rendezvous/medecin-rendezvous', {
    params: { idMedecin, dateDebut, dateFin },
  });

export const getRendezVousByMedecinForInfirmier = (params = {}) => {
  const { idPartage, dateDebut, dateFin } = params;
  if (!idPartage) {
    throw new Error('idPartage est requis');
  }
  return api.get('/rendezvous/medecin-rendezvous/infirmier', {
    params: { idPartage, dateDebut, dateFin },
  });
};

// Traçabilité
export const getTraces = () => api.get('/traces');

export const getTraceById = (id) => api.get(`/traces/${id}`);

// Dossiers médicaux
export const createDossier = (data) => api.post('/dossiers', data);

export const getDossiers = () => api.get('/dossiers/medecin');

export const getDossiersForInfirmier = () => api.get('/dossiers/infirmier');

export const getDossiersByPatient = () => api.get('/dossiers/patient');

export const getDossierById = (id) => api.get(`/dossiers/${id}`);

export const updateDossier = (id, data) => api.put(`/dossiers/${id}`, data);

export const deleteDossier = (id) => api.delete(`/dossiers/${id}`);

// Consultations
export const createConsultation = (data) => api.post('/consultations', data);

export const getConsultationsByDossier = (idDossier) =>
  api.get(`/consultations/dossier/${idDossier}`);

export const updateConsultation = (idConsultation, data) => api.put(`/consultations/${idConsultation}`, data);

// Rendez-vous
export const createRendezVous = (data) => api.post('/rendezvous', data);

export const getRendezVous = () => api.get('/rendezvous');

export const getRendezVousById = (id) => api.get(`/rendezvous/${id}`);

export const getRendezVousByPatient = () => api.get('/rendezvous/patient');

export const getRendezVousByMedecin = () => api.get('/rendezvous/medecin');

export const getRendezVousForInfirmier = () => api.get('/rendezvous/infirmier');

export const updateRendezVous = (id, data) =>
  api.put(`/rendezvous/${id}/cancel`, data);

export const acceptRendezVous = (id, data) =>
  api.put(`/rendezvous/${id}/accept`, data);

export const declineRendezVous = (id, data) =>
  api.put(`/rendezvous/${id}/decline`, data);

export const assignRendezVousToInfirmier = (id, data) =>
  api.put(`/rendezvous/${id}/assign`, data);

export const cancelRendezVous = (id, data) =>
  api.put(`/rendezvous/${id}/cancel`, data);

export const shareAgenda = (data) => api.post('/rendezvous/share', data);

// Hôpitaux
export const getHopitaux = () => api.get('/hopitaux');

export const getHopitalById = (id) => api.get(`/hopitaux/${id}`);

export const createHopital = (data) => api.post('/hopitaux', data);

export const updateHopital = (id, data) => api.put(`/hopitaux/${id}`, data);

export const deleteHopital = (id) => api.delete(`/hopitaux/${id}`);

// Fichiers
export const getFile = async (fileName) => {
  const response = await api.get(`/uploads/${fileName}`, {
    responseType: 'blob',
  });
  return response.data;
};

export default api;