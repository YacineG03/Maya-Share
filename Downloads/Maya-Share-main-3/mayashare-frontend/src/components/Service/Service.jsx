import React from 'react';
import Navbar from '../Navbar/Navbar'; // Navbar doit exister dans le dossier courant
import './Service.css';
import { FaUserMd, FaComments, FaDatabase, FaUsers } from 'react-icons/fa';

const services = [
  {
    icon: <FaUserMd />,
    title: 'Collaboration Médicale',
    description:
      'Partage sécurisé de cas, diagnostics et expériences cliniques entre professionnels de santé.',
  },
  {
    icon: <FaComments />,
    title: 'Communication Sécurisée',
    description:
      'Échangez rapidement et de manière chiffrée grâce à notre messagerie instantanée dédiée.',
  },
  {
    icon: <FaDatabase />,
    title: 'Archivage DICOM',
    description:
      'Intégration avec Orthanc pour un accès et stockage centralisé des images médicales.',
  },
  {
    icon: <FaUsers />,
    title: 'Réseau de Confiance',
    description:
      'Rejoignez un cercle privé de professionnels pour discuter et valider des cas complexes.',
  },
];

const Service = () => {
  return (
    <>
      <Navbar />
      <section className="services-section">
        <div className="container">
          <h2 className="services-title">Nos Services</h2>
          <div className="services-grid">
            {services.map((service, index) => (
              <div className="service-card" key={index}>
                <div className="service-icon">{service.icon}</div>
                <h3 className="service-title">{service.title}</h3>
                <p className="service-description">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default Service;
