-- MariaDB dump 10.19  Distrib 10.4.32-MariaDB, for Win64 (AMD64)
--
-- Host: localhost    Database: mayashare_db
-- ------------------------------------------------------
-- Server version	10.4.32-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `consultation`
--

DROP TABLE IF EXISTS `consultation`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `consultation` (
  `idConsultation` int(11) NOT NULL AUTO_INCREMENT,
  `idDossier` int(11) NOT NULL,
  `dateConsultation` datetime NOT NULL,
  `notes` text DEFAULT NULL,
  PRIMARY KEY (`idConsultation`),
  KEY `idDossier` (`idDossier`),
  CONSTRAINT `consultation_ibfk_1` FOREIGN KEY (`idDossier`) REFERENCES `dossier` (`idDossier`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `consultation`
--

LOCK TABLES `consultation` WRITE;
/*!40000 ALTER TABLE `consultation` DISABLE KEYS */;
INSERT INTO `consultation` VALUES (1,3,'2025-05-06 18:15:16','Test dicom\n'),(2,4,'2025-05-06 18:27:26',''),(3,3,'2025-05-06 19:14:57','jnjkmnkn '),(4,4,'2025-05-06 20:01:29',''),(5,3,'2025-05-06 20:08:51',''),(6,4,'2025-05-06 20:09:32',''),(7,4,'2025-05-06 20:19:48',''),(8,4,'2025-05-06 20:20:34','m,kmkdm'),(9,4,'2025-05-06 20:21:15','m,kmkdm'),(10,4,'2025-05-06 20:22:26','m,kmkdm'),(11,4,'2025-05-06 20:31:40','sssss'),(12,4,'2025-05-06 20:40:18','sssss'),(13,4,'2025-05-06 20:41:11','teSDFGHJKL'),(14,5,'2025-05-06 20:49:48','Testons');
/*!40000 ALTER TABLE `consultation` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `dossier`
--

DROP TABLE IF EXISTS `dossier`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `dossier` (
  `idDossier` int(11) NOT NULL AUTO_INCREMENT,
  `idPatient` int(11) DEFAULT NULL,
  `idMedecin` int(11) DEFAULT NULL,
  `dateCreation` datetime NOT NULL,
  `diagnostic` text DEFAULT NULL,
  `traitement` text DEFAULT NULL,
  `etat` enum('en cours','traité') DEFAULT 'en cours',
  `idInfirmier` int(11) DEFAULT NULL,
  `groupeSanguin` varchar(3) DEFAULT NULL,
  `antecedentsMedicaux` text DEFAULT NULL,
  `allergies` text DEFAULT NULL,
  `notesComplementaires` text DEFAULT NULL,
  PRIMARY KEY (`idDossier`),
  KEY `idPatient` (`idPatient`),
  KEY `idMedecin` (`idMedecin`),
  KEY `fk_infirmier` (`idInfirmier`),
  CONSTRAINT `dossier_ibfk_1` FOREIGN KEY (`idPatient`) REFERENCES `utilisateur` (`idUtilisateur`),
  CONSTRAINT `dossier_ibfk_2` FOREIGN KEY (`idMedecin`) REFERENCES `utilisateur` (`idUtilisateur`),
  CONSTRAINT `fk_infirmier` FOREIGN KEY (`idInfirmier`) REFERENCES `utilisateur` (`idUtilisateur`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dossier`
--

LOCK TABLES `dossier` WRITE;
/*!40000 ALTER TABLE `dossier` DISABLE KEYS */;
INSERT INTO `dossier` VALUES (1,1,NULL,'2025-04-17 01:35:29','','','en cours',NULL,NULL,NULL,NULL,NULL),(2,1,NULL,'2025-04-17 01:38:32','','','en cours',NULL,NULL,NULL,NULL,NULL),(3,1,2,'2025-04-20 20:08:45','Consultation initiale','Repos + vacances','en cours',9,'A-','','',''),(4,10,2,'2025-04-20 21:27:24','Maux de tete','Repos','traité',NULL,NULL,NULL,NULL,NULL),(5,10,2,'2025-05-06 20:49:26','TEst','test','en cours',NULL,NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `dossier` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hopital`
--

DROP TABLE IF EXISTS `hopital`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `hopital` (
  `idHopital` int(11) NOT NULL AUTO_INCREMENT,
  `nom` varchar(255) NOT NULL,
  `adresse` text NOT NULL,
  `ville` varchar(100) NOT NULL,
  PRIMARY KEY (`idHopital`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hopital`
--

LOCK TABLES `hopital` WRITE;
/*!40000 ALTER TABLE `hopital` DISABLE KEYS */;
INSERT INTO `hopital` VALUES (1,'Hôpital Général de Grand-Yoff','Route de l’ Aéroport, Grand-Yoff','Dakar'),(2,'Hôpital Dalal Jamm','Route de Rufisque, Guédiawaye','Dakar'),(3,'Hôpital Régional de Thiès','Avenue Léopold Sédar Senghor, Thiès','Thiès'),(4,'CHU de Ziguinchor','Route de l’Université, Ziguinchor','Ziguinchor');
/*!40000 ALTER TABLE `hopital` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `image`
--

DROP TABLE IF EXISTS `image`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `image` (
  `idImage` int(11) NOT NULL AUTO_INCREMENT,
  `nomFichier` varchar(255) NOT NULL,
  `format` varchar(255) DEFAULT NULL,
  `dateUpload` datetime NOT NULL,
  `metadonnees` text DEFAULT NULL,
  `idUtilisateur` int(11) DEFAULT NULL,
  `idDossier` int(11) DEFAULT NULL,
  `idConsultation` int(11) DEFAULT NULL,
  PRIMARY KEY (`idImage`),
  KEY `idUtilisateur` (`idUtilisateur`),
  KEY `idDossier` (`idDossier`),
  KEY `idConsultation` (`idConsultation`),
  CONSTRAINT `image_ibfk_1` FOREIGN KEY (`idUtilisateur`) REFERENCES `utilisateur` (`idUtilisateur`),
  CONSTRAINT `image_ibfk_2` FOREIGN KEY (`idDossier`) REFERENCES `dossier` (`idDossier`),
  CONSTRAINT `image_ibfk_3` FOREIGN KEY (`idConsultation`) REFERENCES `consultation` (`idConsultation`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=56 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `image`
--

LOCK TABLES `image` WRITE;
/*!40000 ALTER TABLE `image` DISABLE KEYS */;
INSERT INTO `image` VALUES (1,'1744855311639.pdf','applicatio','2025-04-17 02:01:51','',1,1,NULL),(2,'1744857176148.dcm','applicatio','2025-04-17 02:32:56','{\"orthancId\":\"f6243344-db8927bb-e473639b-d510b561-aea4fd06\"}',1,1,NULL),(3,'1744857350114.dcm','applicatio','2025-04-17 02:35:50','{\"orthancId\":\"9a29cba5-68bed7e0-c5c01897-1771d7c8-d3dad7c2\"}',1,1,NULL),(4,'1744858323850.dcm','applicatio','2025-04-17 02:52:03','{\"orthancId\":\"9a29cba5-68bed7e0-c5c01897-1771d7c8-d3dad7c2\"}',1,1,NULL),(5,'1744908435625.dcm','applicatio','2025-04-17 16:47:15','{\"orthancId\":\"9a29cba5-68bed7e0-c5c01897-1771d7c8-d3dad7c2\"}',1,1,NULL),(6,'1744909008712.dcm','applicatio','2025-04-17 16:56:48','{\"orthancId\":\"9a29cba5-68bed7e0-c5c01897-1771d7c8-d3dad7c2\"}',1,1,NULL),(7,'1745177556696.dcm','applicatio','2025-04-20 19:32:36','{\"orthancId\":\"9a29cba5-68bed7e0-c5c01897-1771d7c8-d3dad7c2\"}',1,1,NULL),(8,'1745178190631.dcm','applicatio','2025-04-20 19:43:10','{\"orthancId\":\"9a29cba5-68bed7e0-c5c01897-1771d7c8-d3dad7c2\"}',1,1,NULL),(15,'1745187578173.pdf','applicatio','2025-04-20 22:19:38','',2,3,NULL),(20,'1745245405462.dcm','applicatio','0000-00-00 00:00:00','{\"orthancId\":\"4e4bce5d-9a98e121-3d1a87bc-47f0398f-5cbefd26\"}',2,3,NULL),(28,'1745348857672.dcm','applicatio','0000-00-00 00:00:00','{\"orthancId\":\"6be8f9b5-0a47915b-56fd8a11-4d94300c-9bfb83c4\"}',2,3,NULL),(41,'image-00006.dcm','application/dicom','0000-00-00 00:00:00','{\"orthancId\":\"4e4bce5d-9a98e121-3d1a87bc-47f0398f-5cbefd26\"}',9,3,NULL),(42,'Lab 10.pdf','application/pdf','0000-00-00 00:00:00','{}',9,3,NULL),(43,'Lab 10.pdf','application/pdf','0000-00-00 00:00:00','{}',2,4,NULL),(44,'Lab 10.pdf','application/pdf','0000-00-00 00:00:00','{}',2,4,2),(47,'image-00003.dcm','application/dicom','0000-00-00 00:00:00','{\"orthancId\":\"9a29cba5-68bed7e0-c5c01897-1771d7c8-d3dad7c2\"}',2,4,NULL),(48,'image-00008.dcm','application/dicom','0000-00-00 00:00:00','{\"orthancId\":\"6be8f9b5-0a47915b-56fd8a11-4d94300c-9bfb83c4\"}',2,4,2),(49,'image-00008.dcm','application/dicom','0000-00-00 00:00:00','{\"orthancId\":\"6be8f9b5-0a47915b-56fd8a11-4d94300c-9bfb83c4\"}',2,4,6),(50,'image-00007.dcm','application/dicom','0000-00-00 00:00:00','{\"orthancId\":\"ca185649-59f5c5ef-ebbff62a-dcd31eec-5232abf3\"}',2,4,6),(51,'image-00006.dcm','application/dicom','0000-00-00 00:00:00','{\"orthancId\":\"4e4bce5d-9a98e121-3d1a87bc-47f0398f-5cbefd26\"}',2,4,13),(52,'Lab 10.pdf','application/pdf','0000-00-00 00:00:00','{}',2,4,13),(53,'Lab 10.pdf','application/pdf','0000-00-00 00:00:00','{}',2,5,14),(54,'Lab 10.pdf','application/pdf','0000-00-00 00:00:00','{}',2,3,1),(55,'image-00002.dcm','application/dicom','0000-00-00 00:00:00','{\"orthancId\":\"31ec3223-93591aea-d0c21ef9-cd13cd15-700e3760\"}',2,3,1);
/*!40000 ALTER TABLE `image` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `partage`
--

DROP TABLE IF EXISTS `partage`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `partage` (
  `idPartage` int(11) NOT NULL AUTO_INCREMENT,
  `idImage` int(11) DEFAULT NULL,
  `lienPartage` varchar(255) NOT NULL,
  `motDePasse` varchar(255) DEFAULT NULL,
  `dateExpiration` datetime NOT NULL,
  `idDossier` int(11) DEFAULT NULL,
  PRIMARY KEY (`idPartage`),
  KEY `idImage` (`idImage`),
  KEY `fk_partage_dossier` (`idDossier`),
  CONSTRAINT `fk_partage_dossier` FOREIGN KEY (`idDossier`) REFERENCES `dossier` (`idDossier`) ON DELETE CASCADE,
  CONSTRAINT `partage_ibfk_1` FOREIGN KEY (`idImage`) REFERENCES `image` (`idImage`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `partage`
--

LOCK TABLES `partage` WRITE;
/*!40000 ALTER TABLE `partage` DISABLE KEYS */;
INSERT INTO `partage` VALUES (1,NULL,'4de1b5e4c3135412646524297ef0d10a','secret123','2025-04-20 22:10:53',3),(2,NULL,'3ca5c0743a9797b342b9b3c74f23be86','1234','2025-04-20 20:59:22',3);
/*!40000 ALTER TABLE `partage` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `partagedossier`
--

DROP TABLE IF EXISTS `partagedossier`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `partagedossier` (
  `idPartage` int(11) NOT NULL AUTO_INCREMENT,
  `idDossier` int(11) NOT NULL,
  `idUtilisateur` int(11) NOT NULL,
  `datePartage` datetime NOT NULL,
  PRIMARY KEY (`idPartage`),
  KEY `idDossier` (`idDossier`),
  KEY `idUtilisateur` (`idUtilisateur`),
  CONSTRAINT `partagedossier_ibfk_1` FOREIGN KEY (`idDossier`) REFERENCES `dossier` (`idDossier`),
  CONSTRAINT `partagedossier_ibfk_2` FOREIGN KEY (`idUtilisateur`) REFERENCES `utilisateur` (`idUtilisateur`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `partagedossier`
--

LOCK TABLES `partagedossier` WRITE;
/*!40000 ALTER TABLE `partagedossier` DISABLE KEYS */;
INSERT INTO `partagedossier` VALUES (1,3,3,'2025-04-20 20:10:06'),(2,3,9,'2025-04-20 21:08:51'),(3,3,9,'2025-05-05 22:53:44');
/*!40000 ALTER TABLE `partagedossier` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `partagesagenda`
--

DROP TABLE IF EXISTS `partagesagenda`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `partagesagenda` (
  `idPartage` int(11) NOT NULL AUTO_INCREMENT,
  `idMedecin` int(11) NOT NULL,
  `idInfirmier` int(11) NOT NULL,
  `dateDebut` date NOT NULL,
  `dateFin` date NOT NULL,
  `dateCreation` datetime DEFAULT current_timestamp(),
  `idRendezVous` int(11) DEFAULT NULL,
  PRIMARY KEY (`idPartage`),
  KEY `idMedecin` (`idMedecin`),
  KEY `idInfirmier` (`idInfirmier`),
  KEY `idRendezVous` (`idRendezVous`),
  CONSTRAINT `partagesagenda_ibfk_1` FOREIGN KEY (`idMedecin`) REFERENCES `utilisateur` (`idUtilisateur`),
  CONSTRAINT `partagesagenda_ibfk_2` FOREIGN KEY (`idInfirmier`) REFERENCES `utilisateur` (`idUtilisateur`),
  CONSTRAINT `partagesagenda_ibfk_3` FOREIGN KEY (`idRendezVous`) REFERENCES `rendezvous` (`idRendezVous`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `partagesagenda`
--

LOCK TABLES `partagesagenda` WRITE;
/*!40000 ALTER TABLE `partagesagenda` DISABLE KEYS */;
INSERT INTO `partagesagenda` VALUES (1,2,9,'2025-05-29','2025-06-08','2025-05-29 21:51:09',NULL),(2,2,9,'2025-05-30','2025-06-07','2025-05-30 03:35:29',6);
/*!40000 ALTER TABLE `partagesagenda` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rendezvous`
--

DROP TABLE IF EXISTS `rendezvous`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `rendezvous` (
  `idRendezVous` int(11) NOT NULL AUTO_INCREMENT,
  `idPatient` int(11) DEFAULT NULL,
  `idMedecin` int(11) DEFAULT NULL,
  `dateDemande` datetime NOT NULL,
  `dateRendezVous` datetime DEFAULT NULL,
  `motif` text NOT NULL,
  `etat` enum('en attente','accepté','décliné','annulé') DEFAULT 'en attente',
  `commentaire` text DEFAULT NULL,
  `idInfirmier` int(11) DEFAULT NULL,
  PRIMARY KEY (`idRendezVous`),
  KEY `idPatient` (`idPatient`),
  KEY `idMedecin` (`idMedecin`),
  KEY `fk_rendezvous_infirmier` (`idInfirmier`),
  CONSTRAINT `fk_rendezvous_infirmier` FOREIGN KEY (`idInfirmier`) REFERENCES `utilisateur` (`idUtilisateur`) ON DELETE SET NULL,
  CONSTRAINT `rendezvous_ibfk_1` FOREIGN KEY (`idPatient`) REFERENCES `utilisateur` (`idUtilisateur`),
  CONSTRAINT `rendezvous_ibfk_2` FOREIGN KEY (`idMedecin`) REFERENCES `utilisateur` (`idUtilisateur`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rendezvous`
--

LOCK TABLES `rendezvous` WRITE;
/*!40000 ALTER TABLE `rendezvous` DISABLE KEYS */;
INSERT INTO `rendezvous` VALUES (1,10,2,'2025-04-14 16:45:11','2025-04-15 10:00:00','Consultation générale','accepté','Votre rendez vous avec docteur kandji est accepté (test)',NULL),(2,10,11,'2025-04-14 19:44:02','2025-04-15 10:00:00','Consultation générale','en attente',NULL,NULL),(3,10,11,'2025-04-16 14:06:19','2025-04-16 18:09:00','Maux de tetes','décliné','Pas dispo\n',NULL),(6,10,2,'2025-05-11 23:51:41','2025-05-12 08:51:00','Baisse de tension','en attente','',9);
/*!40000 ALTER TABLE `rendezvous` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tracabilite`
--

DROP TABLE IF EXISTS `tracabilite`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tracabilite` (
  `idTrace` int(11) NOT NULL AUTO_INCREMENT,
  `action` varchar(50) NOT NULL,
  `idUtilisateur` int(11) DEFAULT NULL,
  `idImage` int(11) DEFAULT NULL,
  `dateHeure` datetime NOT NULL,
  PRIMARY KEY (`idTrace`),
  KEY `idUtilisateur` (`idUtilisateur`),
  KEY `idImage` (`idImage`),
  CONSTRAINT `tracabilite_ibfk_1` FOREIGN KEY (`idUtilisateur`) REFERENCES `utilisateur` (`idUtilisateur`),
  CONSTRAINT `tracabilite_ibfk_2` FOREIGN KEY (`idImage`) REFERENCES `image` (`idImage`)
) ENGINE=InnoDB AUTO_INCREMENT=374 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tracabilite`
--

LOCK TABLES `tracabilite` WRITE;
/*!40000 ALTER TABLE `tracabilite` DISABLE KEYS */;
INSERT INTO `tracabilite` VALUES (1,'inscription',1,NULL,'2025-04-13 16:20:16'),(2,'connexion',1,NULL,'2025-04-13 16:20:43'),(3,'connexion',4,NULL,'2025-04-13 16:28:55'),(4,'connexion',4,NULL,'2025-04-13 16:37:33'),(5,'création hôpital',4,NULL,'2025-04-13 16:38:00'),(6,'modification hôpital',4,NULL,'2025-04-13 16:39:58'),(7,'création hôpital',4,NULL,'2025-04-13 16:41:35'),(8,'création hôpital',4,NULL,'2025-04-13 16:41:50'),(9,'création hôpital',4,NULL,'2025-04-13 16:41:58'),(10,'connexion',4,NULL,'2025-04-13 18:06:52'),(11,'connexion',4,NULL,'2025-04-13 19:08:01'),(12,'création utilisateur',4,NULL,'2025-04-13 19:21:44'),(14,'inscription',7,NULL,'2025-04-13 23:38:39'),(15,'connexion',4,NULL,'2025-04-14 00:05:42'),(16,'création utilisateur',4,NULL,'2025-04-14 00:06:49'),(17,'connexion',1,NULL,'2025-04-14 00:42:12'),(19,'connexion',5,NULL,'2025-04-14 01:14:29'),(20,'connexion',5,NULL,'2025-04-14 01:16:14'),(21,'connexion',5,NULL,'2025-04-14 01:24:02'),(22,'connexion',5,NULL,'2025-04-14 01:25:39'),(23,'connexion',5,NULL,'2025-04-14 01:40:25'),(24,'connexion',5,NULL,'2025-04-14 01:44:44'),(25,'connexion',5,NULL,'2025-04-14 01:56:47'),(26,'connexion',5,NULL,'2025-04-14 01:57:09'),(27,'connexion',1,NULL,'2025-04-14 01:58:47'),(28,'connexion',1,NULL,'2025-04-14 03:03:41'),(29,'connexion',1,NULL,'2025-04-14 03:14:55'),(30,'connexion',4,NULL,'2025-04-14 03:16:24'),(31,'connexion',4,NULL,'2025-04-14 03:16:53'),(32,'connexion',3,NULL,'2025-04-14 03:33:35'),(33,'connexion',3,NULL,'2025-04-14 03:33:43'),(34,'connexion',1,NULL,'2025-04-14 03:33:53'),(35,'connexion',3,NULL,'2025-04-14 03:35:01'),(36,'connexion',3,NULL,'2025-04-14 03:36:11'),(37,'connexion',4,NULL,'2025-04-14 03:40:47'),(38,'connexion',2,NULL,'2025-04-14 03:43:06'),(39,'connexion',2,NULL,'2025-04-14 03:43:31'),(40,'connexion',2,NULL,'2025-04-14 03:45:44'),(41,'connexion',2,NULL,'2025-04-14 03:53:36'),(42,'connexion',4,NULL,'2025-04-14 03:59:56'),(43,'connexion',1,NULL,'2025-04-14 04:00:07'),(44,'connexion',3,NULL,'2025-04-14 04:00:23'),(45,'connexion',4,NULL,'2025-04-14 15:08:49'),(46,'connexion',1,NULL,'2025-04-14 15:11:07'),(47,'prise de rendez-vous',1,NULL,'2025-04-14 15:12:29'),(48,'prise de rendez-vous',1,NULL,'2025-04-14 15:31:23'),(49,'prise de rendez-vous',1,NULL,'2025-04-14 15:31:55'),(50,'prise de rendez-vous',1,NULL,'2025-04-14 15:45:00'),(51,'prise de rendez-vous',1,NULL,'2025-04-14 15:45:28'),(52,'connexion',1,NULL,'2025-04-14 15:45:49'),(53,'prise de rendez-vous',1,NULL,'2025-04-14 15:46:06'),(54,'connexion',4,NULL,'2025-04-14 15:49:37'),(55,'connexion',4,NULL,'2025-04-14 15:51:27'),(56,'création utilisateur',4,NULL,'2025-04-14 16:03:24'),(57,'connexion',10,NULL,'2025-04-14 16:03:46'),(58,'prise de rendez-vous',10,NULL,'2025-04-14 16:04:10'),(59,'prise de rendez-vous',10,NULL,'2025-04-14 16:28:02'),(60,'prise de rendez-vous',10,NULL,'2025-04-14 16:32:30'),(61,'prise de rendez-vous',10,NULL,'2025-04-14 16:32:55'),(62,'prise de rendez-vous',10,NULL,'2025-04-14 16:45:11'),(63,'connexion',10,NULL,'2025-04-14 17:05:13'),(64,'connexion',2,NULL,'2025-04-14 17:56:57'),(65,'connexion',4,NULL,'2025-04-14 18:41:42'),(66,'modification utilisateur',4,NULL,'2025-04-14 18:44:53'),(67,'modification utilisateur',4,NULL,'2025-04-14 18:51:55'),(68,'connexion',4,NULL,'2025-04-14 19:38:09'),(69,'création utilisateur',4,NULL,'2025-04-14 19:42:26'),(70,'connexion',10,NULL,'2025-04-14 19:43:01'),(71,'prise de rendez-vous',10,NULL,'2025-04-14 19:44:02'),(72,'connexion',2,NULL,'2025-04-14 19:48:39'),(73,'connexion',11,NULL,'2025-04-14 19:49:13'),(74,'connexion',4,NULL,'2025-04-14 21:09:45'),(75,'connexion',4,NULL,'2025-04-14 21:11:14'),(76,'connexion',4,NULL,'2025-04-14 21:53:55'),(77,'connexion',4,NULL,'2025-04-14 22:00:46'),(78,'modification hôpital',4,NULL,'2025-04-14 22:01:24'),(79,'modification hôpital',4,NULL,'2025-04-14 22:01:40'),(80,'connexion',4,NULL,'2025-04-14 22:07:09'),(81,'connexion',4,NULL,'2025-04-14 22:07:58'),(82,'modification utilisateur',4,NULL,'2025-04-14 22:23:41'),(83,'modification utilisateur',4,NULL,'2025-04-14 22:31:29'),(84,'modification utilisateur',4,NULL,'2025-04-14 22:34:13'),(85,'modification utilisateur',4,NULL,'2025-04-14 22:34:31'),(86,'modification utilisateur',4,NULL,'2025-04-14 22:36:39'),(87,'modification utilisateur',4,NULL,'2025-04-14 22:40:16'),(88,'modification utilisateur',4,NULL,'2025-04-14 22:40:38'),(89,'modification utilisateur',4,NULL,'2025-04-14 22:43:17'),(90,'modification utilisateur',4,NULL,'2025-04-14 22:44:42'),(91,'connexion',4,NULL,'2025-04-14 23:38:25'),(92,'suppression utilisateur',4,NULL,'2025-04-14 23:39:51'),(93,'connexion',4,NULL,'2025-04-15 00:55:11'),(94,'connexion',1,NULL,'2025-04-15 00:56:51'),(95,'connexion',1,NULL,'2025-04-15 01:09:32'),(96,'inscription',12,NULL,'2025-04-15 01:14:15'),(97,'connexion',4,NULL,'2025-04-15 08:18:42'),(100,'connexion',4,NULL,'2025-04-15 09:12:07'),(101,'connexion',4,NULL,'2025-04-15 09:12:53'),(102,'connexion',11,NULL,'2025-04-15 09:14:56'),(103,'connexion',10,NULL,'2025-04-16 12:25:46'),(104,'connexion',10,NULL,'2025-04-16 13:56:02'),(105,'prise de rendez-vous',10,NULL,'2025-04-16 14:06:19'),(106,'connexion',1,NULL,'2025-04-17 01:27:55'),(107,'connexion',2,NULL,'2025-04-17 01:29:59'),(108,'création dossier',1,NULL,'2025-04-17 01:35:29'),(109,'création dossier',1,NULL,'2025-04-17 01:38:32'),(110,'upload',1,1,'2025-04-17 02:01:51'),(111,'connexion',1,NULL,'2025-04-17 02:32:37'),(112,'upload',1,2,'2025-04-17 02:32:56'),(113,'upload',1,3,'2025-04-17 02:35:50'),(114,'upload',1,4,'2025-04-17 02:52:03'),(115,'connexion',1,NULL,'2025-04-17 16:46:07'),(116,'upload',1,5,'2025-04-17 16:47:15'),(117,'upload',1,6,'2025-04-17 16:56:48'),(118,'connexion',10,NULL,'2025-04-20 17:27:58'),(119,'prise de rendez-vous',10,NULL,'2025-04-20 17:28:38'),(120,'connexion',4,NULL,'2025-04-20 17:32:34'),(121,'création hôpital',4,NULL,'2025-04-20 17:32:54'),(122,'modification hôpital',4,NULL,'2025-04-20 17:33:05'),(123,'suppression hôpital',4,NULL,'2025-04-20 17:33:12'),(124,'suppression hôpital',4,NULL,'2025-04-20 18:06:53'),(125,'modification hôpital',4,NULL,'2025-04-20 18:07:28'),(126,'connexion',1,NULL,'2025-04-20 19:32:15'),(127,'upload',1,7,'2025-04-20 19:32:36'),(128,'upload',1,8,'2025-04-20 19:43:10'),(129,'connexion',2,NULL,'2025-04-20 20:07:32'),(130,'création dossier',2,NULL,'2025-04-20 20:08:45'),(131,'partage dossier (direct)',2,NULL,'2025-04-20 20:10:06'),(132,'partage dossier (lien)',2,NULL,'2025-04-20 20:10:53'),(133,'connexion',3,NULL,'2025-04-20 20:12:16'),(134,'connexion',11,NULL,'2025-04-20 20:14:42'),(135,'connexion',11,NULL,'2025-04-20 20:17:17'),(136,'connexion',2,NULL,'2025-04-20 20:31:24'),(137,'partage dossier (lien)',2,NULL,'2025-04-20 20:57:22'),(138,'modification dossier',2,NULL,'2025-04-20 21:07:22'),(140,'partage dossier (direct)',2,NULL,'2025-04-20 21:08:51'),(142,'création dossier',2,NULL,'2025-04-20 21:27:24'),(143,'connexion',2,NULL,'2025-04-20 21:36:58'),(148,'upload',2,15,'2025-04-20 22:19:38'),(150,'connexion',2,NULL,'2025-04-20 23:16:44'),(152,'connexion',2,NULL,'2025-04-20 23:42:10'),(154,'connexion',2,NULL,'2025-04-21 00:44:13'),(156,'connexion',2,NULL,'2025-04-21 13:59:28'),(157,'upload',2,20,'2025-04-21 14:23:26'),(158,'connexion',2,NULL,'2025-04-21 14:29:14'),(160,'connexion',2,NULL,'2025-04-21 22:47:04'),(162,'connexion',4,NULL,'2025-04-21 23:43:57'),(163,'création hôpital',4,NULL,'2025-04-21 23:48:08'),(164,'suppression hôpital',4,NULL,'2025-04-21 23:48:48'),(165,'modification hôpital',4,NULL,'2025-04-21 23:49:21'),(166,'connexion',2,NULL,'2025-04-21 23:51:19'),(167,'connexion',4,NULL,'2025-04-21 23:52:54'),(168,'connexion',10,NULL,'2025-04-21 23:53:44'),(169,'connexion',10,NULL,'2025-04-21 23:58:22'),(170,'connexion',4,NULL,'2025-04-22 00:02:27'),(171,'connexion',2,NULL,'2025-04-22 00:07:10'),(172,'connexion',9,NULL,'2025-04-22 00:12:39'),(173,'connexion',10,NULL,'2025-04-22 00:34:28'),(174,'connexion',10,NULL,'2025-04-22 00:47:39'),(175,'connexion',2,NULL,'2025-04-22 01:07:10'),(176,'connexion',2,NULL,'2025-04-22 01:20:01'),(177,'connexion',2,NULL,'2025-04-22 01:50:35'),(178,'connexion',9,NULL,'2025-04-22 02:00:50'),(179,'connexion',2,NULL,'2025-04-22 02:04:17'),(180,'connexion',11,NULL,'2025-04-22 02:10:24'),(181,'connexion',2,NULL,'2025-04-22 02:26:22'),(187,'connexion',2,NULL,'2025-04-22 08:05:23'),(188,'connexion',4,NULL,'2025-04-22 08:06:28'),(189,'connexion',10,NULL,'2025-04-22 08:17:02'),(190,'connexion',4,NULL,'2025-04-22 08:26:50'),(191,'connexion',4,NULL,'2025-04-22 08:32:27'),(192,'connexion',4,NULL,'2025-04-22 08:37:01'),(193,'connexion',11,NULL,'2025-04-22 08:39:35'),(194,'connexion',10,NULL,'2025-04-22 08:41:34'),(195,'connexion',2,NULL,'2025-04-22 08:56:02'),(196,'connexion',2,NULL,'2025-04-22 09:00:34'),(197,'connexion',10,NULL,'2025-04-22 09:01:14'),(198,'connexion',2,NULL,'2025-04-22 18:59:32'),(199,'upload',2,28,'2025-04-22 19:07:37'),(203,'connexion',2,NULL,'2025-04-22 20:01:44'),(204,'connexion',2,NULL,'2025-04-22 22:01:59'),(205,'connexion',2,NULL,'2025-04-22 23:56:37'),(206,'connexion',2,NULL,'2025-04-23 00:57:15'),(207,'modification dossier',2,NULL,'2025-04-23 01:32:15'),(208,'acceptation rendez-vous',2,NULL,'2025-04-23 01:34:41'),(209,'connexion',11,NULL,'2025-04-23 01:35:50'),(210,'refus rendez-vous',11,NULL,'2025-04-23 01:36:11'),(211,'refus rendez-vous',11,NULL,'2025-04-23 01:38:51'),(212,'suppression rendez-vous',11,NULL,'2025-04-23 01:40:47'),(213,'connexion',2,NULL,'2025-04-23 01:47:17'),(218,'connexion',10,NULL,'2025-04-23 02:07:13'),(219,'connexion',2,NULL,'2025-04-28 16:43:30'),(221,'connexion',2,NULL,'2025-04-28 17:04:47'),(234,'connexion',5,NULL,'2025-04-28 18:07:40'),(235,'connexion',2,NULL,'2025-05-05 22:24:05'),(236,'connexion',10,NULL,'2025-05-05 22:42:50'),(237,'connexion',2,NULL,'2025-05-05 22:53:25'),(238,'partage dossier (direct)',2,NULL,'2025-05-05 22:53:44'),(239,'connexion',4,NULL,'2025-05-05 22:54:43'),(240,'connexion',9,NULL,'2025-05-05 22:55:05'),(241,'connexion',2,NULL,'2025-05-05 23:10:06'),(242,'connexion',9,NULL,'2025-05-05 23:44:05'),(243,'connexion',2,NULL,'2025-05-05 23:54:50'),(244,'assignation rendez-vous à infirmier',2,NULL,'2025-05-05 23:55:03'),(245,'connexion',9,NULL,'2025-05-05 23:55:15'),(246,'connexion',2,NULL,'2025-05-05 23:55:50'),(247,'connexion',9,NULL,'2025-05-05 23:56:12'),(248,'connexion',2,NULL,'2025-05-06 00:03:07'),(249,'connexion',9,NULL,'2025-05-06 00:03:48'),(250,'connexion',10,NULL,'2025-05-06 00:04:18'),(251,'prise de rendez-vous',10,NULL,'2025-05-06 00:48:38'),(252,'suppression rendez-vous',10,NULL,'2025-05-06 00:48:56'),(253,'connexion',9,NULL,'2025-05-06 00:49:30'),(254,'connexion',2,NULL,'2025-05-06 00:50:35'),(255,'connexion',9,NULL,'2025-05-06 00:52:13'),(256,'connexion',9,NULL,'2025-05-06 00:52:46'),(257,'connexion',2,NULL,'2025-05-06 01:33:10'),(268,'connexion',9,NULL,'2025-05-06 01:36:24'),(269,'connexion',2,NULL,'2025-05-06 01:38:23'),(270,'connexion',4,NULL,'2025-05-06 01:40:14'),(271,'connexion',2,NULL,'2025-05-06 09:22:08'),(272,'connexion',2,NULL,'2025-05-06 09:23:15'),(273,'connexion',9,NULL,'2025-05-06 09:25:57'),(274,'connexion',10,NULL,'2025-05-06 09:29:06'),(275,'connexion',4,NULL,'2025-05-06 10:31:05'),(276,'modification utilisateur',4,NULL,'2025-05-06 10:52:02'),(277,'suppression utilisateur',4,NULL,'2025-05-06 10:52:08'),(278,'création hôpital',4,NULL,'2025-05-06 10:52:38'),(279,'modification hôpital',4,NULL,'2025-05-06 10:52:49'),(280,'suppression hôpital',4,NULL,'2025-05-06 10:52:54'),(281,'connexion',2,NULL,'2025-05-06 10:54:31'),(282,'connexion',10,NULL,'2025-05-06 11:02:41'),(283,'connexion',2,NULL,'2025-05-06 17:51:10'),(284,'création consultation',2,NULL,'2025-05-06 18:15:16'),(288,'création consultation',2,NULL,'2025-05-06 18:27:26'),(289,'connexion',2,NULL,'2025-05-06 19:14:17'),(290,'création consultation',2,NULL,'2025-05-06 19:14:57'),(291,'modification dossier',2,NULL,'2025-05-06 19:46:59'),(292,'création consultation',2,NULL,'2025-05-06 20:01:29'),(295,'création consultation',2,NULL,'2025-05-06 20:08:51'),(296,'création consultation',2,NULL,'2025-05-06 20:09:33'),(297,'connexion',2,NULL,'2025-05-06 20:19:24'),(298,'création consultation',2,NULL,'2025-05-06 20:19:48'),(299,'création consultation',2,NULL,'2025-05-06 20:20:34'),(300,'création consultation',2,NULL,'2025-05-06 20:21:15'),(301,'création consultation',2,NULL,'2025-05-06 20:22:26'),(302,'création consultation',2,NULL,'2025-05-06 20:31:40'),(303,'création consultation',2,NULL,'2025-05-06 20:40:18'),(304,'création consultation',2,NULL,'2025-05-06 20:41:11'),(305,'création dossier',2,NULL,'2025-05-06 20:49:26'),(306,'modification dossier',2,NULL,'2025-05-06 20:49:36'),(307,'création consultation',2,NULL,'2025-05-06 20:49:48'),(308,'mise à jour consultation',2,NULL,'2025-05-06 21:17:56'),(309,'connexion',9,NULL,'2025-05-06 21:18:37'),(310,'connexion',2,NULL,'2025-05-06 21:25:08'),(311,'mise à jour consultation',2,NULL,'2025-05-06 21:25:29'),(312,'modification dossier',2,NULL,'2025-05-06 21:25:36'),(313,'mise à jour consultation',2,NULL,'2025-05-06 21:26:21'),(314,'connexion',9,NULL,'2025-05-06 21:26:38'),(315,'connexion',10,NULL,'2025-05-06 21:29:21'),(316,'annulation rendez-vous',10,NULL,'2025-05-06 22:20:06'),(317,'connexion',2,NULL,'2025-05-06 22:29:32'),(318,'mise à jour consultation',2,NULL,'2025-05-06 22:29:59'),(319,'connexion',9,NULL,'2025-05-06 22:30:22'),(320,'connexion',10,NULL,'2025-05-06 22:38:57'),(321,'connexion',2,NULL,'2025-05-06 22:40:31'),(322,'connexion',2,NULL,'2025-05-06 23:47:18'),(323,'connexion',2,NULL,'2025-05-07 00:59:38'),(324,'connexion',2,NULL,'2025-05-07 01:59:17'),(325,'connexion',2,NULL,'2025-05-07 02:12:01'),(326,'connexion',9,NULL,'2025-05-07 17:13:10'),(327,'connexion',9,NULL,'2025-05-07 17:29:33'),(328,'connexion',2,NULL,'2025-05-07 17:33:35'),(329,'assignation rendez-vous à infirmier',2,NULL,'2025-05-07 17:33:47'),(330,'connexion',9,NULL,'2025-05-07 17:34:11'),(331,'connexion',10,NULL,'2025-05-07 17:37:31'),(332,'connexion',2,NULL,'2025-05-07 17:40:07'),(333,'connexion',10,NULL,'2025-05-07 17:53:04'),(334,'connexion',9,NULL,'2025-05-07 18:24:18'),(335,'connexion',2,NULL,'2025-05-10 20:13:15'),(336,'connexion',2,NULL,'2025-05-11 17:43:28'),(337,'connexion',9,NULL,'2025-05-11 18:02:00'),(338,'acceptation rendez-vous',9,NULL,'2025-05-11 18:04:57'),(339,'connexion',2,NULL,'2025-05-11 18:05:36'),(340,'connexion',2,NULL,'2025-05-11 18:16:26'),(341,'connexion',2,NULL,'2025-05-11 19:35:13'),(342,'connexion',2,NULL,'2025-05-11 21:32:24'),(343,'connexion',2,NULL,'2025-05-11 22:33:48'),(344,'connexion',2,NULL,'2025-05-11 23:32:46'),(345,'connexion',2,NULL,'2025-05-11 23:46:22'),(346,'connexion',2,NULL,'2025-05-11 23:50:20'),(347,'connexion',10,NULL,'2025-05-11 23:50:53'),(348,'prise de rendez-vous',10,NULL,'2025-05-11 23:51:41'),(349,'connexion',2,NULL,'2025-05-11 23:52:08'),(350,'connexion',2,NULL,'2025-05-13 08:28:13'),(351,'connexion',9,NULL,'2025-05-13 08:36:45'),(352,'connexion',2,NULL,'2025-05-29 14:31:41'),(353,'modification dossier',2,NULL,'2025-05-29 14:32:10'),(354,'connexion',9,NULL,'2025-05-29 16:17:14'),(355,'modification dossier',9,NULL,'2025-05-29 16:18:03'),(356,'connexion',4,NULL,'2025-05-29 17:05:16'),(357,'connexion',2,NULL,'2025-05-29 17:06:24'),(358,'connexion',2,NULL,'2025-05-29 18:26:42'),(359,'connexion',2,NULL,'2025-05-29 20:08:31'),(360,'connexion',2,NULL,'2025-05-29 20:29:54'),(361,'connexion',2,NULL,'2025-05-29 21:15:23'),(362,'assignation rendez-vous à infirmier',2,NULL,'2025-05-29 21:50:33'),(363,'assignation rendez-vous à infirmier',2,NULL,'2025-05-29 21:51:09'),(364,'partage d’agenda',2,NULL,'2025-05-29 21:51:09'),(365,'connexion',9,NULL,'2025-05-29 22:21:04'),(366,'connexion',9,NULL,'2025-05-30 00:07:54'),(367,'connexion',9,NULL,'2025-05-30 01:09:56'),(368,'connexion',9,NULL,'2025-05-30 02:36:55'),(369,'connexion',2,NULL,'2025-05-30 03:35:07'),(370,'assignation rendez-vous à infirmier',2,NULL,'2025-05-30 03:35:29'),(371,'partage d’agenda',2,NULL,'2025-05-30 03:35:29'),(372,'connexion',9,NULL,'2025-05-30 03:35:44'),(373,'connexion',9,NULL,'2025-05-30 04:18:07');
/*!40000 ALTER TABLE `tracabilite` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `utilisateur`
--

DROP TABLE IF EXISTS `utilisateur`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `utilisateur` (
  `idUtilisateur` int(11) NOT NULL AUTO_INCREMENT,
  `nom` varchar(255) NOT NULL,
  `prenom` varchar(255) NOT NULL,
  `role` enum('Médecin','Infirmier','Admin','Patient') NOT NULL,
  `identifiant` varchar(255) NOT NULL,
  `motDePasse` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `telephone` varchar(20) NOT NULL,
  `idHopital` int(11) DEFAULT NULL,
  `sexe` varchar(10) DEFAULT NULL,
  `dateNaissance` date DEFAULT NULL,
  PRIMARY KEY (`idUtilisateur`),
  UNIQUE KEY `identifiant` (`identifiant`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `telephone` (`telephone`),
  KEY `idHopital` (`idHopital`),
  CONSTRAINT `utilisateur_ibfk_1` FOREIGN KEY (`idHopital`) REFERENCES `hopital` (`idHopital`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `utilisateur`
--

LOCK TABLES `utilisateur` WRITE;
/*!40000 ALTER TABLE `utilisateur` DISABLE KEYS */;
INSERT INTO `utilisateur` VALUES (1,'NDIAYEEEEE','Assietou','Patient','ANDIAYE8955','$2b$10$GK0XPCn1Sqf.2xP3wN7xEuyw4UpwLjpeb8U6AEMZHP93sNUYRTY.W','assy@esp.sn','123569',NULL,NULL,NULL),(2,'KANDJI','Cheikhouna','Médecin','ckandji','$2b$10$1zWKbe42bK5ze.H022IDf.3h4PnhfhMNpi0PK9zgEF4nhznNeu5li','abdoulazizkandji@esp.sn','77000000653',1,NULL,NULL),(3,'DIOUM','Mariama','Infirmier','mdioum','$2b$10$1zWKbe42bK5ze.H022IDf.3h4PnhfhMNpi0PK9zgEF4nhznNeu5li','mdioum@esp.sn','7700000026',3,NULL,NULL),(4,'Super','Admin','Admin','superadmin','$2b$10$1zWKbe42bK5ze.H022IDf.3h4PnhfhMNpi0PK9zgEF4nhznNeu5li','superadmin@esp.sn','770000003',NULL,NULL,NULL),(5,'GUEYE','Yacine','Infirmier','YGUEYE6763','$2b$10$OZOpznkj953HXZjgOWvRYuc1T2Ltbl6nfvvelA27ZwU3zOB3ZhUJW','yacine@esp.sn','1234',1,NULL,NULL),(7,'Diagne','Amina','Patient','ADiagne8218','$2b$10$8bsKGwlUWdR8tpEvd07kMerAPGvsZfHs1i0jYTBfYDCXrPubQ4a5S','amina@esp.sn','12',NULL,NULL,NULL),(9,'SAGNE','Aicha','Infirmier','ASAGNE3081','$2b$10$zSSCBn/Y4qZstJmA.CZUO.q5rkNAEHDO5RCPPMHWJnA6Y1I3RFnke','aicha@esp.sn','123456',1,NULL,NULL),(10,'NDIAYE','Assietou','Patient','ANDIAYE7737','$2b$10$mgbxbTiXLEOzuTvUtQx7GudujJSELIy7PDnBQRtl2dpkHHnZ9n.7W','assietoundiaye1@esp.sn','1234564',NULL,NULL,NULL),(11,'DIOUM','Marie','Médecin','MDIOUM43','$2b$10$rCBnDJS/1HXuLpk/khkcheOduqb3KAe/1b65xx3aQC2QIOKy9gV62','mariamadioum@esp.sn','777777779',1,NULL,NULL),(12,'TEST','Test','Patient','TTEST1783','$2b$10$dy4/TL3jO8ZRKG1pMhCNMuQiBfQqetE70PLk3cMMERDRM.S7JjuQ.','test@esp.sn','12309',NULL,NULL,NULL);
/*!40000 ALTER TABLE `utilisateur` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-05-30 14:09:28
