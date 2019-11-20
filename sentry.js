const sentry = require("@sentry/node");

// Initialize Sentry only if DSN is configured
if (process.env.SENTRY_DSN != null) {

  sentry.init({
    dsn: process.env.SENTRY_DSN,
  });

  module.exports = sentry;
} else {
  // So Sentry methods can be conditionally called in other modules
  module.exports = false;
}

