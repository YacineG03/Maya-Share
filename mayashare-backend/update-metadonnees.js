const Image = require('../mayashare-backend/models/imageModel');
const axios = require('axios');

const updateExistingImages = async () => {
    Image.findAll((err, images) => {
        if (err) {
            console.error('Erreur lors de la récupération des images:', err);
            return;
        }

        const dicomImages = images.filter(image => image.nomFichier.toLowerCase().endsWith('.dcm') && image.metadonnees);
        console.log(`Found ${dicomImages.length} DICOM images to update.`);

        dicomImages.forEach(image => {
            const metadonnees = JSON.parse(image.metadonnees);
            if (!metadonnees.orthancId || (metadonnees.studyInstanceUID && metadonnees.seriesInstanceUID)) {
                console.log(`Skipping image ${image.idImage}: No orthancId or already has studyInstanceUID and seriesInstanceUID`);
                return;
            }

            axios.get(`http://localhost:8042/instances/${metadonnees.orthancId}`)
                .then(instanceResponse => {
                    const studyId = instanceResponse.data.ParentStudy;
                    const seriesId = instanceResponse.data.ParentSeries;

                    // Si studyId ou seriesId est absent, on stocke quand même l’orthancId
                    if (!studyId || !seriesId) {
                        console.log(`No ParentStudy or ParentSeries for image ${image.idImage}, saving orthancId only`);
                        const updatedMetadonnees = JSON.stringify({
                            ...metadonnees,
                            orthancId: metadonnees.orthancId
                        });

                        Image.updateMetadonnees(image.idImage, updatedMetadonnees, (err) => {
                            if (err) {
                                console.error(`Erreur lors de la mise à jour de l’image ${image.idImage}:`, err);
                            } else {
                                console.log(`Updated image ${image.idImage} with orthancId only`);
                            }
                        });
                        return;
                    }

                    axios.get(`http://localhost:8042/studies/${studyId}`)
                        .then(studyResponse => {
                            const studyInstanceUID = studyResponse.data.MainDicomTags.StudyInstanceUID;
                            if (!studyInstanceUID) {
                                console.log(`No StudyInstanceUID for image ${image.idImage}`);
                                return;
                            }

                            axios.get(`http://localhost:8042/series/${seriesId}`)
                                .then(seriesResponse => {
                                    const seriesInstanceUID = seriesResponse.data.MainDicomTags.SeriesInstanceUID;
                                    if (!seriesInstanceUID) {
                                        console.log(`No SeriesInstanceUID for image ${image.idImage}`);
                                        return;
                                    }

                                    const updatedMetadonnees = JSON.stringify({
                                        ...metadonnees,
                                        studyInstanceUID: studyInstanceUID,
                                        seriesInstanceUID: seriesInstanceUID,
                                    });

                                    Image.updateMetadonnees(image.idImage, updatedMetadonnees, (err) => {
                                        if (err) {
                                            console.error(`Erreur lors de la mise à jour de l’image ${image.idImage}:`, err);
                                        } else {
                                            console.log(`Updated image ${image.idImage} with StudyInstanceUID ${studyInstanceUID} and SeriesInstanceUID ${seriesInstanceUID}`);
                                        }
                                    });
                                })
                                .catch(err => {
                                    console.error(`Erreur lors de la récupération de la série pour l’image ${image.idImage}:`, err.message);
                                });
                        })
                        .catch(err => {
                            console.error(`Erreur lors de la récupération de l’étude pour l’image ${image.idImage}:`, err.message);
                        });
                })
                .catch(err => {
                    console.error(`Erreur lors de la récupération de l’instance pour l’image ${image.idImage}:`, err.message);
                });
        });
    });
};

updateExistingImages();