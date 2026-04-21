const { ok, internalError, badRequest } = require("../utils/http");
const { sendTestEmail } = require("./mail");

async function sendTestMail(req, res) {
  try {
    const to = req.body.to || req.user?.email;
    if (!to) {
      return badRequest(res, "Aucun destinataire disponible");
    }

    const info = await sendTestEmail({
      to,
      subject: req.body.subject,
      text: req.body.text,
      html: req.body.html,
    });

    return ok(res, {
      message: "Email de test envoye",
      data: {
        to,
        messageId: info.messageId,
      },
    });
  } catch (error) {
    return internalError(res, error);
  }
}

module.exports = { sendTestMail };
