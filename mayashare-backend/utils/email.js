// const nodemailer = require('nodemailer');
// require('dotenv').config();

// const transporter = nodemailer.createTransport({
//     service: 'gmail', // Ou un autre service (ex. SendGrid, Mailgun)
//     auth: {
//         user: process.env.EMAIL_USER, // Ton adresse e-mail
//         pass: process.env.EMAIL_PASS  // Ton mot de passe ou clé d’application
//     }
// });

// const sendEmail = (to, subject, text) => {
//     const mailOptions = {
//         from: process.env.EMAIL_USER,
//         to,
//         subject,
//         text
//     };

//     return transporter.sendMail(mailOptions);
// };

// module.exports = sendEmail;
const nodemailer = require('nodemailer');

const sendEmail = async (to, subject, text) => {
    try {
        // Créer un transporteur SMTP
        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            secure: process.env.EMAIL_PORT == 465, // true pour 465 (SSL), false pour 587 (TLS)
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        // Définir les options de l'e-mail
        const mailOptions = {
            from: `"Maya Share" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            text,
        };

        // Envoyer l'e-mail
        await transporter.sendMail(mailOptions);
        console.log(`E-mail envoyé avec succès à ${to}`);
    } catch (error) {
        console.error('Erreur lors de l’envoi de l’e-mail:', error);
        throw error;
    }
};

module.exports = sendEmail;