const nodemailer = require("nodemailer");

const MAIL_HOST = process.env.MAIL_HOST || "mailhog";
const MAIL_PORT = Number(process.env.MAIL_PORT || 1025);
const MAIL_SECURE = String(process.env.MAIL_SECURE || "false") === "true";
const MAIL_FROM = process.env.MAIL_FROM || "no-reply@assurmoi.local";

const transporter = nodemailer.createTransport({
  host: MAIL_HOST,
  port: MAIL_PORT,
  secure: MAIL_SECURE,
  auth: process.env.MAIL_USER
    ? {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASSWORD,
      }
    : undefined,
});

async function sendMail({ from = MAIL_FROM, to, subject, text, html }) {
  return transporter.sendMail({
    from,
    to,
    subject,
    text,
    html,
  });
}

module.exports = {
  MAIL_FROM,
  MAIL_HOST,
  MAIL_PORT,
  transporter,
  sendMail,
};
