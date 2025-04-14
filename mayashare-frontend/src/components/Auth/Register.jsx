import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { register } from "../../services/api";
import {
  Box,
  Button,
  TextField,
  Typography,
  Grid,
  Link,
  Alert,
  CircularProgress,
  Container,
  InputAdornment,
  IconButton,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import HowToRegIcon from "@mui/icons-material/HowToReg";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

function Register() {
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    telephone: "",
    email: "",
    motDePasse: "",
    confirmMotDePasse: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [completed, setCompleted] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleClickShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const validateForm = () => {
    if (!formData.prenom.trim()) {
      setError("Le prénom est requis");
      return false;
    }
    if (!formData.nom.trim()) {
      setError("Le nom est requis");
      return false;
    }
    if (!formData.telephone.trim()) {
      setError("Le numéro de téléphone est requis");
      return false;
    }
    if (!/^\+?[1-9]\d{1,14}$/.test(formData.telephone)) {
      setError("Numéro de téléphone invalide");
      return false;
    }
    if (!formData.email.trim()) {
      setError("L'email est requis");
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError("Format d'email invalide");
      return false;
    }
    if (!formData.motDePasse) {
      setError("Le mot de passe est requis");
      return false;
    }
    if (formData.motDePasse.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères");
      return false;
    }
    if (formData.motDePasse !== formData.confirmMotDePasse) {
      setError("Les mots de passe ne correspondent pas");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError("");

    try {
      const { confirmMotDePasse, ...dataToSend } = formData;
      console.log("Données envoyées :", dataToSend); // Débogage
      await register(dataToSend);
      setCompleted(true);
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err) {
      console.error("Erreur complète :", err); // Débogage
      setError(err.response?.data?.message || "Erreur lors de l'inscription.");
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        height: "100vh",
        width: "100vw",
        margin: 0,
        padding: 0,
        position: "absolute",
        top: 0,
        left: 0,
        overflow: "hidden",
        background: "linear-gradient(135deg, #1C2526 0%, #2C3E50 100%)",
      }}
    >
      <Grid container sx={{ height: "100%", width: "100%", margin: 0, padding: 0 }}>
        {/* Partie gauche : Formulaire */}
        <Grid
          item
          xs={12}
          md={6}
          sx={{
            backgroundColor: "rgba(28, 37, 38, 0.95)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            padding: { xs: 3, md: 6 },
            height: "100%",
            boxSizing: "border-box",
          }}
        >
          <Container maxWidth="sm">
            <Box sx={{ display: "flex", justifyContent: "center", mb: 4 }}>
              <LocalHospitalIcon sx={{ fontSize: 50, color: "#7C4DFF" }} />
            </Box>

            <Typography
              variant="h3"
              color="#FFFFFF"
              gutterBottom
              sx={{
                textAlign: "center",
                fontSize: { xs: "1.8rem", md: "2.5rem" },
                fontWeight: "bold",
              }}
            >
              Inscription Patient
            </Typography>

            <Typography
              variant="body1"
              color="#B0BEC5"
              gutterBottom
              sx={{
                textAlign: "center",
                fontSize: { xs: "0.875rem", md: "1rem" },
                mb: 4,
              }}
            >
              Créez votre compte pour gérer vos dossiers médicaux
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                {error}
              </Alert>
            )}

            <Box
              component="form"
              onSubmit={handleSubmit}
              sx={{
                width: "100%",
                display: "flex",
                flexDirection: "column",
                gap: 3,
              }}
            >
              {completed ? (
                <Box sx={{ textAlign: "center" }}>
                  <CheckCircleIcon
                    sx={{ fontSize: 80, color: "#4CAF50", mb: 2 }}
                  />
                  <Typography
                    variant="h5"
                    color="#FFFFFF"
                    sx={{ mb: 2 }}
                  >
                    Inscription réussie !
                  </Typography>
                  <Typography variant="body1" color="#B0BEC5">
                    Redirection vers la connexion...
                  </Typography>
                </Box>
              ) : (
                <>
                  <TextField
                    fullWidth
                    label="Prénom"
                    variant="outlined"
                    name="prenom"
                    value={formData.prenom}
                    onChange={handleChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonIcon sx={{ color: "#7C4DFF" }} />
                        </InputAdornment>
                      ),
                    }}
                    InputLabelProps={{ style: { color: "#B0BEC5" } }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        "& fieldset": {
                          borderColor: "rgba(176, 190, 197, 0.3)",
                        },
                        "&:hover fieldset": {
                          borderColor: "rgba(124, 77, 255, 0.5)",
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: "#7C4DFF",
                        },
                        backgroundColor: "rgba(44, 47, 51, 0.7)",
                        borderRadius: "12px",
                      },
                      "& .MuiInputBase-input": { color: "#FFFFFF" },
                    }}
                    required
                  />
                  <TextField
                    fullWidth
                    label="Nom"
                    variant="outlined"
                    name="nom"
                    value={formData.nom}
                    onChange={handleChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonIcon sx={{ color: "#7C4DFF" }} />
                        </InputAdornment>
                      ),
                    }}
                    InputLabelProps={{ style: { color: "#B0BEC5" } }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        "& fieldset": {
                          borderColor: "rgba(176, 190, 197, 0.3)",
                        },
                        "&:hover fieldset": {
                          borderColor: "rgba(124, 77, 255, 0.5)",
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: "#7C4DFF",
                        },
                        backgroundColor: "rgba(44, 47, 51, 0.7)",
                        borderRadius: "12px",
                      },
                      "& .MuiInputBase-input": { color: "#FFFFFF" },
                    }}
                    required
                  />
                  <TextField
                    fullWidth
                    label="Téléphone"
                    variant="outlined"
                    name="telephone"
                    value={formData.telephone}
                    onChange={handleChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PhoneIcon sx={{ color: "#7C4DFF" }} />
                        </InputAdornment>
                      ),
                    }}
                    InputLabelProps={{ style: { color: "#B0BEC5" } }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        "& fieldset": {
                          borderColor: "rgba(176, 190, 197, 0.3)",
                        },
                        "&:hover fieldset": {
                          borderColor: "rgba(124, 77, 255, 0.5)",
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: "#7C4DFF",
                        },
                        backgroundColor: "rgba(44, 47, 51, 0.7)",
                        borderRadius: "12px",
                      },
                      "& .MuiInputBase-input": { color: "#FFFFFF" },
                    }}
                    required
                  />
                  <TextField
                    fullWidth
                    label="Email"
                    variant="outlined"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailIcon sx={{ color: "#7C4DFF" }} />
                        </InputAdornment>
                      ),
                    }}
                    InputLabelProps={{ style: { color: "#B0BEC5" } }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        "& fieldset": {
                          borderColor: "rgba(176, 190, 197, 0.3)",
                        },
                        "&:hover fieldset": {
                          borderColor: "rgba(124, 77, 255, 0.5)",
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: "#7C4DFF",
                        },
                        backgroundColor: "rgba(44, 47, 51, 0.7)",
                        borderRadius: "12px",
                      },
                      "& .MuiInputBase-input": { color: "#FFFFFF" },
                    }}
                    required
                  />
                  <TextField
                    fullWidth
                    label="Mot de passe"
                    variant="outlined"
                    type={showPassword ? "text" : "password"}
                    name="motDePasse"
                    value={formData.motDePasse}
                    onChange={handleChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon sx={{ color: "#7C4DFF" }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={handleClickShowPassword}
                            edge="end"
                            sx={{ color: "#B0BEC5" }}
                          >
                            {showPassword ? (
                              <VisibilityOff />
                            ) : (
                              <Visibility />
                            )}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    InputLabelProps={{ style: { color: "#B0BEC5" } }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        "& fieldset": {
                          borderColor: "rgba(176, 190, 197, 0.3)",
                        },
                        "&:hover fieldset": {
                          borderColor: "rgba(124, 77, 255, 0.5)",
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: "#7C4DFF",
                        },
                        backgroundColor: "rgba(44, 47, 51, 0.7)",
                        borderRadius: "12px",
                      },
                      "& .MuiInputBase-input": { color: "#FFFFFF" },
                    }}
                    required
                  />
                  <TextField
                    fullWidth
                    label="Confirmer le mot de passe"
                    variant="outlined"
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmMotDePasse"
                    value={formData.confirmMotDePasse}
                    onChange={handleChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon sx={{ color: "#7C4DFF" }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={handleClickShowConfirmPassword}
                            edge="end"
                            sx={{ color: "#B0BEC5" }}
                          >
                            {showConfirmPassword ? (
                              <VisibilityOff />
                            ) : (
                              <Visibility />
                            )}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    InputLabelProps={{ style: { color: "#B0BEC5" } }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        "& fieldset": {
                          borderColor: "rgba(176, 190, 197, 0.3)",
                        },
                        "&:hover fieldset": {
                          borderColor: "rgba(124, 77, 255, 0.5)",
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: "#7C4DFF",
                        },
                        backgroundColor: "rgba(44, 47, 51, 0.7)",
                        borderRadius: "12px",
                      },
                      "& .MuiInputBase-input": { color: "#FFFFFF" },
                    }}
                    required
                  />
                </>
              )}
            </Box>

            {!completed && (
              <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                  startIcon={loading ? null : <HowToRegIcon />}
                  sx={{
                    backgroundColor: "#7C4DFF",
                    borderRadius: "12px",
                    px: 3,
                    py: 1.2,
                    color: "#fff",
                    "&:hover": { backgroundColor: "#6a3de8" },
                  }}
                  onClick={handleSubmit}
                >
                  {loading ? (
                    <CircularProgress size={24} sx={{ color: "#fff" }} />
                  ) : (
                    "S'inscrire"
                  )}
                </Button>
              </Box>
            )}

            <Typography
              variant="body2"
              color="#B0BEC5"
              sx={{ mt: 4, textAlign: "center" }}
            >
              Vous avez déjà un compte ?{" "}
              <Link
                href="/login"
                underline="hover"
                color="#7C4DFF"
                onClick={(e) => {
                  e.preventDefault();
                  navigate("/login");
                }}
              >
                Connectez-vous !
              </Link>
            </Typography>
          </Container>
        </Grid>

        {/* Partie droite : Illustration */}
        <Grid
          item
          xs={12}
          md={6}
          sx={{
            background:
              "linear-gradient(135deg, #7C4DFF 0%, #5e35b1 100%)",
            display: { xs: "none", md: "flex" },
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            padding: { xs: 2, md: 6 },
            height: "100%",
            textAlign: "center",
            boxSizing: "border-box",
          }}
        >
          <Container maxWidth="md">
            <Typography
              variant="h2"
              color="#FFFFFF"
              gutterBottom
              sx={{
                fontSize: { xs: "1.8rem", md: "3rem" },
                fontWeight: "bold",
              }}
            >
              Bienvenue sur Votre Portail Santé
            </Typography>
            <Typography
              variant="h6"
              color="#E0E0E0"
              gutterBottom
              sx={{ fontSize: { xs: "0.9rem", md: "1.2rem" }, mb: 6 }}
            >
              Inscrivez-vous pour gérer vos rendez-vous et dossiers
              médicaux en toute simplicité.
            </Typography>
            <Box
              component="img"
              src="https://via.placeholder.com/400x300"
              alt="Illustration Santé"
              sx={{ maxWidth: "100%", mt: 2 }}
            />
          </Container>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Register;