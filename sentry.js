const { sentryDSN } = require("./constants").constants;
const sentry = require("@sentry/node");

// Initialize Sentry only if DSN is configured
if (sentryDSN != null) {

  sentry.init({
    dsn: sentryDSN,
  });

  module.exports = sentry;
} else {
  // So Sentry methods can be conditionally called in other modules
  module.exports = false;
}

