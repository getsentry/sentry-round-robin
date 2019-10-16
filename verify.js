const crypto = require('crypto');

function verifySignature(request) {
  // See: https://docs.sentry.io/workflow/integrations/integration-platform/webhooks/#verifying-the-signature
  const hmac = crypto.createHmac("sha256", process.env.SENTRY_API_SECRET);
  hmac.update(JSON.stringify(request.body), 'utf8');
  const digest = hmac.digest('hex');
  return digest === request.headers["sentry-hook-signature"];
}

module.exports = verifySignature;