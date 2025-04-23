import React, { useEffect, useRef } from 'react';
import * as cornerstone from 'cornerstone-core';
import * as cornerstoneWADOImageLoader from 'cornerstone-wado-image-loader';
import dicomParser from 'dicom-parser';

// Initialiser Cornerstone WADO Image Loader
cornerstoneWADOImageLoader.external.cornerstone = cornerstone;
cornerstoneWADOImageLoader.external.dicomParser = dicomParser;

const DicomViewer = ({ dicomWebUrl }) => {
  const elementRef = useRef(null);

  useEffect(() => {
    if (!dicomWebUrl) {
      console.error('Erreur: dicomWebUrl est vide ou non défini');
      return;
    }

    console.log('Tentative de chargement de l\'image DICOM:', dicomWebUrl);

    // Activer l'élément pour Cornerstone
    const element = elementRef.current;
    cornerstone.enable(element);

    // Charger et afficher l'image DICOM
    cornerstone.loadImage(dicomWebUrl).then(
      (image) => {
        console.log('Image DICOM chargée avec succès:', image);
        cornerstone.displayImage(element, image);

        // Ajuster les niveaux de fenêtre pour s'assurer que l'image est visible
        const viewport = cornerstone.getDefaultViewportForImage(element, image);
        viewport.voi.windowWidth = image.windowWidth || 256; // Ajuster selon le fichier DICOM
        viewport.voi.windowCenter = image.windowCenter || 128;
        console.log('Niveaux de fenêtre appliqués:', viewport.voi);
        cornerstone.setViewport(element, viewport);
        cornerstone.updateImage(element);
      },
      (error) => {
        console.error('Erreur lors du chargement de l\'image DICOM:', error);
      }
    );

    // Nettoyer lors du démontage du composant
    return () => {
      cornerstone.disable(element);
    };
  }, [dicomWebUrl]);

  return (
    <div
      ref={elementRef}
      style={{ width: '512px', height: '512px', background: 'black' }}
    />
  );
};

export default DicomViewer;