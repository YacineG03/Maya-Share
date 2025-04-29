// const Image = require('../mayashare-backend/models/imageModel');
// const axios = require('axios');

// const updateExistingImages = async () => {
//     Image.findAll((err, images) => {
//         if (err) {
//             console.error('Erreur lors de la récupération des images:', err);
//             return;
//         }

//         const dicomImages = images.filter(image => image.nomFichier.toLowerCase().endsWith('.dcm') && image.metadonnees);
//         console.log(`Found ${dicomImages.length} DICOM images to update.`);

//         dicomImages.forEach(image => {
//             const metadonnees = JSON.parse(image.metadonnees);
//             if (!metadonnees.orthancId || (metadonnees.studyInstanceUID && metadonnees.seriesInstanceUID)) {
//                 console.log(`Skipping image ${image.idImage}: No orthancId or already has studyInstanceUID and seriesInstanceUID`);
//                 return;
//             }

//             axios.get(`http://172.20.10.5:8042/instances/${metadonnees.orthancId}`)
//                 .then(instanceResponse => {
//                     const studyId = instanceResponse.data.ParentStudy;
//                     const seriesId = instanceResponse.data.ParentSeries;

//                     // Si studyId ou seriesId est absent, on stocke quand même l’orthancId
//                     if (!studyId || !seriesId) {
//                         console.log(`No ParentStudy or ParentSeries for image ${image.idImage}, saving orthancId only`);
//                         const updatedMetadonnees = JSON.stringify({
//                             ...metadonnees,
//                             orthancId: metadonnees.orthancId
//                         });

//                         Image.updateMetadonnees(image.idImage, updatedMetadonnees, (err) => {
//                             if (err) {
//                                 console.error(`Erreur lors de la mise à jour de l’image ${image.idImage}:`, err);
//                             } else {
//                                 console.log(`Updated image ${image.idImage} with orthancId only`);
//                             }
//                         });
//                         return;
//                     }

//                     axios.get(`http://172.20.10.5:8042/studies/${studyId}`)
//                         .then(studyResponse => {
//                             const studyInstanceUID = studyResponse.data.MainDicomTags.StudyInstanceUID;
//                             if (!studyInstanceUID) {
//                                 console.log(`No StudyInstanceUID for image ${image.idImage}`);
//                                 return;
//                             }

//                             axios.get(`http://172.20.10.5:8042/series/${seriesId}`)
//                                 .then(seriesResponse => {
//                                     const seriesInstanceUID = seriesResponse.data.MainDicomTags.SeriesInstanceUID;
//                                     if (!seriesInstanceUID) {
//                                         console.log(`No SeriesInstanceUID for image ${image.idImage}`);
//                                         return;
//                                     }

//                                     const updatedMetadonnees = JSON.stringify({
//                                         ...metadonnees,
//                                         studyInstanceUID: studyInstanceUID,
//                                         seriesInstanceUID: seriesInstanceUID,
//                                     });

//                                     Image.updateMetadonnees(image.idImage, updatedMetadonnees, (err) => {
//                                         if (err) {
//                                             console.error(`Erreur lors de la mise à jour de l’image ${image.idImage}:`, err);
//                                         } else {
//                                             console.log(`Updated image ${image.idImage} with StudyInstanceUID ${studyInstanceUID} and SeriesInstanceUID ${seriesInstanceUID}`);
//                                         }
//                                     });
//                                 })
//                                 .catch(err => {
//                                     console.error(`Erreur lors de la récupération de la série pour l’image ${image.idImage}:`, err.message);
//                                 });
//                         })
//                         .catch(err => {
//                             console.error(`Erreur lors de la récupération de l’étude pour l’image ${image.idImage}:`, err.message);
//                         });
//                 })
//                 .catch(err => {
//                     console.error(`Erreur lors de la récupération de l’instance pour l’image ${image.idImage}:`, err.message);
//                 });
//         });
//     });
// };

// updateExistingImages();

const Image = require('../mayashare-backend/models/imageModel');
const axios = require('axios');
require('dotenv').config();

const updateExistingImages = async () => {
    const username = process.env.ORTHANC_USERNAME || 'mayashare';
    const password = process.env.ORTHANC_PASSWORD || 'passer';
    const auth = Buffer.from(`${username}:${password}`).toString('base64');
    const orthancUrl = process.env.ORTHANC_URL || 'http://172.20.10.5:8042';

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

            axios.get(`${orthancUrl}/instances/${metadonnees.orthancId}`, {
                headers: {
                    'Authorization': `Basic ${auth}`
                }
            })
                .then(instanceResponse => {
                    const studyId = instanceResponse.data.ParentStudy;
                    const seriesId = instanceResponse.data.ParentSeries;

                    if (!studyId || !seriesId) {
                        console.log(`No ParentStudy or ParentSeries for image ${image.idImage}, saving"># OrthancId only`);
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

                    axios.get(`${orthancUrl}/studies/${studyId}`, {
                        headers: {
                            'Authorization': `Basic ${auth}`
                        }
                    })
                        .then(studyResponse => {
                            const studyInstanceUID = studyResponse.data.MainDicomTags.StudyInstanceUID;
                            if (!studyInstanceUID) {
                                console.log(`No StudyInstanceUID for image ${image.idImage}`);
                                return;
                            }

                            axios.get(`${orthancUrl}/series/${seriesId}`, {
                                headers: {
                                    'Authorization': `Basic ${auth}`
                                }
                            })
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
                                    console.error(`Erreur lors de la récupération de la série pour l’image ${image.idImage}:`, {
                                        message: err.message,
                                        status: err.response?.status,
                                        statusText: err.response?.statusText
                                    });
                                });
                        })
                        .catch(err => {
                            console.error(`Erreur lors de la récupération de l’étude pour l’image ${image.idImage}:`, {
                                message: err.message,
                                status: err.response?.status,
                                statusText: err.response?.statusText
                            });
                        });
                })
                .catch(err => {
                    console.error(`Erreur lors de la récupération de l’instance pour l’image ${image.idImage}:`, {
                        message: err.message,
                        status: err.response?.status,
                        statusText: err.response?.statusText
                    });
                });
        });
    });
};

updateExistingImages();