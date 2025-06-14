/* eslint-disable prettier/prettier */
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