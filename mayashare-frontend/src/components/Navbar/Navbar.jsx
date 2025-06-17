/* eslint-disable prettier/prettier */
import React from 'react';
import '../HomePage/HomePage';

const Navbar = () => {
  return (
    <nav className="hp-nav-container">
      <div className="hp-nav-content">
        <span className="hp-logo">MAYAShare +</span>
        <div className="hp-nav-links flex space-x-6">
          {[
            { label: 'Accueil', href: '/' },
            { label: 'Service', href: '/service' },
            { label: 'À propos', href: '/about' },
            { label: 'Contact', href: '/contact' }
          ].map((item) => (
            <a key={item.label} href={item.href} className="hp-nav-link">
              {item.label}
            </a>
          ))}
        </div>
        <div className="hp-nav-buttons">
          <a href="/login" className="hp-nav-login">Se connecter</a>
          <a href="/register" className="hp-nav-signup">S'inscrire</a>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
