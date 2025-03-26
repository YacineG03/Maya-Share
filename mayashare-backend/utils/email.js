const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    service: 'gmail', // Ou un autre service (ex. SendGrid, Mailgun)
    auth: {
        user: process.env.EMAIL_USER, // Ton adresse e-mail
        pass: process.env.EMAIL_PASS  // Ton mot de passe ou clé d’application
    }
});

const sendEmail = (to, subject, text) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject,
        text
    };

    return transporter.sendMail(mailOptions);
};

module.exports = sendEmail;