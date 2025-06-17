/* eslint-disable prettier/prettier */
import React, { useState } from 'react';
import Navbar from '../Navbar/Navbar';
import { Send, Mail, User, MessageSquare, CheckCircle } from 'lucide-react';
import './Contact.css';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulation d'envoi - remplacez par votre logique d'envoi réelle
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({ name: '', email: '', message: '' });
    }, 3000);
  };

  return (
    <div className="hp-container">
      <Navbar />
      <section className="hp-contact-section">
        <div className="hp-contact-header">
          <div className="hp-contact-icon">
            <Mail className="hp-header-icon" />
          </div>
          <h1 className="hp-contact-title">Contactez-nous</h1>
          <p className="hp-contact-subtitle">
            Vous avez des questions, des suggestions ou besoin d'assistance ? 
            Nous sommes là pour vous aider !
          </p>
        </div>
        
        <div className="hp-contact-form-container">
          {isSubmitted ? (
            <div className="hp-success-message">
              <CheckCircle className="hp-success-icon" />
              <h3>Message envoyé avec succès !</h3>
              <p>Nous vous répondrons dans les plus brefs délais.</p>
            </div>
          ) : (
            <form className="hp-contact-form" onSubmit={handleSubmit}>
              <div className="hp-form-group">
                <label htmlFor="name" className="hp-label">
                  <User className="hp-label-icon" />
                  Nom complet
                </label>
                <input 
                  type="text" 
                  id="name" 
                  name="name" 
                  value={formData.name}
                  onChange={handleChange}
                  required 
                  placeholder="Votre nom complet" 
                />
              </div>
              
              <div className="hp-form-group">
                <label htmlFor="email" className="hp-label">
                  <Mail className="hp-label-icon" />
                  Adresse email
                </label>
                <input 
                  type="email" 
                  id="email" 
                  name="email" 
                  value={formData.email}
                  onChange={handleChange}
                  required 
                  placeholder="vous@example.com" 
                />
              </div>
              
              <div className="hp-form-group">
                <label htmlFor="message" className="hp-label">
                  <MessageSquare className="hp-label-icon" />
                  Message
                </label>
                <textarea 
                  id="message" 
                  name="message" 
                  rows="5" 
                  value={formData.message}
                  onChange={handleChange}
                  required 
                  placeholder="Décrivez votre demande en détail..." 
                />
              </div>
              
              <button type="submit" className="hp-contact-button">
                <Send className="hp-button-icon" />
                Envoyer le message
              </button>
            </form>
          )}
        </div>
        
        <div className="hp-contact-info">
          <div className="hp-info-card">
            <h3>Réponse rapide</h3>
            <p>Nous nous engageons à répondre à tous les messages dans les 24 heures.</p>
          </div>
          <div className="hp-info-card">
            <h3>Support technique</h3>
            <p>Notre équipe technique est disponible pour résoudre vos problèmes.</p>
          </div>
        </div>
      </section>
      
      <footer className="hp-footer">
        <div className="hp-footer-content">
          <div className="hp-footer-section">
            <h4>MAYAShare +</h4>
            <p>Votre partenaire de confiance pour tous vos besoins numériques.</p>
          </div>
          <div className="hp-footer-section">
            <p>© 2025 MAYAShare +. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Contact;