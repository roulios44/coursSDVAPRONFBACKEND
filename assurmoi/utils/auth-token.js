const crypto = require("crypto");

const TOKEN_TTL_HOURS = Number(process.env.AUTH_TOKEN_TTL_HOURS || 12);

function getSecret() {
  return process.env.AUTH_TOKEN_SECRET || "assurmoi-dev-secret";
}

function toBase64Url(value) {
  return Buffer.from(value).toString("base64url");
}

function fromBase64Url(value) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function signPayload(encodedPayload) {
  return crypto.createHmac("sha256", getSecret()).update(encodedPayload).digest("base64url");
}

function buildAuthPayload(user) {
  return {
    utilisateur_id: user.id,
    email: user.email,
    role_id: user.role_id,
    exp: Date.now() + TOKEN_TTL_HOURS * 60 * 60 * 1000,
  };
}

function serializeAuthPayload(payload) {
  const encodedPayload = toBase64Url(JSON.stringify(payload));
  const signature = signPayload(encodedPayload);
  return `${encodedPayload}.${signature}`;
}

function generateAuthToken(user) {
  return serializeAuthPayload(buildAuthPayload(user));
}

function generateAuthTokenDetails(user) {
  const payload = buildAuthPayload(user);
  return {
    payload,
    token: serializeAuthPayload(payload),
    expiresAt: new Date(payload.exp),
  };
}

function hashAuthToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function parseAuthToken(token) {
  if (!token || !token.includes(".")) {
    return null;
  }

  const [encodedPayload, signature] = token.split(".");
  if (!encodedPayload || !signature) {
    return null;
  }

  return { encodedPayload, signature };
}

function verifyAuthToken(token) {
  const parts = parseAuthToken(token);
  if (!parts) {
    return null;
  }

  const { encodedPayload, signature } = parts;

  const expectedSignature = signPayload(encodedPayload);
  if (signature.length !== expectedSignature.length) {
    return null;
  }
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
    return null;
  }

  const payload = JSON.parse(fromBase64Url(encodedPayload));
  if (!payload.exp || payload.exp < Date.now()) {
    return null;
  }

  return payload;
}

module.exports = { generateAuthToken, generateAuthTokenDetails, verifyAuthToken, hashAuthToken };
