const { sendMail } = require("../lib/mailer");

const MAILHOG_UI_URL = process.env.MAILHOG_UI_URL || "http://localhost:8025";

function formatRecipient(recipient) {
  if (!recipient) return "";
  if (Array.isArray(recipient)) {
    return recipient.join(", ");
  }
  return recipient;
}

async function deliverMail({ to, subject, text, html }) {
  const info = await sendMail({ to, subject, text, html });

  console.log(
    `[mail] message sent to ${formatRecipient(to)} (${info.messageId}). MailHog: ${MAILHOG_UI_URL}`,
  );

  return info;
}

async function sendTwoFactorCodeEmail(user, code) {
  const fullName = [user.prenom, user.nom].filter(Boolean).join(" ").trim() || user.email;
  const subject = "Votre code de double authentification AssurMoi";
  const text = [
    `Bonjour ${fullName},`,
    "",
    "Voici votre code de double authentification AssurMoi :",
    code,
    "",
    "Ce code expire dans 10 minutes.",
    "Si vous n'etes pas a l'origine de cette demande, vous pouvez ignorer cet email.",
  ].join("\n");
  const html = `
    <p>Bonjour ${fullName},</p>
    <p>Voici votre code de double authentification AssurMoi :</p>
    <p style="font-size: 24px; font-weight: bold; letter-spacing: 4px;">${code}</p>
    <p>Ce code expire dans 10 minutes.</p>
    <p>Si vous n'etes pas a l'origine de cette demande, vous pouvez ignorer cet email.</p>
  `;

  return deliverMail({
    to: user.email,
    subject,
    text,
    html,
  });
}

async function sendPasswordResetEmail(user, token) {
  const fullName = [user.prenom, user.nom].filter(Boolean).join(" ").trim() || user.email;
  const subject = "Reinitialisation de votre mot de passe AssurMoi";
  const text = [
    `Bonjour ${fullName},`,
    "",
    "Une demande de reinitialisation de mot de passe a ete effectuee.",
    "Utilisez le token suivant pour poursuivre la procedure :",
    token,
    "",
    "Ce token expire dans 1 heure.",
    "Si vous n'etes pas a l'origine de cette demande, ignorez cet email.",
  ].join("\n");
  const html = `
    <p>Bonjour ${fullName},</p>
    <p>Une demande de reinitialisation de mot de passe a ete effectuee.</p>
    <p>Utilisez le token suivant pour poursuivre la procedure :</p>
    <p style="font-size: 18px; font-weight: bold; word-break: break-all;">${token}</p>
    <p>Ce token expire dans 1 heure.</p>
    <p>Si vous n'etes pas a l'origine de cette demande, ignorez cet email.</p>
  `;

  return deliverMail({
    to: user.email,
    subject,
    text,
    html,
  });
}

async function sendWelcomeEmail(user) {
  const fullName = [user.prenom, user.nom].filter(Boolean).join(" ").trim() || user.email;
  const subject = "Bienvenue sur AssurMoi";
  const text = [
    `Bonjour ${fullName},`,
    "",
    "Votre compte AssurMoi a bien ete cree.",
    "Vous pouvez maintenant vous connecter a la plateforme avec votre adresse email.",
    "",
    "Si vous n'etes pas a l'origine de cette creation de compte, merci de contacter un administrateur.",
  ].join("\n");
  const html = `
    <p>Bonjour ${fullName},</p>
    <p>Votre compte AssurMoi a bien ete cree.</p>
    <p>Vous pouvez maintenant vous connecter a la plateforme avec votre adresse email.</p>
    <p>Si vous n'etes pas a l'origine de cette creation de compte, merci de contacter un administrateur.</p>
  `;

  return deliverMail({
    to: user.email,
    subject,
    text,
    html,
  });
}

async function sendTestEmail({ to, subject, text, html }) {
  const resolvedSubject = subject || "Email de test AssurMoi";
  const resolvedText =
    text ||
    [
      "Ceci est un email de test envoye depuis l'API AssurMoi.",
      "Si vous lisez ce message dans MailHog, la configuration SMTP fonctionne.",
    ].join("\n");
  const resolvedHtml =
    html ||
    `
      <p>Ceci est un email de test envoye depuis l'API AssurMoi.</p>
      <p>Si vous lisez ce message dans MailHog, la configuration SMTP fonctionne.</p>
    `;

  return deliverMail({
    to,
    subject: resolvedSubject,
    text: resolvedText,
    html: resolvedHtml,
  });
}

module.exports = {
  deliverMail,
  sendTestEmail,
  sendTwoFactorCodeEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
};
