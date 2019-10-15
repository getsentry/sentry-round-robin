const crypto = require('crypto');

function verifySignature(request) {
  // See: https://docs.sentry.io/workflow/integrations/integration-platform/webhooks/#verifying-the-signature
  const hmac = crypto.createHmac("sha256", process.env.SENTRY_API_SECRET);
  const expected = hmac.update(JSON.stringify(request.body), 'utf8');
  return hmac.digest('hex') === request.headers["Sentry-Hook-Signature"];
}

module.exports = verifySignature;