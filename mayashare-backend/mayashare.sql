CREATE DATABASE IF NOT EXISTS mayashare_db;
USE mayashare_db;

-- Table Hopital
CREATE TABLE Hopital (
    idHopital INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(255) NOT NULL,
    adresse TEXT NOT NULL,
    ville VARCHAR(100) NOT NULL
);

-- Table Utilisateur
CREATE TABLE Utilisateur (
    idUtilisateur INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(255) NOT NULL,
    prenom VARCHAR(255) NOT NULL,
    role ENUM('Médecin', 'Infirmier', 'Admin', 'Patient') NOT NULL,
    identifiant VARCHAR(255) UNIQUE NOT NULL,
    motDePasse VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    telephone VARCHAR(20) UNIQUE NOT NULL,
    idHopital INT,
    FOREIGN KEY (idHopital) REFERENCES Hopital(idHopital)
);

-- Table Dossier
CREATE TABLE Dossier (
    idDossier INT AUTO_INCREMENT PRIMARY KEY,
    idPatient INT,
    idMedecin INT,
    idInfirmier INT,
    dateCreation DATETIME NOT NULL,
    diagnostic TEXT,
    traitement TEXT,
    etat ENUM('en cours', 'traité') DEFAULT 'en cours',
    FOREIGN KEY (idPatient) REFERENCES Utilisateur(idUtilisateur),
    FOREIGN KEY (idMedecin) REFERENCES Utilisateur(idUtilisateur),
    FOREIGN KEY (idInfirmier) REFERENCES Utilisateur(idUtilisateur)
);

-- Table Image
CREATE TABLE Image (
    idImage INT AUTO_INCREMENT PRIMARY KEY,
    nomFichier VARCHAR(255) NOT NULL,
    format VARCHAR(255),
    dateUpload DATETIME NOT NULL,
    metadonnees TEXT,
    idUtilisateur INT,
    idDossier INT,
    FOREIGN KEY (idUtilisateur) REFERENCES Utilisateur(idUtilisateur),
    FOREIGN KEY (idDossier) REFERENCES Dossier(idDossier),
    FOREIGN KEY (idConsultation) REFERENCES Consultation(idConsultation) ON DELETE SET NULL;
);

-- Table Partage
CREATE TABLE Partage (
    idPartage INT AUTO_INCREMENT PRIMARY KEY,
    idImage INT,
    lienPartage VARCHAR(255) NOT NULL,
    motDePasse VARCHAR(255),
    dateExpiration DATETIME NOT NULL,
    idDossier INT,
    FOREIGN KEY (idImage) REFERENCES Image(idImage),
    FOREIGN KEY (idDossier) REFERENCES Dossier(idDossier) ON DELETE CASCADE
);

-- Table PartageDossier
CREATE TABLE PartageDossier (
    idPartage INT AUTO_INCREMENT PRIMARY KEY,
    idDossier INT NOT NULL,
    idUtilisateur INT NOT NULL,
    datePartage DATETIME NOT NULL,
    FOREIGN KEY (idDossier) REFERENCES Dossier(idDossier),
    FOREIGN KEY (idUtilisateur) REFERENCES Utilisateur(idUtilisateur)
);

-- Table RendezVous
CREATE TABLE RendezVous (
    idRendezVous INT AUTO_INCREMENT PRIMARY KEY,
    idPatient INT,
    idMedecin INT,
    idInfirmier INT,
    dateDemande DATETIME NOT NULL,
    dateRendezVous DATETIME,
    motif TEXT NOT NULL,
    etat ENUM('en attente', 'accepté', 'décliné', 'annulé') DEFAULT 'en attente',
        commentaire TEXT,
    FOREIGN KEY (idPatient) REFERENCES Utilisateur(idUtilisateur),
    FOREIGN KEY (idMedecin) REFERENCES Utilisateur(idUtilisateur),
    FOREIGN KEY (idInfirmier) REFERENCES Utilisateur(idUtilisateur) ON DELETE SET NULL
);

-- Table Tracabilite
CREATE TABLE Tracabilite (
    idTrace INT AUTO_INCREMENT PRIMARY KEY,
    action VARCHAR(50) NOT NULL,
    idUtilisateur INT,
    idImage INT,
    dateHeure DATETIME NOT NULL,
    FOREIGN KEY (idUtilisateur) REFERENCES Utilisateur(idUtilisateur),
    FOREIGN KEY (idImage) REFERENCES Image(idImage)
);

-- Table Consultation
CREATE TABLE Consultation (
    idConsultation INT AUTO_INCREMENT PRIMARY KEY,
    idDossier INT NOT NULL,
    dateConsultation DATETIME NOT NULL,
    notes TEXT,
    FOREIGN KEY (idDossier) REFERENCES Dossier(idDossier) ON DELETE CASCADE
);

-- Add consultation_id to Image table to link images to consultations
ALTER TABLE Image
ADD COLUMN idConsultation INT,
ADD FOREIGN KEY (idConsultation) REFERENCES Consultation(idConsultation) ON DELETE SET NULL;