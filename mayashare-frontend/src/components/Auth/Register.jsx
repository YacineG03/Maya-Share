/* eslint-disable prettier/prettier */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Register.css';

const Register = ({ onSubmit, error, loading }) => {
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    telephone: '',
    email: '',
    motDePasse: '',
    confirmMotDePasse: '',
  });
  const [localError, setLocalError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [animationComplete, setAnimationComplete] = useState(false);
  const navigate = useNavigate();

  // Réinitialiser l'état local lorsque le composant est monté
  useEffect(() => {
    setFormData({
      nom: '',
      prenom: '',
      telephone: '',
      email: '',
      motDePasse: '',
      confirmMotDePasse: '',
    });
    setLocalError('');
    setShowPassword(false);
    setShowConfirmPassword(false);
    setCompleted(false);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimationComplete(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (localError) setLocalError('');
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleClickShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const validateForm = () => {
    if (!formData.prenom.trim()) {
      setLocalError('Le prénom est requis');
      return false;
    }
    if (!formData.nom.trim()) {
      setLocalError('Le nom est requis');
      return false;
    }
    if (!formData.telephone.trim()) {
      setLocalError('Le numéro de téléphone est requis');
      return false;
    }
    if (!/^\+?[1-9]\d{1,14}$/.test(formData.telephone)) {
      setLocalError('Numéro de téléphone invalide');
      return false;
    }
    if (!formData.email.trim()) {
      setLocalError("L'email est requis");
      return false;
    }
    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(formData.email)) {
      setLocalError("Format d'email invalide");
      return false;
    }
    if (!formData.motDePasse) {
      setLocalError('Le mot de passe est requis');
      return false;
    }
    if (formData.motDePasse.length < 6) {
      setLocalError('Le mot de passe doit contenir au moins 6 caractères');
      return false;
    }
    if (formData.motDePasse !== formData.confirmMotDePasse) {
      setLocalError('Les mots de passe ne correspondent pas');
      return false;
    }
    return true;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLocalError('');

    try {
      const { confirmMotDePasse, ...dataToSend } = formData;
      console.log('Données envoyées :', dataToSend);
      
      if (onSubmit) {
        await onSubmit(dataToSend, navigate);
      }
      
      setCompleted(true);
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (err) {
      console.error('Erreur complète :', err);
      setLocalError(err.response?.data?.message || "Erreur lors de l'inscription.");
    }
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  return (
    <div className="register-container">
      <div className="register-grid">
        {/* Partie gauche : Formulaire d'inscription */}
        <div className="register-form-section">
          <div className="register-form-container">
            <div className="register-logo">
              <div className="logo-icon">🏥</div>
            </div>

            <div className="register-header">
              <h1 className="register-title">Inscription Patient</h1>
              <p className="register-subtitle">
                Créez votre compte pour gérer vos dossiers médicaux
              </p>
            </div>

            {(localError || error) && (
              <div className="register-error">
                <span className="error-icon">⚠️</span>
                {localError || error}
              </div>
            )}

            {completed ? (
              <div className="success-message">
                <div className="success-icon">✅</div>
                <h2 className="success-title">Inscription réussie !</h2>
                <p className="success-subtitle">Redirection vers la connexion...</p>
              </div>
            ) : (
              <form onSubmit={handleFormSubmit} className="register-form">
                <div className="form-row">
                  <div className="form-group">
                    <div className="input-container">
                      <span className="input-icon">👤</span>
                      <input
                        type="text"
                        name="prenom"
                        value={formData.prenom}
                        onChange={handleChange}
                        placeholder="Entrez votre prénom"
                        className="form-input"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <div className="input-container">
                      <span className="input-icon">👤</span>
                      <input
                        type="text"
                        name="nom"
                        value={formData.nom}
                        onChange={handleChange}
                        placeholder="Entrez votre nom"
                        className="form-input"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <div className="input-container">
                    <span className="input-icon">📱</span>
                    <input
                      type="tel"
                      name="telephone"
                      value={formData.telephone}
                      onChange={handleChange}
                      placeholder="Entrez votre téléphone"
                      className="form-input"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <div className="input-container">
                    <span className="input-icon">📧</span>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Entrez votre email"
                      className="form-input"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <div className="input-container">
                    <span className="input-icon">🔒</span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="motDePasse"
                      value={formData.motDePasse}
                      onChange={handleChange}
                      placeholder="Entrez votre mot de passe"
                      className="form-input"
                      required
                    />
                    <button
                      type="button"
                      onClick={handleClickShowPassword}
                      className="password-toggle"
                    >
                      {showPassword ? '👁️' : '👁️‍🗨️'}
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <div className="input-container">
                    <span className="input-icon">🔒</span>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmMotDePasse"
                      value={formData.confirmMotDePasse}
                      onChange={handleChange}
                      placeholder="Confirmez votre mot de passe"
                      className="form-input"
                      required
                    />
                    <button
                      type="button"
                      onClick={handleClickShowConfirmPassword}
                      className="password-toggle"
                    >
                      {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="register-button"
                >
                  {loading ? (
                    <div className="loading-spinner"></div>
                  ) : (
                    <>
                      <span className="button-icon">📝</span>
                      S'inscrire
                    </>
                  )}
                </button>

                <div className="login-link">
                  Vous avez déjà un compte ?{' '}
                  <a
                    href="/login"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate('/login');
                    }}
                    className="login-link-text"
                  >
                    Connectez-vous !
                  </a>
                </div>

                {/* Bouton Retour à l'accueil */}
                <button
                  type="button"
                  onClick={handleBackToHome}
                  className="back-to-home-button"
                >
                  ← Retour à l'accueil
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Partie droite : Slogan et illustration */}
        <div className="register-hero-section">
          <div className="hero-content">
            <div className="hero-badge">
              <span className="badge-dot"></span>
              Nouveau
            </div>
            
            <h2 className="hero-title">
              Bienvenue sur Votre{' '}
              <span className="hero-title-highlight">Portail Santé</span>
            </h2>
            
            <p className="hero-subtitle">
              Inscrivez-vous pour gérer vos rendez-vous et dossiers médicaux
              en toute simplicité avec MAYAShare+
            </p>

            <div className="hero-features">
              {['Sécurisé', 'Rapide', 'Intuitif'].map((feature, index) => (
                <div key={index} className="feature-chip">
                  {feature}
                </div>
              ))}
            </div>

            <div className="hero-illustration">
              <div className="medical-icons">
                <div className="medical-icon">🏥</div>
                <div className="medical-icon">🩺</div>
                <div className="medical-icon">📋</div>
                <div className="medical-icon">💊</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;