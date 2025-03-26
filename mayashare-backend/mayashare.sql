CREATE DATABASE IF NOT EXISTS mayashare_db;

USE mayashare_db;

--- Table Utilisateur
CREATE TABLE Utilisateur (
    idUtilisateur INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(255) NOT NULL,
    prenom VARCHAR(255) NOT NULL,
    role ENUM('Médecin', 'Infirmier', 'Admin', 'Patient') NOT NULL,
    identifiant VARCHAR(255) UNIQUE NOT NULL,
    motDePasse VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    idHôpital INT,
    FOREIGN KEY (idHôpital) REFERENCES Hôpital(idHôpital)
);

-- Table Hôpital
CREATE TABLE Hôpital (
    idHôpital INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(255) NOT NULL,
    adresse TEXT NOT NULL,
    ville VARCHAR(100) NOT NULL
);

-- Table Dossier
CREATE TABLE Dossier (
    idDossier INT AUTO_INCREMENT PRIMARY KEY,
    idPatient INT,
    idMedecin INT,
    dateCreation DATETIME NOT NULL,
    diagnostic TEXT,
    traitement TEXT,
    etat ENUM('en cours', 'traité') DEFAULT 'en cours',
    FOREIGN KEY (idPatient) REFERENCES Utilisateur(idUtilisateur),
    FOREIGN KEY (idMedecin) REFERENCES Utilisateur(idUtilisateur)
);

-- Table Image
CREATE TABLE Image (
    idImage INT AUTO_INCREMENT PRIMARY KEY,
    nomFichier VARCHAR(255) NOT NULL,
    format VARCHAR(10) NOT NULL,
    dateUpload DATETIME NOT NULL,
    metadonnees TEXT,
    idUtilisateur INT,
    idDossier INT,
    FOREIGN KEY (idUtilisateur) REFERENCES Utilisateur(idUtilisateur),
    FOREIGN KEY (idDossier) REFERENCES Dossier(idDossier)
);

-- Table Partage
CREATE TABLE Partage (
    idPartage INT AUTO_INCREMENT PRIMARY KEY,
    idImage INT,
    lienPartage VARCHAR(255) NOT NULL,
    motDePasse VARCHAR(255),
    dateExpiration DATETIME NOT NULL,
    FOREIGN KEY (idImage) REFERENCES Image(idImage)
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

-- Table RendezVous
CREATE TABLE RendezVous (
    idRendezVous INT AUTO_INCREMENT PRIMARY KEY,
    idPatient INT,
    idMedecin INT,
    dateDemande DATETIME NOT NULL,
    dateRendezVous DATETIME,
    motif TEXT NOT NULL,
    etat ENUM('en attente', 'accepté', 'décliné') DEFAULT 'en attente',
    commentaire TEXT,
    FOREIGN KEY (idPatient) REFERENCES Utilisateur(idUtilisateur),
    FOREIGN KEY (idMedecin) REFERENCES Utilisateur(idUtilisateur)
);