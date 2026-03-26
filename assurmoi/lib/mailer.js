const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST || 'mailhog',
  port: Number(process.env.MAIL_PORT || 1025),
  secure: false,
  auth: process.env.MAIL_USER
    ? {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASSWORD,
      }
    : undefined,
});

async function sendMail({ to, subject, text, html }) {
  return transporter.sendMail({
    from: process.env.MAIL_FROM || 'no-reply@assurmoi.local',
    to,
    subject,
    text,
    html,
  });
}

module.exports = { transporter, sendMail };
