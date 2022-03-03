const nodemailer = require('nodemailer');

const smtpTransport = nodemailer.createTransport({
    service: 'Naver',
    host: 'smtp.naver.com',
    port: 587,
    auth: {
        user: process.env.USER_EMAIL,
        pass: process.env.USER_EMAIL_PASSWD
    },
    tls: {
        rejectUnauthorized: false
    }
});

module.exports = {
    smtpTransport
}