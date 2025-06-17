/* eslint-disable prettier/prettier */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const Login = ({ onSubmit, error, loading }) => {
  const [formData, setFormData] = useState({
    email: '',
    motDePasse: '',
  });
  const [localError, setLocalError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [animationComplete, setAnimationComplete] = useState(false);
  const navigate = useNavigate();

  // Réinitialiser l'état local lorsque le composant est monté
  useEffect(() => {
    setFormData({ email: '', motDePasse: '' });
    setLocalError('');
    setShowPassword(false);
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

  const validateForm = () => {
    if (!formData.email.trim()) {
      setLocalError("L'email est requis");
      return false;
    }
    if (
      !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(formData.email)
    ) {
      setLocalError("Format d'email invalide");
      return false;
    }
    if (!formData.motDePasse) {
      setLocalError('Le mot de passe est requis');
      return false;
    }
    return true;
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    onSubmit(formData, navigate);
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  return (
    <div className="login-container">
      <div className="login-grid">
        {/* Partie gauche : Formulaire de connexion */}
        <div className="login-form-section">
          <div className="login-form-container">
            <div className="login-logo">
              <div className="logo-icon">🏥</div>
            </div>

            <div className="login-header">
              <h1 className="login-title">Connexion</h1>
              <p className="login-subtitle">
                Entrez vos identifiants pour accéder à votre espace MAYAShare+
              </p>
            </div>

            {(localError || error) && (
              <div className="login-error">
                <span className="error-icon">⚠️</span>
                {localError || error}
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="login-form">
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

              <div className="forgot-password">
                <a href="/forgot-password" className="forgot-link">
                  Mot de passe oublié ?
                </a>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="login-button"
              >
                {loading ? (
                  <div className="loading-spinner"></div>
                ) : (
                  <>
                    <span className="button-icon">🚀</span>
                    Se connecter
                  </>
                )}
              </button>

              <div className="signup-link">
                Vous n'avez pas de compte ?{' '}
                <a
                  href="/register"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate('/register');
                  }}
                  className="signup-link-text"
                >
                  Inscrivez-vous !
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
          </div>
        </div>

        {/* Partie droite : Slogan et illustration */}
        <div className="login-hero-section">
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
              Connectez-vous pour gérer vos rendez-vous et dossiers médicaux
              en toute simplicité avec MAYAShare+
            </p>

            <div className="hero-features">
              {['Sécurisé', 'Rapide', 'Intuitif'].map((feature, index) => (
                <div key={index} className="feature-chip">
                  {feature}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;