function ok(res, data, status = 200) {
  return res.status(status).json(data);
}

function created(res, data) {
  return res.status(201).json(data);
}

function noContent(res) {
  return res.status(204).send();
}

function badRequest(res, message, details = []) {
  return res.status(400).json({ message, details });
}

function notFound(res, entity = "Ressource") {
  return res.status(404).json({ message: `${entity} introuvable` });
}

function internalError(res, error, fallbackMessage = "Erreur interne du serveur") {
  const message = error?.message || fallbackMessage;
  return res.status(500).json({ message });
}

module.exports = { ok, created, noContent, badRequest, notFound, internalError };
