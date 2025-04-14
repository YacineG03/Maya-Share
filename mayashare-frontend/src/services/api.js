// src/services/api.js
import axios from "axios";

// Création d'une instance axios avec l'URL de base
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000/api",
  withCredentials: true,
});

// Log de l'URL de base pour déboguer
console.log("URL de base de l'API :", api.defaults.baseURL);

// Intercepteur pour ajouter le token JWT à chaque requête (sauf pour auth)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  const isAuthRequest = config.url.includes("/auth/register") || config.url.includes("/auth/login");
  if (token && !isAuthRequest) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  console.log("Requête envoyée:", config); // Log pour déboguer
  return config;
});

// Fonctions pour l'authentification
export const login = (email, motDePasse) =>
  api.post("/auth/login", { email, motDePasse });

export const register = (data) =>
  api.post("/auth/register", {
    nom: data.nom,
    prenom: data.prenom,
    email: data.email,
    motDePasse: data.motDePasse,
    telephone: data.telephone,
  });

export const getUserInfo = () => api.get("/auth/me");

// Fonctions pour la gestion des utilisateurs
export const getUsers = (filters) =>
  api.get("/users", {
    params: filters,
  });

export const getUserById = (id) => api.get(`/users/${id}`);

export const createUser = (data) => api.post("/users", data);

export const updateUser = (id, data) => api.put(`/users/${id}`, data);

export const deleteUser = (id) => api.delete(`/users/${id}`);

// Fonctions pour la gestion des images
export const uploadImage = (formData) =>
  api.post("/images", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const getImages = () => api.get("/images");

export const getImageById = (id) => api.get(`/images/${id}`);

export const deleteImage = (id) => api.delete(`/images/${id}`);

// Fonctions pour la gestion des partages
export const shareDossier = (data) => api.post("/shares", data);

export const getShares = () => api.get("/shares");

export const getShareById = (id) => api.get(`/shares/${id}`);

export const deleteShare = (id) => api.delete(`/shares/${id}`);

// Fonctions pour la traçabilité
export const getTraces = () => api.get("/traces");

export const getTraceById = (id) => api.get(`/traces/${id}`);

// Fonctions pour la gestion des dossiers médicaux
export const createDossier = (data) => api.post("/dossiers", data);

export const getDossiers = () => api.get("/dossiers");

export const getDossierById = (id) => api.get(`/dossiers/${id}`);

export const updateDossier = (id, data) => api.put(`/dossiers/${id}`, data);

export const deleteDossier = (id) => api.delete(`/dossiers/${id}`);

// Fonctions pour la gestion des rendez-vous
export const createRendezVous = (data) => api.post("/rendezvous", data);

export const getRendezVous = () => api.get("/rendezvous");

export const getRendezVousById = (id) => api.get(`/rendezvous/${id}`);

export const updateRendezVous = (id, data) => api.put(`/rendezvous/${id}`, data);

export const deleteRendezVous = (id) => api.delete(`/rendezvous/${id}`);

// Fonctions pour la gestion des hôpitaux
export const getHopitaux = () => api.get("/hopitaux");

export const getHopitalById = (id) => api.get(`/hopitaux/${id}`);

export const createHopital = (data) => api.post("/hopitaux", data);

export const updateHopital = (id, data) => api.put(`/hopitaux/${id}`, data);

export const deleteHopital = (id) => api.delete(`/hopitaux/${id}`);

// Fonction pour récupérer des fichiers (images, dossiers, etc.)
export const getFile = async (fileName) => {
  const response = await api.get(`/uploads/${fileName}`, {
    responseType: "blob",
  });
  return response.data;
};

export default api;