const crypto = require('crypto');

function verifySignature(request, secret='') {
  // See: https://docs.sentry.io/workflow/integrations/integration-platform/webhooks/#verifying-the-signature
  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(JSON.stringify(request.body), 'utf8');
  const digest = hmac.digest('hex');
  console.log(digest);
  return digest === request.headers["sentry-hook-signature"];
}

module.exports = verifySignature;