const { sentryDSN, sentryRelease } = require("./constants").constants;
const sentry = require("@sentry/node");

// Initialize Sentry only if DSN is configured
if (sentryDSN) {

  const sentryConfig = {
    dsn: sentryDSN
  };

  // Only set a release if defined in env vars (or .env)
  if (sentryRelease) {
    sentryConfig.release = sentryRelease
  }

  sentry.init(sentryConfig);

  module.exports = sentry;
} else {
  // So Sentry methods can be conditionally called in other modules
  module.exports = false;
}

