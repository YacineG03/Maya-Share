import React from 'react';
import './About.css';
import Navbar from '../Navbar/Navbar';

const About = () => {
  return (
    <>
      <Navbar />
      <div className="about-container">
        <section className="about-hero">
          <h1 className="about-title">
            À propos de <span className="about-highlight">MAYAShare +</span>
          </h1>
          <p className="about-subtitle">
            Une plateforme conçue pour transformer la collaboration médicale grâce à la technologie.
          </p>
        </section>

        <section className="about-section">
          <div className="about-content">
            <h2 className="about-heading">Notre Mission</h2>
            <p>
              Chez MAYAShare +, nous croyons que la communication entre professionnels de santé peut être plus fluide,
              sécurisée et instantanée. Notre mission est de fournir un espace numérique de confiance pour simplifier la
              gestion des dossiers médicaux, la coordination des soins et la collaboration interdisciplinaire.
            </p>
          </div>

          <div className="about-content">
            <h2 className="about-heading">Nos Valeurs</h2>
            <ul className="about-list">
              <li><strong>Confidentialité :</strong> Chiffrement de bout en bout pour la sécurité des données.</li>
              <li><strong>Accessibilité :</strong> Une interface intuitive pour tous les utilisateurs.</li>
              <li><strong>Fiabilité :</strong> Une infrastructure robuste et disponible 99.9% du temps.</li>
              <li><strong>Innovation :</strong> Des fonctionnalités évolutives pour répondre aux besoins du terrain.</li>
            </ul>
          </div>

          <div className="about-content">
            <h2 className="about-heading">Notre Équipe</h2>
            <p>
              MAYAShare + est développée par une équipe pluridisciplinaire de développeurs, médecins et experts en cybersécurité, 
              unis par une vision commune : faire de la technologie un allié du monde médical.
            </p>
          </div>
        </section>

        <footer className="about-footer">
          <p>© 2025 MAYAShare +. Tous droits réservés.</p>
        </footer>
      </div>
    </>
  );
};

export default About;
